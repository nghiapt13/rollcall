# Tích hợp Google Sheets - Ghi nhận thông tin đăng nhập

## Tổng quan

Đã tích hợp thành công chức năng ghi nhận thông tin đăng nhập của người dùng và gửi về Google Sheets khi họ đăng nhập vào hệ thống bằng ClerkJs.

## Các file đã tạo/chỉnh sửa

### 1. API Route
- **File**: `src/app/api/google-sheets/route.ts`
- **Chức năng**: API endpoint để gửi dữ liệu lên Google Sheets
- **Method**: POST
- **Dữ liệu nhận**: email, name, loginTime

### 2. Utility Function
- **File**: `src/lib/google-sheets.ts`
- **Chức năng**: Function helper để gọi API và gửi dữ liệu
- **Export**: `sendLoginDataToSheet()`

### 3. Custom Hook
- **File**: `src/hooks/use-login-tracker.ts`
- **Chức năng**: Hook theo dõi trạng thái đăng nhập và tự động gửi dữ liệu
- **Return**: `{ trackingStatus }` - trạng thái gửi dữ liệu

### 4. Component trạng thái
- **File**: `src/components/login-status.tsx`
- **Chức năng**: Hiển thị trạng thái ghi nhận thông tin đăng nhập
- **Các trạng thái**: idle, sending, success, error

### 5. Cập nhật trang chủ
- **File**: `src/app/page.tsx`
- **Thay đổi**: Thêm component `LoginStatus` để hiển thị trạng thái

## Cách hoạt động

1. **Khi người dùng đăng nhập thành công** (qua ClerkJs):
   - Hook `useLoginTracker` phát hiện trạng thái đăng nhập
   - Trích xuất thông tin: email, tên, thời gian đăng nhập
   - Gửi dữ liệu đến API `/api/google-sheets`

2. **API xử lý dữ liệu**:
   - Xác thực với Google Sheets API qua Service Account
   - Thêm dòng mới vào Google Sheet với thông tin:
     - Email người dùng
     - Tên người dùng
     - Thời gian đăng nhập
     - Thời gian ghi nhận

3. **Hiển thị trạng thái**:
   - Component `LoginStatus` hiển thị quá trình gửi dữ liệu
   - Các trạng thái: đang gửi, thành công, lỗi

## Dữ liệu được ghi nhận

| Cột | Nội dung | Ví dụ |
|-----|----------|-------|
| A | Email | user@example.com |
| B | Tên | Nguyễn Văn A |
| C | Thời gian đăng nhập | 06/06/2025, 23:30:00 |
| D | Thời gian ghi nhận | 06/06/2025, 23:30:05 |

## Cấu hình cần thiết

### Environment Variables (.env.local)
```env
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
```

### Google Sheet Setup
1. Tạo Google Sheet với header: Email, Tên, Thời gian đăng nhập, Thời gian ghi nhận
2. Chia sẻ sheet với service account email
3. Lấy Sheet ID từ URL

## Tính năng

✅ **Tự động ghi nhận**: Không cần thao tác từ người dùng  
✅ **Theo dõi trạng thái**: Hiển thị quá trình gửi dữ liệu  
✅ **Xử lý lỗi**: Catch và hiển thị lỗi nếu có  
✅ **Tránh trùng lặp**: Chỉ ghi nhận một lần mỗi phiên đăng nhập  
✅ **Timezone**: Sử dụng múi giờ Việt Nam  

## Cách test

1. Cấu hình environment variables
2. Chạy `npm run dev`
3. Đăng nhập vào ứng dụng
4. Kiểm tra Google Sheet để xem dữ liệu
5. Kiểm tra trạng thái hiển thị trên UI

## Dependencies đã thêm

- `googleapis`: ^115.0.0 (cho Google Sheets API)

## Lưu ý bảo mật

- Private key được lưu trong environment variable
- API chỉ chấp nhận POST request
- Validation dữ liệu đầu vào
- Error handling không expose sensitive information 