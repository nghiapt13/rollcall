'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Smartphone, Globe, Lock, Camera, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { CameraEnvironment } from '@/lib/camera-utils';

interface TroubleshootStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted?: boolean;
}

export function CameraTroubleshoot() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const troubleshootSteps: TroubleshootStep[] = [
    {
      id: 'https',
      title: 'Kiểm tra HTTPS',
      description: CameraEnvironment.isSecureContext() 
        ? '✅ Trang web đang chạy trên HTTPS - OK!'
        : '❌ Trang web cần chạy trên HTTPS để sử dụng camera. Vui lòng truy cập qua https://...',
      icon: <Globe className="w-5 h-5" />,
      isCompleted: CameraEnvironment.isSecureContext()
    },
    {
      id: 'browser_support',
      title: 'Hỗ trợ trình duyệt',
      description: CameraEnvironment.hasMediaDevices()
        ? '✅ Trình duyệt hỗ trợ Camera API - OK!'
        : '❌ Trình duyệt không hỗ trợ Camera API. Vui lòng cập nhật trình duyệt hoặc sử dụng Chrome/Safari.',
      icon: <Globe className="w-5 h-5" />,
      isCompleted: CameraEnvironment.hasMediaDevices()
    },
    {
      id: 'permissions',
      title: 'Cấp quyền truy cập camera',
      description: 'Đảm bảo bạn đã cho phép trang web truy cập camera. Kiểm tra biểu tượng khóa/camera trên thanh địa chỉ.',
      icon: <Lock className="w-5 h-5" />
    },
    {
      id: 'camera_not_in_use',
      title: 'Camera không bị sử dụng',
      description: 'Đóng tất cả ứng dụng khác đang sử dụng camera (như ứng dụng camera, video call, etc.)',
      icon: <Camera className="w-5 h-5" />
    },
    {
      id: 'reload_page',
      title: 'Tải lại trang',
      description: 'Sau khi kiểm tra các bước trên, hãy tải lại trang để thử lại.',
      icon: <RefreshCw className="w-5 h-5" />
    }
  ];

  // Hướng dẫn cụ thể cho từng hệ điều hành
  const getMobileSpecificInstructions = () => {
    if (CameraEnvironment.isIOS()) {
      return {
        title: 'Hướng dẫn cho iOS (iPhone/iPad)',
        steps: [
          'Mở Cài đặt > Safari > Camera',
          'Đảm bảo "Ask" hoặc "Allow" được chọn',
          'Trong Safari, nhấn vào biểu tượng "aA" trên thanh địa chỉ',
          'Chọn "Website Settings" > "Camera" > "Allow"'
        ]
      };
    } else if (CameraEnvironment.isAndroid()) {
      return {
        title: 'Hướng dẫn cho Android',
        steps: [
          'Mở Cài đặt > Ứng dụng > Chrome (hoặc trình duyệt bạn đang dùng)',
          'Chọn Quyền > Camera > Cho phép',
          'Trong Chrome, nhấn vào biểu tượng khóa bên cạnh địa chỉ web',
          'Đảm bảo Camera được đặt thành "Allow"'
        ]
      };
    } else {
      return {
        title: 'Hướng dẫn chung cho thiết bị di động',
        steps: [
          'Kiểm tra cài đặt quyền trong trình duyệt',
          'Đảm bảo camera không bị các ứng dụng khác sử dụng',
          'Thử tải lại trang web',
          'Nếu vẫn không được, hãy thử trình duyệt khác'
        ]
      };
    }
  };

  const mobileInstructions = getMobileSpecificInstructions();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Khắc phục lỗi camera
        </h2>
        <p className="text-gray-600">
          Làm theo các bước dưới đây để khắc phục vấn đề truy cập camera
        </p>
      </div>

      {/* Thông tin thiết bị */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="w-5 h-5" />
          <span className="font-medium">Thông tin thiết bị</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Thiết bị: {CameraEnvironment.isMobile() ? 'Di động' : 'Máy tính'}</div>
          <div>Hệ điều hành: {
            CameraEnvironment.isIOS() ? 'iOS' : 
            CameraEnvironment.isAndroid() ? 'Android' : 
            'Khác'
          }</div>
          <div>HTTPS: {CameraEnvironment.isSecureContext() ? 'Có' : 'Không'}</div>
          <div>Hỗ trợ Camera API: {CameraEnvironment.hasMediaDevices() ? 'Có' : 'Không'}</div>
        </div>
      </div>

      {/* Các bước khắc phục */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Các bước khắc phục</h3>
        {troubleshootSteps.map((step, index) => (
          <div key={step.id} className="border rounded-lg p-4">
            <button
              onClick={() => toggleStep(step.id)}
              className="w-full flex items-start gap-3 text-left"
            >
              <div className="flex-shrink-0 mt-1">
                {step.isCompleted || completedSteps.includes(step.id) ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {step.icon}
                  <span className="font-medium">{step.title}</span>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Hướng dẫn cụ thể cho mobile */}
      {CameraEnvironment.isMobile() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">{mobileInstructions.title}</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            {mobileInstructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Nút thử lại */}
      <div className="text-center">
        <Button 
          onClick={() => window.location.reload()}
          className="px-6 py-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tải lại trang để thử lại
        </Button>
      </div>

      {/* Liên hệ hỗ trợ */}
      <div className="text-center text-sm text-gray-500">
        Nếu vẫn gặp vấn đề, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.
      </div>
    </div>
  );
} 