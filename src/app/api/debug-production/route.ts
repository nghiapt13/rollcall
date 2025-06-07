import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
        console.log('🔍 Debug Production Environment');

        const debugInfo = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            region: process.env.VERCEL_REGION || 'unknown',
            
            // Kiểm tra environment variables
            env: {
                hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
                hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
                hasSheetId: !!process.env.GOOGLE_SHEET_ID,
                clientEmailLength: process.env.GOOGLE_CLIENT_EMAIL?.length || 0,
                privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
                privateKeyFormat: {
                    hasBeginMarker: process.env.GOOGLE_PRIVATE_KEY?.includes('-----BEGIN PRIVATE KEY-----') || false,
                    hasEndMarker: process.env.GOOGLE_PRIVATE_KEY?.includes('-----END PRIVATE KEY-----') || false,
                    hasNewlines: process.env.GOOGLE_PRIVATE_KEY?.includes('\\n') || false,
                }
            },
            
            authTest: null as { success: true; clientType: string; hasAccessToken: boolean; tokenLength: number } | { success: false; error: string; errorType: string } | null,
            sheetsTest: null as { success: true; sheetTitle?: string; canRead: boolean; canReadValues?: boolean; headerRow?: unknown[] } | { success: false; error: string; errorType: string } | null,
            error: null as string | null
        };

        // Kiểm tra biến môi trường
        if (!process.env.GOOGLE_CLIENT_EMAIL) {
            debugInfo.error = 'GOOGLE_CLIENT_EMAIL not set';
            return NextResponse.json(debugInfo);
        }

        if (!process.env.GOOGLE_PRIVATE_KEY) {
            debugInfo.error = 'GOOGLE_PRIVATE_KEY not set';
            return NextResponse.json(debugInfo);
        }

        if (!process.env.GOOGLE_SHEET_ID) {
            debugInfo.error = 'GOOGLE_SHEET_ID not set';
            return NextResponse.json(debugInfo);
        }

        // Test Google Auth
        try {
            console.log('🔐 Testing Google Auth...');
            
            const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                .replace(/"/g, '')
                .trim();
                
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: privateKey,
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            const client = await auth.getClient();
            const accessToken = await auth.getAccessToken();
            
            debugInfo.authTest = {
                success: true,
                clientType: client.constructor.name,
                hasAccessToken: !!accessToken,
                tokenLength: accessToken?.length || 0
            };

            console.log('✅ Google Auth test successful');

            // Test Sheets API
            try {
                console.log('📊 Testing Sheets API...');
                
                const sheets = google.sheets({ version: 'v4', auth });
                const response = await sheets.spreadsheets.get({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    fields: 'properties.title'
                });

                // Test đọc dữ liệu
                const valuesResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: 'Sheet1!A1:E1',
                });

                debugInfo.sheetsTest = {
                    success: true,
                    sheetTitle: response.data.properties?.title ?? undefined,
                    canRead: true,
                    canReadValues: true,
                    headerRow: valuesResponse.data.values?.[0] || []
                };

                console.log('✅ Sheets API test successful');

            } catch (sheetsError: unknown) {
                const err = sheetsError as Error;
                console.error('❌ Sheets API test failed:', err);
                debugInfo.sheetsTest = {
                    success: false,
                    error: err.message,
                    errorType: err.constructor.name
                };
            }

        } catch (authError: unknown) {
            const err = authError as Error;
            console.error('❌ Google Auth test failed:', err);
            debugInfo.authTest = {
                success: false,
                error: err.message,
                errorType: err.constructor.name
            };
        }

        return NextResponse.json(debugInfo);

    } catch (error: unknown) {
        const err = error as Error;
        console.error('❌ Debug Production API failed:', err);
        return NextResponse.json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 