# Logic Kiểm Soát Điểm Danh - 1 Lần/Ngày

## 🎯 **Quy tắc chính**
Mỗi người dùng chỉ được điểm danh **1 lần duy nhất** trong mỗi ngày dựa trên **email** của họ.

## 🔄 **Luồng kiểm tra**

### 1. **Khi người dùng đăng nhập**
- `useAttendanceStatus` hook tự động kiểm tra trạng thái
- Gọi API `/api/check-attendance?email=user@example.com`
- Trả về `hasCheckedInToday: true/false`

### 2. **Hiển thị nút dựa trên trạng thái**
```typescript
if (hasCheckedInToday) {
  // Hiển thị nút disabled "Đã điểm danh hôm nay"
  return <Button disabled>Đã điểm danh hôm nay</Button>
} else {
  // Hiển thị nút active "Điểm danh"
  return <Button onClick={handleOpenDialog}>Điểm danh</Button>
}
```

### 3. **Khi bấm nút "Điểm danh"**
1. **Kiểm tra lại** trong `handleOpenDialog()`:
   ```typescript
   if (hasCheckedInToday) {
     return; // Ngăn không cho mở dialog
   }
   ```

2. **Mở dialog** và **tự động chạy** quá trình điểm danh

3. **Trong quá trình điểm danh** (`handleAttendance`):
   - Kiểm tra lại trong API: `checkAttendanceStatus(email)`
   - Nếu `hasCheckedInToday = true` → hiển thị "Đã điểm danh rồi"
   - Nếu `hasCheckedInToday = false` → tiến hành ghi nhận điểm danh

## 📊 **API Check Attendance Logic**

### Endpoint: `/api/check-attendance`
```typescript
// Lấy ngày hôm nay (chỉ ngày, không có giờ)
const today = new Date().toLocaleDateString('vi-VN', { 
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit', 
  year: 'numeric'
});

// Kiểm tra trong Google Sheets
const hasCheckedInToday = rows.some((row, index) => {
  if (index === 0) return false; // Bỏ qua header
  
  const rowEmail = row[0]; // Cột A: Email
  const loginTime = row[2]; // Cột C: Thời gian đăng nhập
  
  if (rowEmail === email && loginTime) {
    const loginDate = new Date(loginTime).toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return loginDate === today; // So sánh ngày
  }
  
  return false;
});
```

## 🔒 **Các lớp bảo vệ**

### **Lớp 1: UI Level**
- Nút disabled khi `hasCheckedInToday = true`
- Ngăn mở dialog nếu đã điểm danh

### **Lớp 2: Client Logic**
- Hook `useManualAttendance` kiểm tra trước khi gửi request
- Hiển thị "already_checked_in" nếu phát hiện đã điểm danh

### **Lớp 3: Server API**
- API `/api/check-attendance` luôn kiểm tra từ Google Sheets
- API `/api/google-sheets` có thể thêm kiểm tra double-check

### **Lớp 4: Database Level**
- Google Sheets lưu trữ email + thời gian
- So sánh ngày dựa trên timezone Vietnam

## ⚡ **Cách refresh trạng thái**

### **Sau khi điểm danh thành công:**
1. Dialog tự động đóng sau 3 giây
2. Gọi `refreshStatus()` để cập nhật `hasCheckedInToday`
3. Nút chuyển thành disabled "Đã điểm danh hôm nay"

### **Khi sang ngày mới:**
- `useAttendanceStatus` sẽ tự động kiểm tra lại
- `hasCheckedInToday` sẽ thành `false`
- Nút "Điểm danh" sẽ active trở lại

## 🎯 **Các trạng thái trong Dialog**

| Trạng thái | Mô tả | Cho phép điểm danh |
|------------|-------|-------------------|
| `idle` | Đang chuẩn bị | ✅ Sẽ tự động chạy |
| `checking` | Đang kiểm tra | ⏳ Chờ kết quả |
| `sending` | Đang ghi nhận | ⏳ Đang xử lý |
| `success` | Thành công | ✅ Hoàn tất |
| `already_checked_in` | Đã điểm danh | ❌ Không cho phép |
| `error` | Lỗi | ❌ Cần thử lại |

## 🛡️ **Bảo mật và Validation**

- ✅ Email validation
- ✅ Timezone consistency (Asia/Ho_Chi_Minh)
- ✅ Date comparison (chỉ ngày, không có giờ)
- ✅ Multiple layer checks
- ✅ Auto-refresh sau khi thành công
- ✅ Prevent double submission 