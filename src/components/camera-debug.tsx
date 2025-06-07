'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Camera, X } from 'lucide-react';

interface DebugInfo {
  timestamp?: string;
  browser?: string;
  isHttps?: boolean;
  mediaDevicesSupported?: boolean;
  getUserMediaSupported?: boolean;
  permissions?: string | null;
  devices?: Array<{ deviceId: string; label: string; kind: string }>;
  cameraTest?: string | null;
  errorDetails?: { name: string; message: string; constraint?: string } | null;
}

export function CameraDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCameraSupport = async () => {
    setIsLoading(true);
    setError(null);
    
    const info: DebugInfo = {
      timestamp: new Date().toLocaleString('vi-VN'),
      browser: navigator.userAgent,
      isHttps: window.location.protocol === 'https:',
      mediaDevicesSupported: !!navigator.mediaDevices,
      getUserMediaSupported: !!navigator.mediaDevices?.getUserMedia,
      permissions: null,
      devices: [],
      cameraTest: null,
      errorDetails: null
    };

    try {
      // 1. Check basic support
      
      // 2. Check permissions
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          info.permissions = permission.state;
        } catch {
          info.permissions = 'check_failed';
        }
      }

      // 3. List devices
      try {
        const { safeEnumerateDevices } = await import('@/lib/camera-utils');
        const devices = await safeEnumerateDevices();
        info.devices = devices.map(device => ({
          deviceId: device.deviceId,
          label: device.label || 'Unknown Camera',
          kind: device.kind
        }));
        console.log('📹 Available cameras:', info.devices);
      } catch (e) {
        info.devices = [{ deviceId: 'error', label: 'enum_failed', kind: 'videoinput' }];
        console.log('⚠️ Device enumeration failed:', e);
      }

      // 4. Test camera access
      try {
        console.log('🎥 Testing camera access...');
        const { safeGetUserMedia } = await import('@/lib/camera-utils');
        const stream = await safeGetUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });

        info.cameraTest = 'success';
        console.log('✅ Camera test successful!');
        console.log('📊 Stream info:', {
          active: stream.active,
          tracks: stream.getVideoTracks().length,
          trackSettings: stream.getVideoTracks()[0]?.getSettings()
        });

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        
      } catch (e: unknown) {
        const error = e as Error;
        info.cameraTest = 'failed';
        info.errorDetails = {
          name: error.name,
          message: error.message,
          constraint: (error as Error & { constraint?: string }).constraint
        };
        console.error('❌ Camera test failed:', error);
        setError(`Lỗi camera: ${error.name} - ${error.message}`);
      }

    } catch (e: unknown) {
      const error = e as Error;
      console.error('❌ Debug failed:', error);
      setError(`Lỗi debug: ${error.message}`);
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  useEffect(() => {
    checkCameraSupport();
  }, []);

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'success':
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'denied':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Camera Debug</h2>
        <Button 
          onClick={checkCameraSupport} 
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Lỗi:</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Basic Support */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.isHttps ? 'success' : 'failed')}
            <span>HTTPS: {debugInfo.isHttps ? 'Có' : 'Không'}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.mediaDevicesSupported ? 'success' : 'failed')}
            <span>MediaDevices API: {debugInfo.mediaDevicesSupported ? 'Có' : 'Không'}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.getUserMediaSupported ? 'success' : 'failed')}
            <span>GetUserMedia: {debugInfo.getUserMediaSupported ? 'Có' : 'Không'}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.permissions ?? null)}
            <span>Quyền Camera: {debugInfo.permissions || 'Chưa rõ'}</span>
          </div>
        </div>

        {/* Camera Test */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(debugInfo.cameraTest ?? null)}
            <span className="font-medium">
              Test Camera: {debugInfo.cameraTest === 'success' ? 'Thành công' : 
                          debugInfo.cameraTest === 'failed' ? 'Thất bại' : 'Đang kiểm tra...'}
            </span>
          </div>
          
          {debugInfo.errorDetails && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              <strong>Chi tiết lỗi:</strong><br/>
              Tên: {debugInfo.errorDetails.name}<br/>
              Thông báo: {debugInfo.errorDetails.message}<br/>
              {debugInfo.errorDetails.constraint && (
                <>Constraint: {debugInfo.errorDetails.constraint}</>
              )}
            </div>
          )}
        </div>

        {/* Available Cameras */}
        <div>
          <h3 className="font-medium mb-2">Cameras có sẵn ({debugInfo.devices?.length || 0}):</h3>
          {debugInfo.devices && debugInfo.devices.length > 0 ? (
            <ul className="space-y-1">
              {debugInfo.devices.map((device: { deviceId: string; label: string; kind: string }, index: number) => (
                <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                  {device.label || `Camera ${index + 1}`} ({device.deviceId?.slice(0, 20)}...)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">Không tìm thấy camera hoặc chưa có quyền truy cập</p>
          )}
        </div>

        {/* Browser Info */}
        <details className="cursor-pointer">
          <summary className="font-medium">Thông tin trình duyệt</summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>

      {/* Giải pháp */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Giải pháp thường gặp:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Không HTTPS:</strong> Truy cập qua https://localhost thay vì http://</li>
          <li>• <strong>Quyền bị từ chối:</strong> Click vào icon 🔒 trên thanh địa chỉ và cho phép Camera</li>
          <li>• <strong>Camera đang sử dụng:</strong> Đóng các ứng dụng khác đang dùng camera</li>
          <li>• <strong>Không có camera:</strong> Kiểm tra thiết bị có camera không</li>
          <li>• <strong>Trình duyệt cũ:</strong> Cập nhật lên phiên bản mới nhất</li>
        </ul>
      </div>
    </div>
  );
} 