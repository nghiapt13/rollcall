# Hướng dẫn Setup Environment Variables

## 1. Tạo file `.env.local` 

Tạo file `.env.local` trong thư mục gốc của dự án với nội dung:

```env
# Google Sheets API (đã có)
GOOGLE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your-google-sheet-id

# Danh sách User ID được phép điểm danh (THÊM MỚI)
# Cách nhau bằng dấu phẩy, không có khoảng trắng
NEXT_PUBLIC_AUTHORIZED_USER_IDS=user_2y8mP4B98VNQyNkqIDhNfwtQuby,user_2y928V81U09M2TGAE050tJ5Ny0r
```

## 2. Lấy User ID của ClerkJS

Để lấy User ID:
1. Đăng nhập vào ứng dụng
2. Mở Developer Tools (F12)
3. Chạy lệnh: `console.log(window.Clerk?.user?.id)`
4. Copy User ID và thêm vào biến `NEXT_PUBLIC_AUTHORIZED_USER_IDS`

## 3. An toàn

- ✅ File `.env.local` đã được thêm vào `.gitignore`
- ✅ User ID không bao giờ bị commit lên GitHub
- ✅ Mỗi môi trường (dev, production) có thể có danh sách User ID riêng
- ✅ Dễ dàng thêm/xóa User ID mà không cần thay đổi code

## 4. Deployment

Khi deploy lên production (Vercel, Netlify, v.v.), thêm biến environment:
```
NEXT_PUBLIC_AUTHORIZED_USER_IDS=user_id_1,user_id_2,user_id_3
``` 