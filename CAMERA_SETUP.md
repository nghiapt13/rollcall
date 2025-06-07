# Hướng dẫn thiết lập Camera và Google Drive

## Tính năng mới
- Khi chấm công, hệ thống sẽ yêu cầu chụp ảnh camera trước
- Ảnh sẽ được tự động tải lên Google Drive
- Link ảnh sẽ được lưu trong Google Sheets cùng với thông tin chấm công

## Bước 1: Cấu hình Google Drive API

### 1.1. Bật Google Drive API
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project hiện tại (project bạn đã tạo cho Google Sheets)
3. Vào **APIs & Services** > **Library**
4. Tìm "Google Drive API" và click **Enable**

### 1.2. Cập nhật Service Account permissions
1. Vào **APIs & Services** > **Credentials**
2. Click vào Service Account bạn đã tạo
3. Vào tab **Keys** và tải xuống file JSON mới (nếu cần)

### 1.3. Tạo folder trên Google Drive (Tùy chọn)
1. Vào [Google Drive](https://drive.google.com/)
2. Tạo folder mới tên "Attendance Photos"
3. Click phải folder > **Share** > **Add people**
4. Thêm email Service Account của bạn (có trong file JSON) với quyền **Editor**
5. Copy ID của folder từ URL (phần sau `/folders/`)

## Bước 2: Cập nhật Environment Variables

Thêm vào file `.env.local`:

```bash
# Biến môi trường hiện có...
GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEET_ID=your-sheet-id

# Biến mới cho Google Drive (tùy chọn)
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

**Lưu ý:** 
- `GOOGLE_DRIVE_FOLDER_ID` là tùy chọn. Nếu không có, ảnh sẽ được lưu ở root của Drive.
- Nếu có folder ID, ảnh sẽ được tổ chức gọn gàng hơn.

## Bước 3: Cập nhật Google Sheets Headers

Thêm cột "Ảnh" vào Google Sheets:
1. Mở Google Sheets
2. Thêm header "Ảnh" vào cột E
3. Cấu trúc bây giờ: `Email | Tên | Thời gian | Ghi nhận | Ảnh`

## Bước 4: Test tính năng

1. Restart ứng dụng Next.js
2. Đăng nhập và thử chấm công
3. Cho phép truy cập camera khi được yêu cầu
4. Chụp ảnh và kiểm tra:
   - Ảnh có xuất hiện trên Google Drive không
   - Link ảnh có được lưu trong Google Sheets không

## Quy trình chấm công mới

1. **Bấm "Chấm công"** → Mở dialog camera
2. **Cho phép camera** → Camera khởi động
3. **Chụp ảnh** → Xem preview ảnh
4. **Xác nhận ảnh** → Upload lên Drive + Lưu vào Sheets
5. **Hoàn thành** → Thông báo thành công

## Xử lý lỗi

### Lỗi camera
- **"Camera không khả dụng"**: Đảm bảo trình duyệt có quyền truy cập camera
- **"Camera blocked"**: Vào Settings > Privacy > Camera và cho phép website

### Lỗi upload
- **"Upload failed"**: Kiểm tra Service Account có quyền Drive API
- **"File not found"**: Kiểm tra GOOGLE_DRIVE_FOLDER_ID có đúng không

### Lỗi permissions
- **"Permission denied"**: Đảm bảo Service Account được share quyền truy cập folder

## Bảo mật

- Ảnh được tự động đặt quyền "public readable" để có thể xem từ Sheets
- Tên file có format: `chamcong_email_timestamp.jpg`
- Chỉ người có link mới xem được ảnh
- Service Account chỉ có quyền tối thiểu cần thiết

## Troubleshooting

### 1. Camera không hoạt động
```javascript
// Mở Developer Tools và check console
// Tìm các lỗi liên quan đến getUserMedia
```

### 2. Upload thất bại
```javascript
// Check API response trong Network tab
// Kiểm tra file có được tạo trên Drive không
```

### 3. Link không hiển thị trong Sheets
```javascript
// Verify cột E được tạo trong Sheets
// Check API response có chứa photoLink không
``` 