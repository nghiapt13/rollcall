import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
    try {
        const { email, name, checkoutTime, userId, photoLink } = await request.json();

        console.log('🔄 Đang xử lý checkout:', { email, name, checkoutTime, userId, photoLink });

        if (!email || !name || !checkoutTime || !userId) {
            return NextResponse.json({
                success: false,
                error: 'Thiếu thông tin bắt buộc'
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

        // Đọc dữ liệu từ sheet để tìm dòng cần cập nhật
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:F', // Vẫn đọc đến F để kiểm tra checkout photo
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

        // Tìm dòng check-in của user hôm nay
        let rowToUpdate = -1;
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowEmail = row[0];
            const rowTimestamp = row[2];
            
            if (rowEmail === email && rowTimestamp) {
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
                        // Kiểm tra xem đã checkout chưa - kiểm tra cột E thay vì F
                        if (row[4]) { // Cột E đã có checkout time
                            return NextResponse.json({
                                success: false,
                                error: 'Đã checkout hôm nay',
                                alreadyCheckedOut: true
                            }, { status: 409 });
                        }
                        rowToUpdate = i + 1;
                        break;
                    }
                }
            }
        }

        if (rowToUpdate === -1) {
            return NextResponse.json({
                success: false,
                error: 'Chưa check-in hôm nay',
                notCheckedIn: true
            }, { status: 400 });
        }

        // Cập nhật checkout time và photo link vào cột E và F
        const updateData = photoLink ? 
            [[checkoutTime, photoLink]] :  // Nếu có ảnh, lưu cả time và link
            [[checkoutTime]];               // Nếu không có ảnh, chỉ lưu time
        
        const updateRange = photoLink ? 
            `Sheet1!E${rowToUpdate}:F${rowToUpdate}` :  // Cập nhật 2 cột E và F
            `Sheet1!E${rowToUpdate}`;                   // Cập nhật 1 cột E

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: updateRange,
            valueInputOption: 'RAW',
            requestBody: {
                values: updateData
            }
        });

        console.log('✅ Checkout thành công!');
        return NextResponse.json({
            success: true,
            message: 'Checkout thành công'
        });

    } catch (error) {
        console.error('❌ Lỗi khi checkout:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi thực hiện checkout'
        }, { status: 500 });
    }
}