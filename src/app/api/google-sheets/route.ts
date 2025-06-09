import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { isAuthorizedUser } from '@/config/authorized-users';

export async function POST(request: NextRequest) {
    try {
        const { email, name, userId, photoLink } = await request.json();

        console.log('📨 Nhận dữ liệu:', { email, name, userId, photoLink });

        // Kiểm tra quyền truy cập bằng email
        if (!email || !isAuthorizedUser(email)) {
            console.log('🚫 Không có quyền truy cập:', email);
            return NextResponse.json({
                success: false,
                error: 'Không có quyền truy cập',
                unauthorized: true
            }, { status: 403 });
        }

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email không được cung cấp' },
                { status: 400 }
            );
        }

        // XÓA BỎ ĐOẠN CODE SAI NÀY:
        // if (!userId || !isAuthorizedUser(userId)) {
        //     console.log('❌ CHẶN: Không có quyền truy cập');
        //     return NextResponse.json({
        //         success: false,
        //         error: 'unauthorized',
        //         message: 'Bạn không có quyền điểm danh. Vui lòng liên hệ quản trị viên.',
        //         unauthorized: true
        //     }, { status: 403 });
        // }

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

        console.log('Đang kiểm tra Google Sheets...');

        // Đọc dữ liệu từ sheet để kiểm tra
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:E',
        });

        const rows = response.data.values || [];
        console.log('Số dòng trong sheet:', rows.length);

        // Lấy ngày hôm nay theo định dạng DD/MM/YYYY
        const today = new Date();
        const todayString = today.toLocaleDateString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        console.log('Ngày hôm nay:', todayString);

        // Kiểm tra email đã điểm danh hôm nay chưa
        let hasCheckedInToday = false;

        for (let i = 1; i < rows.length; i++) { // Bỏ qua header (dòng 0)
            const row = rows[i];
            const rowEmail = row[0];
            const rowLoginTime = row[2];

            

            if (rowEmail === email && rowLoginTime) {
                try {
                    // Parse thời gian từ format Việt Nam
                    // Format: "HH:MM:SS D/M/YYYY" hoặc "HH:MM:SS DD/MM/YYYY"
                    const dateMatch = rowLoginTime.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

                    if (dateMatch) {
                        const [, day, month, year] = dateMatch;
                        // Tạo date với format chính xác: YYYY-MM-DD
                        const loginDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

                        const loginDateString = loginDate.toLocaleDateString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });

                        console.log(`Parse: "${rowLoginTime}" → Day:${day}, Month:${month}, Year:${year} → "${loginDateString}"`);
                        console.log(`So sánh: ${loginDateString} vs ${todayString}`);

                        if (loginDateString === todayString) {
                            hasCheckedInToday = true;
                            console.log('✅ Đã tìm thấy điểm danh hôm nay!');
                            break;
                        }
                    } else {
                        console.log('Không thể parse định dạng ngày:', rowLoginTime);
                    }
                } catch (error) {
                    console.log('Lỗi parse ngày:', error);
                }
            }
        }

        // Nếu đã điểm danh rồi
        if (hasCheckedInToday) {
            console.log('❌ CHẶN: Đã điểm danh hôm nay');
            return NextResponse.json({
                success: false,
                error: 'already_checked_in',
                message: 'Hôm nay bạn đã điểm danh thành công',
                alreadyCheckedIn: true
            }, { status: 409 });
        }

        // Nếu chưa điểm danh → ghi dữ liệu
        console.log('✅ Chưa điểm danh, tiến hành ghi dữ liệu...');

        const newRow = [
            email,
            name,
            new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            photoLink || 'Không có ảnh'
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:D',
            valueInputOption: 'RAW',
            requestBody: {
                values: [newRow],
            },
        });

        console.log('✅ Ghi dữ liệu thành công!');

        return NextResponse.json({
            success: true,
            message: 'Điểm danh thành công!',
            newEntry: true
        });

    } catch (error) {
        console.error('❌ Lỗi API:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi server: ' + (error as Error).message },
            { status: 500 }
        );
    }
}