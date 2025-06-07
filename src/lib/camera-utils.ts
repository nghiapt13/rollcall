/**
 * Camera utilities với polyfill và fallback cho thiết bị di động
 */

// Kiểm tra môi trường và hỗ trợ API
export const CameraEnvironment = {
  // Kiểm tra có phải HTTPS không
  isSecureContext: () => {
    if (typeof window === 'undefined') return false;
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  },

  // Kiểm tra hỗ trợ MediaDevices API
  hasMediaDevices: () => {
    return typeof navigator !== 'undefined' && 
           navigator.mediaDevices && 
           typeof navigator.mediaDevices === 'object';
  },

  // Kiểm tra hỗ trợ getUserMedia
  hasGetUserMedia: () => {
    return CameraEnvironment.hasMediaDevices() && 
           typeof navigator.mediaDevices.getUserMedia === 'function';
  },

  // Kiểm tra hỗ trợ enumerateDevices
  hasEnumerateDevices: () => {
    return CameraEnvironment.hasMediaDevices() && 
           typeof navigator.mediaDevices.enumerateDevices === 'function';
  },

  // Kiểm tra thiết bị mobile
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  },

  // Kiểm tra iOS
  isIOS: () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  // Kiểm tra Android
  isAndroid: () => {
    if (typeof window === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  }
};

// Lỗi camera tùy chỉnh
export class CameraError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'CameraError';
  }
}

// Wrapper an toàn cho enumerateDevices
export const safeEnumerateDevices = async (): Promise<MediaDeviceInfo[]> => {
  // Kiểm tra hỗ trợ cơ bản
  if (!CameraEnvironment.hasMediaDevices()) {
    throw new CameraError(
      'Trình duyệt không hỗ trợ MediaDevices API',
      'MEDIA_DEVICES_NOT_SUPPORTED'
    );
  }

  // Kiểm tra HTTPS
  if (!CameraEnvironment.isSecureContext()) {
    throw new CameraError(
      'Camera API chỉ hoạt động trên HTTPS',
      'INSECURE_CONTEXT'
    );
  }

  // Kiểm tra enumerateDevices
  if (!CameraEnvironment.hasEnumerateDevices()) {
    console.warn('⚠️ enumerateDevices không được hỗ trợ, sử dụng fallback');
    
    // Fallback: trả về danh sách camera mặc định
    return [
      {
        deviceId: 'default',
        kind: 'videoinput',
        label: 'Camera mặc định',
        groupId: 'default'
      } as MediaDeviceInfo
    ];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error: unknown) {
    console.error('❌ Lỗi enumerateDevices:', error);
    
    // Fallback cho lỗi
    return [
      {
        deviceId: 'default',
        kind: 'videoinput', 
        label: 'Camera mặc định',
        groupId: 'default'
      } as MediaDeviceInfo
    ];
  }
};

// Wrapper an toàn cho getUserMedia
export const safeGetUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  // Kiểm tra hỗ trợ cơ bản
  if (!CameraEnvironment.hasGetUserMedia()) {
    throw new CameraError(
      'Trình duyệt không hỗ trợ getUserMedia',
      'GET_USER_MEDIA_NOT_SUPPORTED'
    );
  }

  // Kiểm tra HTTPS
  if (!CameraEnvironment.isSecureContext()) {
    throw new CameraError(
      'Camera API chỉ hoạt động trên HTTPS',
      'INSECURE_CONTEXT'
    );
  }

  try {
    // Điều chỉnh constraints cho mobile
    const adjustedConstraints = adjustConstraintsForMobile(constraints);
    
    console.log('🎥 Đang truy cập camera với constraints:', adjustedConstraints);
    const stream = await navigator.mediaDevices.getUserMedia(adjustedConstraints);
    
    console.log('✅ Camera đã được truy cập thành công');
    return stream;
    
  } catch (error: unknown) {
    console.error('❌ Lỗi getUserMedia:', error);
    throw handleGetUserMediaError(error);
  }
};

// Điều chỉnh constraints cho thiết bị mobile
const adjustConstraintsForMobile = (constraints: MediaStreamConstraints): MediaStreamConstraints => {
  if (!constraints.video || typeof constraints.video === 'boolean') {
    return constraints;
  }

  const videoConstraints = { ...constraints.video };
  
  // Điều chỉnh cho mobile
  if (CameraEnvironment.isMobile()) {
    // Độ phân giải tối ưu cho mobile (tránh lag)
    if (CameraEnvironment.isAndroid()) {
      // Android: Độ phân giải vừa phải
      videoConstraints.width = { ideal: 480, max: 720 };
      videoConstraints.height = { ideal: 640, max: 960 };
    } else if (CameraEnvironment.isIOS()) {
      // iOS: Có thể xử lý độ phân giải cao hơn
      videoConstraints.width = { ideal: 540, max: 720 };
      videoConstraints.height = { ideal: 960, max: 1280 };
    } else {
      // Mobile khác: Độ phân giải thấp để đảm bảo tương thích
      videoConstraints.width = { ideal: 480, max: 640 };
      videoConstraints.height = { ideal: 640, max: 800 };
    }
    
    // Frame rate thấp để tiết kiệm pin và băng thông
    videoConstraints.frameRate = { ideal: 12, max: 20 };
    
    // Các tối ưu khác cho mobile
    videoConstraints.aspectRatio = { ideal: 3/4 }; // Tỷ lệ phù hợp với portrait
  }

  // Loại bỏ constraints không hỗ trợ trên một số thiết bị
  if (CameraEnvironment.isIOS()) {
    // iOS Safari có thể không hỗ trợ một số constraints
    delete (videoConstraints as Record<string, unknown>).focusMode;
    delete (videoConstraints as Record<string, unknown>).zoom;
    delete (videoConstraints as Record<string, unknown>).torch;
  }
  
  // Android có thể không hỗ trợ một số tính năng
  if (CameraEnvironment.isAndroid()) {
    delete (videoConstraints as Record<string, unknown>).exposureMode;
    delete (videoConstraints as Record<string, unknown>).whiteBalanceMode;
  }

  return {
    ...constraints,
    video: videoConstraints
  };
};

// Xử lý lỗi getUserMedia
const handleGetUserMediaError = (error: unknown): CameraError => {
  const err = error as Error;
  switch (err.name) {
    case 'NotAllowedError':
      return new CameraError(
        'Người dùng từ chối quyền truy cập camera. Vui lòng cho phép truy cập camera trong cài đặt trình duyệt.',
        'PERMISSION_DENIED',
        error
      );
    
    case 'NotFoundError':
      return new CameraError(
        'Không tìm thấy camera trên thiết bị này.',
        'CAMERA_NOT_FOUND',
        error
      );
    
    case 'NotReadableError':
      return new CameraError(
        'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác đang sử dụng camera.',
        'CAMERA_IN_USE',
        error
      );
    
    case 'OverconstrainedError':
      return new CameraError(
        'Cài đặt camera không được hỗ trợ trên thiết bị này.',
        'CONSTRAINTS_NOT_SUPPORTED',
        error
      );
    
    case 'SecurityError':
      return new CameraError(
        'Truy cập camera bị chặn do cài đặt bảo mật.',
        'SECURITY_ERROR',
        error
      );
    
    case 'TypeError':
      return new CameraError(
        'Cài đặt camera không hợp lệ.',
        'INVALID_CONSTRAINTS',
        error
      );
    
    default:
      return new CameraError(
        `Lỗi không xác định: ${err.message || 'Không thể truy cập camera'}`,
        'UNKNOWN_ERROR',
        error
      );
  }
};

// Kiểm tra quyền camera
export const checkCameraPermission = async (): Promise<PermissionState | null> => {
  if (!navigator.permissions) {
    console.warn('⚠️ Permissions API không được hỗ trợ');
    return null;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return permission.state;
  } catch (error) {
    console.warn('⚠️ Không thể kiểm tra quyền camera:', error);
    return null;
  }
};

// Test camera đơn giản
export const testCameraAccess = async (): Promise<boolean> => {
  try {
    const stream = await safeGetUserMedia({ 
      video: { facingMode: 'user' },
      audio: false 
    });
    
    // Đóng stream ngay lập tức
    stream.getTracks().forEach(track => track.stop());
    return true;
    
  } catch (error) {
    console.error('❌ Camera test failed:', error);
    return false;
  }
};

// Lấy danh sách camera có sẵn
export const getAvailableCameras = async (): Promise<MediaDeviceInfo[]> => {
  try {
    const devices = await safeEnumerateDevices();
    console.log(`📹 Tìm thấy ${devices.length} camera`);
    return devices;
  } catch (error) {
    console.error('❌ Không thể lấy danh sách camera:', error);
    throw error;
  }
};

// Kiểm tra có nhiều camera không
export const hasMultipleCameras = async (): Promise<boolean> => {
  try {
    const cameras = await getAvailableCameras();
    return cameras.length > 1;
  } catch (error) {
    console.warn('⚠️ Không thể kiểm tra số lượng camera:', error);
    return false;
  }
};

// Lấy độ phân giải tối ưu cho thiết bị
export const getOptimalResolution = () => {
  if (!CameraEnvironment.isMobile()) {
    return { width: 640, height: 480, quality: 0.8 };
  }
  
  // Mobile: độ phân giải tối ưu theo từng platform
  if (CameraEnvironment.isAndroid()) {
    return { width: 480, height: 640, quality: 0.75 };
  } else if (CameraEnvironment.isIOS()) {
    return { width: 540, height: 720, quality: 0.8 };
  } else {
    return { width: 480, height: 640, quality: 0.7 };
  }
};

// Tối ưu hóa ảnh cho mobile (giảm dung lượng)
export const optimizeImageForMobile = (canvas: HTMLCanvasElement): string => {
  const { quality } = getOptimalResolution();
  
  // Sử dụng JPEG với chất lượng thấp hơn cho mobile để giảm dung lượng
  return canvas.toDataURL('image/jpeg', quality);
}; 