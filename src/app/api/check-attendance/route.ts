import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
    try {
        const { email, userId } = await request.json();

        console.log('🔍 Kiểm tra trạng thái chấm công:', { email, userId });

        if (!email || !userId) {
            return NextResponse.json({
                success: false,
                error: 'Thiếu thông tin email hoặc userId'
            }, { status: 400 });
        }

        // Cấu hình Google Sheets API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Đọc dữ liệu từ sheet với timeout
        console.log('🔍 Đang đọc dữ liệu từ Google Sheets...');
        const response = await Promise.race([
            sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Sheet1!A:E',
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout after 30 seconds')), 30000)
            )
        ]) as any;

        const rows = response.data.values || [];
        console.log('📊 Tổng số dòng trong sheet:', rows.length);

        // Lấy ngày hôm nay
        const today = new Date();
        const todayString = today.toLocaleDateString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        console.log('📅 Ngày hôm nay:', todayString);

        // Kiểm tra email đã điểm danh hôm nay chưa
        let hasCheckedInToday = false;
        let todayRecord = null;

        for (let i = 1; i < rows.length; i++) { // Bỏ qua header
            const row = rows[i];
            const rowEmail = row[0];
            const rowName = row[1];
            const rowLoginTime = row[2];
            const rowTimestamp = row[3];
            const rowPhotoLink = row[4];

            if (rowEmail === email && rowLoginTime) {
                try {
                    // Parse ngày từ rowLoginTime
                    const dateMatch = rowLoginTime.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                    
                    if (dateMatch) {
                        const [, day, month, year] = dateMatch;
                        const loginDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        
                        const loginDateString = loginDate.toLocaleDateString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });

                        if (loginDateString === todayString) {
                            hasCheckedInToday = true;
                            todayRecord = {
                                email: rowEmail,
                                name: rowName,
                                loginTime: rowLoginTime,
                                timestamp: rowTimestamp,
                                photoLink: rowPhotoLink,
                                rowIndex: i + 1
                            };
                            console.log('✅ Đã tìm thấy bản ghi hôm nay:', todayRecord);
                            break;
                        }
                    }
                } catch (error) {
                    console.log('⚠️ Lỗi parse ngày:', error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            hasCheckedInToday,
            todayRecord,
            checkDate: todayString,
            totalRecords: rows.length - 1, // Trừ header
            message: hasCheckedInToday 
                ? 'Đã chấm công hôm nay' 
                : 'Chưa chấm công hôm nay'
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('❌ Lỗi kiểm tra attendance:', {
            message: err.message,
            name: err.name,
            stack: err.stack,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
        
        // Kiểm tra các lỗi cụ thể
        let errorMessage = 'Lỗi server không xác định';
        let errorCode = 'UNKNOWN_ERROR';
        
        if (err.message?.includes('credentials')) {
            errorMessage = 'Lỗi xác thực Google Sheets API';
            errorCode = 'AUTH_ERROR';
        } else if (err.message?.includes('ENOTFOUND') || err.message?.includes('network')) {
            errorMessage = 'Lỗi kết nối mạng';
            errorCode = 'NETWORK_ERROR';
        } else if (err.message?.includes('timeout')) {
            errorMessage = 'Timeout khi kết nối Google Sheets';
            errorCode = 'TIMEOUT_ERROR';
        } else if (err.message?.includes('404')) {
            errorMessage = 'Không tìm thấy Google Sheet';
            errorCode = 'SHEET_NOT_FOUND';
        } else if (err.message?.includes('403')) {
            errorMessage = 'Không có quyền truy cập Google Sheet';
            errorCode = 'PERMISSION_DENIED';
        }

        return NextResponse.json({
            success: false,
            error: errorMessage,
            errorCode,
            details: err.message,
            debug: {
                hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
                hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
                hasSheetId: !!process.env.GOOGLE_SHEET_ID,
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString()
            }
        }, { status: 500 });
    }
} 