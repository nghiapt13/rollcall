import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

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

    // Đọc dữ liệu từ sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:D',
    });

    const rows = response.data.values || [];
    console.log('Raw rows from sheet:', rows);
    
    // Ngày hôm nay
    const today = new Date();
    const todayString = today.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    console.log('Today string:', todayString);

    // Debug tất cả dữ liệu
    const debugData = rows.map((row, index) => {
      const rowEmail = row[0] || '';
      const rowName = row[1] || '';
      const rowLoginTime = row[2] || '';
      const rowRecordTime = row[3] || '';

      let parsedDate = null;
      let dateString = null;
      let parseError = null;
      
      if (rowLoginTime) {
        try {
          // Parse thời gian từ format Việt Nam
          // Format: "HH:MM:SS D/M/YYYY" hoặc "HH:MM:SS DD/MM/YYYY"
          const dateMatch = rowLoginTime.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            // Tạo date với format chính xác: YYYY-MM-DD
            parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            
            if (isNaN(parsedDate.getTime())) {
              parseError = 'Invalid Date Object After Parse';
              dateString = 'INVALID_DATE';
            } else {
              dateString = parsedDate.toLocaleDateString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            }
          } else {
            parseError = 'Cannot match date pattern';
            dateString = 'NO_DATE_PATTERN';
          }
        } catch (e) {
          parseError = e instanceof Error ? e.message : 'Parse Error';
          dateString = 'PARSE_ERROR';
        }
      }

      return {
        index,
        rawData: row,
        email: rowEmail,
        name: rowName,
        loginTime: rowLoginTime,
        recordTime: rowRecordTime,
        parsedDate: parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null,
        dateString,
        parseError,
        isToday: dateString === todayString,
        isTargetEmail: email ? rowEmail === email : false
      };
    });

    // Tìm các dòng của email cụ thể
    const emailRows = email ? debugData.filter(row => row.isTargetEmail) : [];
    const todayRows = email ? debugData.filter(row => row.isTargetEmail && row.isToday) : [];
    
    // Tìm lỗi parse
    const parseErrors = debugData.filter(row => row.parseError);
    
    console.log('Debug summary:', {
      totalRows: rows.length,
      emailRows: emailRows.length,
      todayRows: todayRows.length,
      parseErrors: parseErrors.length
    });

    return NextResponse.json({
      success: true,
      searchEmail: email,
      todayString,
      totalRows: rows.length,
      emailRows: emailRows.length,
      todayRows: todayRows.length,
      hasCheckedInToday: todayRows.length > 0,
      parseErrors: parseErrors.length,
      allData: debugData,
      emailSpecificData: emailRows,
      todaySpecificData: todayRows,
      errorsData: parseErrors,
      env: {
        hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
        hasSheetId: !!process.env.GOOGLE_SHEET_ID
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Debug API Error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 