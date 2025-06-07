import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST() {
    try {
        console.log('🔧 Attempting to fix Google Auth credentials...');

        const privateKey = process.env.GOOGLE_PRIVATE_KEY;
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

        if (!privateKey || !clientEmail) {
            return NextResponse.json({
                success: false,
                error: 'Missing credentials'
            });
        }

        // Try different private key formatting approaches
        const formatAttempts = [
            // Original format
            privateKey,
            
            // Replace \\n with \n
            privateKey.replace(/\\n/g, '\n'),
            
            // Remove all newlines and re-add them properly
            privateKey
                .replace(/\\n/g, '')
                .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
                .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----')
                .replace(/(.{64})/g, '$1\n')
                .replace(/\n\n/g, '\n'),
                
            // Try base64 decode if it's encoded
            (() => {
                try {
                    return Buffer.from(privateKey, 'base64').toString();
                } catch {
                    return privateKey;
                }
            })(),
        ];

        const results = [];

        for (let i = 0; i < formatAttempts.length; i++) {
            const attempt = formatAttempts[i];
            
            try {
                console.log(`🔄 Trying format ${i + 1}...`);
                
                const auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: clientEmail,
                        private_key: attempt,
                    },
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                // Test the auth
                const accessToken = await auth.getAccessToken();
                
                if (accessToken) {
                    console.log(`✅ Format ${i + 1} works!`);
                    
                    // Test with Sheets API
                    const sheets = google.sheets({ version: 'v4', auth });
                    const response = await sheets.spreadsheets.get({
                        spreadsheetId: process.env.GOOGLE_SHEET_ID,
                        fields: 'properties.title'
                    });

                    results.push({
                        formatIndex: i + 1,
                        success: true,
                        tokenLength: accessToken.length,
                        sheetTitle: response.data.properties?.title,
                        keyPreview: attempt.substring(0, 100) + '...'
                    });

                    // Return the working format details
                    return NextResponse.json({
                        success: true,
                        message: `Format ${i + 1} works successfully!`,
                        workingFormat: i + 1,
                        sheetTitle: response.data.properties?.title,
                        recommendations: getRecommendations(i),
                        allResults: results
                    });
                }
                
            } catch (error: unknown) {
                const err = error as Error;
                console.log(`❌ Format ${i + 1} failed:`, err.message);
                results.push({
                    formatIndex: i + 1,
                    success: false,
                    error: err.message,
                    errorType: err.constructor.name
                });
            }
        }

        // If none worked, return diagnostic info
        return NextResponse.json({
            success: false,
            message: 'All format attempts failed',
            attempts: results,
            diagnostics: {
                privateKeyLength: privateKey.length,
                privateKeyStart: privateKey.substring(0, 50),
                privateKeyEnd: privateKey.substring(privateKey.length - 50),
                hasProperHeaders: privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----'),
                clientEmail: clientEmail,
                recommendations: [
                    'Check if Service Account is enabled in Google Cloud Console',
                    'Verify the Service Account has required permissions',
                    'Make sure the private key was copied completely',
                    'Check if Service Account JSON file is valid',
                    'Ensure system time is synchronized'
                ]
            }
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('❌ Fix auth API failed:', err);
        return NextResponse.json({
            success: false,
            error: err.message
        }, { status: 500 });
    }
}

function getRecommendations(formatIndex: number): string[] {
    switch (formatIndex) {
        case 1:
            return ['Your original private key format works. No changes needed.'];
        case 2:
            return [
                'Update your .env.local file to use proper newlines.',
                'Make sure GOOGLE_PRIVATE_KEY has \\n instead of actual newlines in .env file.'
            ];
        case 3:
            return [
                'Your private key needs proper line formatting.',
                'Copy the private key directly from the JSON file without modifications.'
            ];
        case 4:
            return [
                'Your private key was base64 encoded.',
                'Use the decoded version in your environment variables.'
            ];
        default:
            return ['No specific recommendations for this format.'];
    }
} 