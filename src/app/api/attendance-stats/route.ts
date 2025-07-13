import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
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
            range: 'Sheet1!A:F',
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

        const checkedInToday = new Set<string>();
        const checkedOutToday = new Set<string>();

        // Duyệt qua tất cả các dòng để đếm
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowEmail = row[0];
            const rowTimestamp = row[2]; // Cột C: Thời gian check-in
            const rowCheckoutTime = row[4]; // Cột E: Thời gian checkout

            if (rowEmail) {
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
                            checkedInToday.add(rowEmail);
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
                            checkedOutToday.add(rowEmail);
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                checkedInCount: checkedInToday.size,
                checkedOutCount: checkedOutToday.size,
                date: todayString,
                totalRecords: rows.length - 1 // Trừ header
            }
        });

    } catch (error) {
        console.error('❌ Lỗi lấy thống kê chấm công:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi lấy thống kê chấm công'
        }, { status: 500 });
    }
}