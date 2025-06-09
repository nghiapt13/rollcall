import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { isAdminUser } from '@/config/authorized-users';

export async function POST(request: NextRequest) {
    try {
        const { email, confirmCode } = await request.json();

        console.log('=== XÓA DỮ LIỆU CHẤM CÔNG ===');

        // Kiểm tra quyền admin bằng email
        if (!email || !isAdminUser(email)) {
            console.log('❌ CHẶN: Không có quyền admin');
            return NextResponse.json({
                success: false,
                error: 'Bạn không có quyền admin. Vui lòng liên hệ quản trị viên.',
                unauthorized: true
            }, { status: 403 });
        }

        // Kiểm tra mã xác nhận
        if (confirmCode !== 'DELETE MY DATA') {
            return NextResponse.json({
                success: false,
                error: 'Mã xác nhận không đúng. Vui lòng nhập: DELETE MY DATA'
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

        // Đọc dữ liệu từ sheet để đếm số dòng
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:G',
        });

        const rows = response.data.values || [];
        console.log('📊 Tổng số dòng:', rows.length);

        if (rows.length <= 1) {
            console.log('⚠️ Không có dữ liệu để xóa (chỉ có header)');
            return NextResponse.json({
                success: true,
                message: 'Không có dữ liệu chấm công để xóa',
                deletedRows: 0
            });
        }

        // Xóa tất cả dữ liệu trừ header (dòng đầu tiên)
        const startRow = 2; // Dòng thứ 2 (sau header)
        const endRow = rows.length; // Dòng cuối cùng
        const deleteRange = `Sheet1!A${startRow}:F${endRow}`; // Thay đổi từ E thành F
    
        console.log(`🗑️ Đang xóa dòng từ ${startRow} đến ${endRow}...`);
    
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: deleteRange,
        });

        const deletedRows = endRow - startRow + 1;
        console.log(`✅ Đã xóa ${deletedRows} dòng dữ liệu chấm công`);

        return NextResponse.json({
            success: true,
            message: `Đã xóa thành công ${deletedRows} bản ghi chấm công`,
            deletedRows: deletedRows,
            totalRowsBefore: rows.length,
            totalRowsAfter: 1 // Chỉ còn header
        });

    } catch (error) {
        console.error('❌ Lỗi xóa dữ liệu:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server: ' + (error as Error).message
        }, { status: 500 });
    }
}