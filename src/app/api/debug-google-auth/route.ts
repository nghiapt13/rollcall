import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
        console.log('🔍 Debug Google Authentication');

        const debugInfo = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
            hasSheetId: !!process.env.GOOGLE_SHEET_ID,
            hasFolderId: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
            clientEmailLength: process.env.GOOGLE_CLIENT_EMAIL?.length || 0,
            privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
            privateKeyStart: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50) || 'N/A',
            authTest: null as { clientType: string; hasAccessToken: boolean; tokenLength: number; scopes: string[] } | { failed: boolean; errorType: string } | null,
            error: null as string | null
        };

        console.log('📊 Environment check:', {
            hasClientEmail: debugInfo.hasClientEmail,
            hasPrivateKey: debugInfo.hasPrivateKey,
            clientEmailLength: debugInfo.clientEmailLength,
            privateKeyLength: debugInfo.privateKeyLength
        });

        if (!process.env.GOOGLE_CLIENT_EMAIL) {
            debugInfo.error = 'GOOGLE_CLIENT_EMAIL not set';
            return NextResponse.json(debugInfo);
        }

        if (!process.env.GOOGLE_PRIVATE_KEY) {
            debugInfo.error = 'GOOGLE_PRIVATE_KEY not set';
            return NextResponse.json(debugInfo);
        }

        // Test Google Auth
        try {
            console.log('🔐 Testing Google Auth...');
            
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive.file',
                    'https://www.googleapis.com/auth/drive'
                ],
            });

            // Test token generation
            const client = await auth.getClient();
            const accessToken = await auth.getAccessToken();
            
            debugInfo.authTest = {
                clientType: client.constructor.name,
                hasAccessToken: !!accessToken,
                tokenLength: accessToken?.length || 0,
                scopes: ['spreadsheets', 'drive.file', 'drive']
            };

            console.log('✅ Google Auth test successful');

        } catch (authError: unknown) {
            const error = authError as Error;
            console.error('❌ Google Auth test failed:', error);
            debugInfo.error = error.message;
            debugInfo.authTest = {
                failed: true,
                errorType: error.constructor.name
            };
        }

        return NextResponse.json(debugInfo);

    } catch (error: unknown) {
        const err = error as Error;
        console.error('❌ Debug API failed:', err);
        return NextResponse.json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 