# Hướng dẫn thêm quyền Quản trị viên

## 📋 **Cách lấy userId từ ClerkJs**

### **Bước 1: Đăng nhập vào ứng dụng**
1. Người cần được cấp quyền admin đăng nhập vào hệ thống
2. Mở Developer Tools (F12) → Console
3. Chạy lệnh sau để lấy userId:
```javascript
// Trong console browser
console.log('User ID:', window.Clerk?.user?.id);
```

### **Bước 2: Sao chép userId**
- Copy userId hiển thị trong console (dạng: `user_xxxxxxxxxxxxxxxxxxxxxxxxxx`)

## 🔧 **Cách 1: Thêm vào Environment Variables (Khuyến nghị)**

### **Bước 1: Chỉnh sửa file `.env.local`**
Mở file `.env.local` và thêm/cập nhật dòng:

```bash
# Nếu chưa có biến này, thêm mới:
NEXT_PUBLIC_AUTHORIZED_USER_IDS=user_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Nếu đã có, thêm userId mới (phân cách bằng dấu phẩy):
NEXT_PUBLIC_AUTHORIZED_USER_IDS=user_admin1_id,user_admin2_id,user_admin3_id
```

### **Bước 2: Restart ứng dụng**
```bash
# Dừng server hiện tại (Ctrl+C)
# Khởi động lại
npm run dev
```

## 🔧 **Cách 2: Thêm trực tiếp vào code (Tạm thời)**

### **Chỉnh sửa file** `src/config/authorized-users.ts`:

```typescript
// Thêm userId vào mảng cố định (cho testing)
const HARDCODED_ADMIN_IDS = [
  'user_xxxxxxxxxxxxxxxxxxxxxxxxxx', // ID admin mới
  // Thêm các ID khác ở đây
];

const getAuthorizedUserIds = (): string[] => {
  const userIds = process.env.NEXT_PUBLIC_AUTHORIZED_USER_IDS;
  const envIds = userIds ? userIds.split(',').map(id => id.trim()).filter(id => id.length > 0) : [];
  
  // Kết hợp env variables và hardcoded IDs
  return [...envIds, ...HARDCODED_ADMIN_IDS];
};
```

## 🎯 **Kiểm tra quyền admin**

### **Cách 1: Test trong ứng dụng**
1. Đăng nhập với tài khoản vừa cấp quyền
2. Truy cập trang `/admin`
3. Thử thực hiện chức năng xóa dữ liệu

### **Cách 2: Kiểm tra trong Console**
```javascript
// Trong console browser sau khi đăng nhập
fetch('/api/check-attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    userId: window.Clerk?.user?.id
  })
}).then(r => r.json()).then(console.log);
```

## 🔒 **Bảo mật và Best Practices**

### **✅ Nên làm:**
- Sử dụng Environment Variables (`.env.local`)
- Giữ danh sách admin ít nhất có thể
- Thường xuyên review quyền truy cập
- Backup dữ liệu trước khi thực hiện thao tác admin

### **❌ Không nên:**
- Hardcode userId trong source code (chỉ dùng tạm thời)
- Chia sẻ userId admin công khai
- Cấp quyền admin cho nhiều người không cần thiết

## 📝 **Ví dụ file `.env.local` hoàn chỉnh**

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx

# Google Sheets & Drive
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1ABC123xyz789...
GOOGLE_DRIVE_FOLDER_ID=1DEF456uvw123... # Optional

# Admin Users (Phân cách bằng dấu phẩy)
NEXT_PUBLIC_AUTHORIZED_USER_IDS=user_2abc123def456,user_2xyz789uvw123
```

## 🚨 **Xử lý sự cố**

### **Lỗi "Không có quyền truy cập"**
1. Kiểm tra userId có đúng format không
2. Xác minh biến môi trường đã được thiết lập
3. Restart server sau khi thay đổi `.env.local`
4. Kiểm tra console để xem log lỗi

### **Lỗi "Environment variable not found"**
1. Đảm bảo file `.env.local` nằm ở thư mục gốc project
2. Tên biến chính xác: `NEXT_PUBLIC_AUTHORIZED_USER_IDS`
3. Không có dấu cách thừa quanh dấu `=`

## 🎉 **Hoàn thành!**

Sau khi thực hiện các bước trên, tài khoản mới sẽ có quyền:
- ✅ Truy cập trang `/admin`
- ✅ Xóa tất cả dữ liệu chấm công
- ✅ Thực hiện các thao tác quản trị khác (nếu có)

---

**💡 Tip:** Nên test với tài khoản phụ trước khi cấp quyền cho tài khoản chính! 