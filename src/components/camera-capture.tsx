'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Check, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { 
  CameraEnvironment, 
  safeGetUserMedia, 
  safeEnumerateDevices, 
  testCameraAccess,
  getOptimalResolution

} from '@/lib/camera-utils';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

// Sử dụng CameraEnvironment từ utils
const supportsGetUserMedia = CameraEnvironment.hasGetUserMedia;

export function CameraCapture({ onCapture, onCancel, isProcessing }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMobile, setIsMobile] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isCheckingCamera, setIsCheckingCamera] = useState(true);

  // Kiểm tra thiết bị và camera khi component mount
  useEffect(() => {
    const checkDeviceAndCamera = async () => {
      setIsMobile(!!CameraEnvironment.isMobile());

      if (!CameraEnvironment.hasGetUserMedia()) {
        setCameraError('Trình duyệt không hỗ trợ camera. Vui lòng sử dụng trình duyệt hiện đại.');
        setIsCheckingCamera(false);
        return;
      }

      try {
        // Kiểm tra danh sách camera có sẵn
        const videoDevices = await safeEnumerateDevices();

        console.log('📹 Phát hiện camera:', videoDevices.length);
        setHasMultipleCameras(videoDevices.length > 1);

        // Thử truy cập camera để kiểm tra quyền
        await testCameraAccessLocal();

      } catch (error) {
        console.error('❌ Lỗi kiểm tra camera:', error);
        handleCameraError(error);
      } finally {
        setIsCheckingCamera(false);
      }
    };

    checkDeviceAndCamera();
  }, []);

  // Test camera access với safeGetUserMedia
  const testCameraAccessLocal = async () => {
    try {
      const stream = await safeGetUserMedia({
        video: {
          facingMode: 'user',
          // Để camera-utils tự động điều chỉnh độ phân giải
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      // Dừng stream ngay sau khi test
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Camera access test thành công');
      return true;

    } catch (error: unknown) {
      console.error('❌ Camera access test failed:', error);
      throw error;
    }
  };

  // Xử lý lỗi camera cụ thể
  const handleCameraError = (error: unknown) => {
    const err = error as Error;
    let errorMessage = 'Không thể truy cập camera';

    if (err.name === 'NotAllowedError') {
      errorMessage = 'Vui lòng cho phép truy cập camera trong cài đặt trình duyệt';
    } else if (err.name === 'NotFoundError') {
      errorMessage = 'Không tìm thấy camera trên thiết bị';
    } else if (err.name === 'NotReadableError') {
      errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác';
    } else if (err.name === 'OverconstrainedError') {
      errorMessage = 'Cấu hình camera không được hỗ trợ';
    } else if (err.name === 'SecurityError') {
      errorMessage = 'Truy cập camera bị chặn do bảo mật';
    }

    setCameraError(errorMessage);
  };

  // Cấu hình video cho react-webcam (được điều chỉnh bởi camera-utils)
  const optimalRes = getOptimalResolution();
  const videoConstraints = {
    width: optimalRes.width,
    height: optimalRes.height,
    facingMode: facingMode,
    frameRate: isMobile ? 12 : 25, // Frame rate thấp hơn cho mobile
    aspectRatio: isMobile ? 3/4 : 4/3
  };

  // Chuyển đổi camera (front/back) trên mobile
  const switchCamera = useCallback(() => {
    if (!hasMultipleCameras) return;

    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    setCameraReady(false);

    console.log(`📱 Chuyển camera: ${newFacingMode === 'user' ? 'trước' : 'sau'}`);
  }, [facingMode, hasMultipleCameras]);

  // Xử lý khi camera sẵn sàng
  const handleUserMedia = useCallback((stream: MediaStream) => {
    console.log('✅ Camera đã sẵn sàng với getUserMedia');
    console.log('📹 Stream settings:', stream.getVideoTracks()[0]?.getSettings());
    setCameraReady(true);
    setCameraError(null);
  }, []);

  // Xử lý lỗi camera từ react-webcam
  const handleUserMediaError = useCallback((error: unknown) => {
    console.error('❌ Lỗi camera react-webcam:', error);
    handleCameraError(error);
    setCameraReady(false);
  }, []);

  // Chụp ảnh
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current || !cameraReady) return;

    const imageSrc = webcamRef.current.getScreenshot({
      width: optimalRes.width,
      height: optimalRes.height
    });

    if (imageSrc) {
      setCapturedImage(imageSrc);
      console.log('📸 Đã chụp ảnh', isMobile ? '(Mobile)' : '(Desktop)', 
                  `- Độ phân giải: ${optimalRes.width}x${optimalRes.height}`);
    } else {
      console.error('❌ Không thể chụp ảnh');
      setCameraError('Không thể chụp ảnh. Vui lòng thử lại.');
    }
  }, [cameraReady, isMobile, optimalRes]);

  // Chụp lại
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Xác nhận ảnh
  const confirmPhoto = useCallback(() => {
    if (!capturedImage) return;

    // Chuyển đổi base64 thành blob
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        console.log('✅ Đã chuyển đổi ảnh thành blob');
        onCapture(blob);
      })
      .catch(error => {
        console.error('❌ Lỗi chuyển đổi ảnh:', error);
        setCameraError('Lỗi xử lý ảnh. Vui lòng thử lại.');
      });
  }, [capturedImage, onCapture]);

  // Thử lại khi có lỗi
  const retryCamera = useCallback(() => {
    setCameraError(null);
    setCameraReady(false);
    setCapturedImage(null);
    setIsCheckingCamera(true);

    // Test lại camera
    testCameraAccess()
      .then(() => setIsCheckingCamera(false))
      .catch(error => {
        handleCameraError(error);
        setIsCheckingCamera(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          {isMobile ? (
            <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
          ) : (
            <Monitor className="w-5 h-5 mr-2 text-blue-600" />
          )}
          <h3 className="text-lg font-semibold">
            Chụp ảnh xác thực {isMobile ? '(Di động)' : '(Máy tính)'}
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Vui lòng chụp ảnh để xác thực danh tính khi chấm công
        </p>
      </div>

      {isCheckingCamera ? (
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Camera className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-pulse" />
          <p className="text-blue-700 text-sm">Đang kiểm tra camera...</p>
        </div>
      ) : cameraError ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 text-sm mb-3">{cameraError}</p>
          {!supportsGetUserMedia() && (
            <p className="text-xs text-red-600 mb-3">
              Hãy thử sử dụng Chrome, Firefox, Safari hoặc Edge phiên bản mới nhất
            </p>
          )}
          <Button
            onClick={retryCamera}
            className="mt-2"
            size="sm"
          >
            Thử lại
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview Camera hoặc Ảnh đã chụp */}
          <div className={`relative bg-black rounded-lg overflow-hidden ${isMobile ? 'aspect-[9/16]' : 'aspect-video'
            }`}>
            {!capturedImage ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  className="w-full h-full object-cover"
                  mirrored={facingMode === 'user'}
                />

                {/* Camera switching cho mobile */}
                {isMobile && hasMultipleCameras && cameraReady && (
                  <button
                    onClick={switchCamera}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    disabled={isProcessing}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}

                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">
                        Đang khởi động camera {facingMode === 'user' ? 'trước' : 'sau'}...
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Image
                src={capturedImage}
                alt="Ảnh đã chụp"
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Nút điều khiển */}
          <div className="flex justify-center space-x-3">
            {!capturedImage ? (
              <>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  disabled={isProcessing}
                  size={isMobile ? "lg" : "default"}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
                <Button
                  onClick={capturePhoto}
                  disabled={!cameraReady || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                  size={isMobile ? "lg" : "default"}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Chụp ảnh
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  disabled={isProcessing}
                  size={isMobile ? "lg" : "default"}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Chụp lại
                </Button>
                <Button
                  onClick={confirmPhoto}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                  size={isMobile ? "lg" : "default"}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              </>
            )}
          </div>

          {/* Thông tin debug cho mobile */}
          {isMobile && cameraReady && (
            <div className="text-xs text-center text-gray-500">
              Camera: {facingMode === 'user' ? 'Trước' : 'Sau'} •
              Độ phân giải: {videoConstraints.width}x{videoConstraints.height} •
              FPS: {videoConstraints.frameRate}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 