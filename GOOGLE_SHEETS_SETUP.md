# Hướng dẫn cấu hình Google Sheets API

## Bước 1: Tạo Google Cloud Project và Service Account

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Kích hoạt Google Sheets API:
   - Vào "APIs & Services" > "Library"
   - Tìm kiếm "Google Sheets API"
   - Nhấn "Enable"

4. Tạo Service Account:
   - Vào "APIs & Services" > "Credentials"
   - Nhấn "Create Credentials" > "Service Account"
   - Đặt tên cho service account
   - Tải file JSON credentials

## Bước 2: Tạo Google Sheet

1. Tạo Google Sheet mới
2. Thiết lập header cho Sheet1:
   - A1: Email
   - B1: Tên
   - C1: Thời gian đăng nhập
   - D1: Thời gian ghi nhận

3. Chia sẻ sheet với email của service account (từ file JSON)
   - Nhấn "Share" 
   - Thêm email service account với quyền "Editor"

4. Lấy Sheet ID từ URL (phần giữa `/d/` và `/edit`)

## Bước 3: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc với nội dung:

```env
GOOGLE_CLIENT_EMAIL=your-service-account-email@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id

# Clerk environment variables (nếu chưa có)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

**Lưu ý:**
- `GOOGLE_CLIENT_EMAIL`: Lấy từ field "client_email" trong file JSON
- `GOOGLE_PRIVATE_KEY`: Lấy từ field "private_key" trong file JSON (giữ nguyên định dạng với \n)
- `GOOGLE_SHEET_ID`: ID của Google Sheet bạn đã tạo

## Bước 4: Kiểm tra hoạt động

1. Khởi động ứng dụng: `npm run dev`
2. Đăng nhập vào ứng dụng
3. Kiểm tra Google Sheet để xem dữ liệu có được ghi nhận không
4. Kiểm tra console browser để xem log

## Cấu trúc dữ liệu trong Google Sheet

| Email | Tên | Thời gian đăng nhập | Thời gian ghi nhận |
|-------|-----|-------------------|-------------------|
| user@example.com | Nguyễn Văn A | 06/06/2025, 23:30:00 | 06/06/2025, 23:30:05 |

## Xử lý sự cố

- **Lỗi 403**: Kiểm tra xem service account đã được chia sẻ sheet chưa
- **Lỗi 400**: Kiểm tra GOOGLE_SHEET_ID có đúng không
- **Lỗi authentication**: Kiểm tra GOOGLE_CLIENT_EMAIL và GOOGLE_PRIVATE_KEY 