import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
    try {
        const { email, userId } = await request.json();

        console.log('🔍 Kiểm tra trạng thái checkout');

        if (!email || !userId) {
            return NextResponse.json({
                success: false,
                error: 'Thiếu thông tin email hoặc userId'
            }, { status: 400 });
        }

        // Cấu hình Google Sheets API
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

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Đọc dữ liệu từ sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:F', // Vẫn đọc đến F
        });

        const rows = response.data.values || [];

        // Lấy ngày hôm nay
        const today = new Date();
        const todayString = today.toLocaleDateString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        let hasCheckedInToday = false;
        let hasCheckedOutToday = false;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowEmail = row[0];
            const rowTimestamp = row[2];
            const rowCheckoutTime = row[4]; // Cột E thay vì cột F

            if (rowEmail === email) {
                // Kiểm tra check-in hôm nay
                if (rowTimestamp) {
                    const dateMatch = rowTimestamp.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
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
                        }
                    }
                }

                // Kiểm tra checkout hôm nay
                if (rowCheckoutTime) {
                    const dateMatch = rowCheckoutTime.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                    if (dateMatch) {
                        const [, day, month, year] = dateMatch;
                        const checkoutDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const checkoutDateString = checkoutDate.toLocaleDateString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });

                        if (checkoutDateString === todayString) {
                            hasCheckedOutToday = true;
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            hasCheckedInToday,
            hasCheckedOutToday,
            message: hasCheckedOutToday 
                ? 'Đã checkout hôm nay' 
                : !hasCheckedInToday 
                    ? 'Chưa check-in hôm nay'
                    : 'Có thể checkout'
        });

    } catch (error) {
        console.error('❌ Lỗi kiểm tra checkout:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi kiểm tra trạng thái checkout'
        }, { status: 500 });
    }
}