# Khắc phục lỗi Camera trên thiết bị di động

## Vấn đề

Lỗi phổ biến khi sử dụng camera trên thiết bị di động:
```
navigator.mediaDevices.enumerateDevices is not a function
```

## Nguyên nhân

1. **Không có HTTPS**: Một số Web API chỉ hoạt động trên HTTPS
2. **Trình duyệt cũ**: Không hỗ trợ đầy đủ WebRTC API
3. **Thiết bị không hỗ trợ**: Một số thiết bị/trình duyệt mobile không hỗ trợ đầy đủ
4. **Quyền truy cập**: Người dùng chưa cấp quyền camera

## Giải pháp đã triển khai

### 1. Camera Utils Library (`src/lib/camera-utils.ts`)

Tạo wrapper an toàn cho tất cả Camera API:

```typescript
import { 
  CameraEnvironment, 
  safeGetUserMedia, 
  safeEnumerateDevices, 
  CameraError 
} from '@/lib/camera-utils';

// Kiểm tra hỗ trợ
if (CameraEnvironment.hasEnumerateDevices()) {
  const cameras = await safeEnumerateDevices();
}

// Truy cập camera an toàn
try {
  const stream = await safeGetUserMedia({ video: true });
} catch (error) {
  if (error instanceof CameraError) {
    console.log('Camera error:', error.code, error.message);
  }
}
```

### 2. Fallback Mechanisms

- **enumerateDevices fallback**: Trả về camera mặc định nếu API không hỗ trợ
- **Constraints adjustment**: Tự động điều chỉnh cho thiết bị mobile
- **Error handling**: Xử lý cụ thể từng loại lỗi

### 3. Camera Troubleshoot Component

Component hướng dẫn người dùng khắc phục lỗi:

```typescript
import { CameraTroubleshoot } from '@/components/camera-troubleshoot';

// Sử dụng khi gặp lỗi camera
<CameraTroubleshoot />
```

## Cách sử dụng

### Thay thế code cũ

**Trước:**
```typescript
// ❌ Không an toàn - có thể lỗi trên mobile
const devices = await navigator.mediaDevices.enumerateDevices();
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
```

**Sau:**
```typescript
// ✅ An toàn với fallback
import { safeEnumerateDevices, safeGetUserMedia } from '@/lib/camera-utils';

const devices = await safeEnumerateDevices();
const stream = await safeGetUserMedia({ video: true });
```

### Kiểm tra hỗ trợ

```typescript
import { CameraEnvironment } from '@/lib/camera-utils';

// Kiểm tra HTTPS
if (!CameraEnvironment.isSecureContext()) {
  console.warn('Cần HTTPS để sử dụng camera');
}

// Kiểm tra hỗ trợ API
if (!CameraEnvironment.hasMediaDevices()) {
  console.warn('Trình duyệt không hỗ trợ Camera API');
}

// Kiểm tra thiết bị
if (CameraEnvironment.isMobile()) {
  console.log('Đang chạy trên thiết bị di động');
}
```

### Xử lý lỗi

```typescript
import { CameraError } from '@/lib/camera-utils';

try {
  const stream = await safeGetUserMedia({ video: true });
} catch (error) {
  if (error instanceof CameraError) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        // Hướng dẫn cấp quyền
        break;
      case 'CAMERA_NOT_FOUND':
        // Thông báo không có camera
        break;
      case 'INSECURE_CONTEXT':
        // Yêu cầu HTTPS
        break;
    }
  }
}
```

## Cập nhật Components

### Camera Capture Component

```typescript
// Đã cập nhật để sử dụng safe APIs
import { safeGetUserMedia, safeEnumerateDevices } from '@/lib/camera-utils';

// Thay vì navigator.mediaDevices.getUserMedia
const stream = await safeGetUserMedia(constraints);

// Thay vì navigator.mediaDevices.enumerateDevices
const devices = await safeEnumerateDevices();
```

### Camera Debug Component

```typescript
// Đã cập nhật để sử dụng dynamic import
const { safeEnumerateDevices } = await import('@/lib/camera-utils');
const devices = await safeEnumerateDevices();
```

## Hướng dẫn cho người dùng

### iOS (iPhone/iPad)
1. Mở Cài đặt > Safari > Camera
2. Đảm bảo "Ask" hoặc "Allow" được chọn
3. Trong Safari, nhấn vào biểu tượng "aA" trên thanh địa chỉ
4. Chọn "Website Settings" > "Camera" > "Allow"

### Android
1. Mở Cài đặt > Ứng dụng > Chrome
2. Chọn Quyền > Camera > Cho phép
3. Trong Chrome, nhấn vào biểu tượng khóa bên cạnh địa chỉ web
4. Đảm bảo Camera được đặt thành "Allow"

## Testing

### Test local
```bash
# Chạy trên HTTPS để test camera
npm run dev -- --https
```

### Test trên thiết bị thực
1. Deploy lên server HTTPS
2. Truy cập từ thiết bị mobile
3. Kiểm tra console log để debug

## Lưu ý quan trọng

1. **HTTPS bắt buộc**: Camera API chỉ hoạt động trên HTTPS (trừ localhost)
2. **User gesture**: Một số trình duyệt yêu cầu user click trước khi truy cập camera
3. **Permissions**: Luôn xử lý trường hợp người dùng từ chối quyền
4. **Fallback**: Cung cấp phương án thay thế khi camera không khả dụng

## Troubleshooting

### Lỗi thường gặp

1. **"navigator.mediaDevices is undefined"**
   - Kiểm tra HTTPS
   - Cập nhật trình duyệt

2. **"enumerateDevices is not a function"**
   - Sử dụng `safeEnumerateDevices()` thay vì trực tiếp
   - Fallback sẽ tự động xử lý

3. **"Permission denied"**
   - Hướng dẫn người dùng cấp quyền
   - Sử dụng `CameraTroubleshoot` component

4. **"Camera not found"**
   - Kiểm tra thiết bị có camera
   - Đảm bảo camera không bị ứng dụng khác sử dụng

## Files đã thay đổi

- ✅ `src/lib/camera-utils.ts` - Camera utilities với fallback
- ✅ `src/components/camera-troubleshoot.tsx` - Hướng dẫn khắc phục lỗi  
- ✅ `src/components/camera-capture.tsx` - Cập nhật sử dụng safe APIs
- ✅ `src/components/camera-debug.tsx` - Cập nhật debug với safe APIs 