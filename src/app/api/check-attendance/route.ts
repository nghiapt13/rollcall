import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email không được cung cấp' },
        { status: 400 }
      );
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

    // Đọc tất cả dữ liệu từ sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:D',
    });

    const rows = response.data.values || [];

    // Lấy ngày hôm nay (chỉ phần ngày, không có giờ)
    const today = new Date().toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Kiểm tra xem email đã điểm danh hôm nay chưa
    const hasCheckedInToday = rows.some((row, index) => {
      if (index === 0) return false; // Bỏ qua header row

      const rowEmail = row[0];
      const loginTime = row[2];

      if (rowEmail === email && loginTime) {
        // Lấy phần ngày từ thời gian đăng nhập
        const loginDate = new Date(loginTime).toLocaleDateString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        return loginDate === today;
      }

      return false;
    });

    return NextResponse.json({
      success: true,
      hasCheckedInToday,
      today
    });

  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái điểm danh:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể kiểm tra trạng thái điểm danh' },
      { status: 500 }
    );
  }
} 