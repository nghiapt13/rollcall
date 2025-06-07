'use client';

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, CheckCircle2, X, Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CameraCapture } from './camera-capture';

interface AttendanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  attendanceStatus: 'idle' | 'checking' | 'sending' | 'success' | 'error' | 'already_checked_in' | 'unauthorized' | 'camera' | 'uploading';
  onAttendance: () => void;
  onPhotoCapture?: (imageBlob: Blob) => void;
}

export function AttendanceDialog({ 
  isOpen, 
  onOpenChange, 
  attendanceStatus, 
  onAttendance,
  onPhotoCapture
}: AttendanceDialogProps) {

  // Tự động đóng dialog sau khi thành công hoặc đã điểm danh
  useEffect(() => {
    if (attendanceStatus === 'success' || attendanceStatus === 'already_checked_in' || attendanceStatus === 'unauthorized') {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000); // Đóng sau 3 giây
      
      return () => clearTimeout(timer);
    }
  }, [attendanceStatus, onOpenChange]);

  const getStatusContent = () => {
    switch (attendanceStatus) {
      case 'idle':
        return {
          icon: <Clock className="w-12 h-12 text-blue-600 animate-spin" />,
          title: 'Đang chuẩn bị...',
          description: 'Đang khởi tạo quá trình chấm công, vui lòng đợi một chút...',
          showButton: false
        };
        
      case 'camera':
        return {
          icon: <Camera className="w-12 h-12 text-blue-600" />,
          title: 'Chụp ảnh xác thực',
          description: 'Vui lòng chụp ảnh để hoàn tất quá trình chấm công',
          showButton: false,
          showCamera: true
        };
        
      case 'uploading':
        return {
          icon: <Clock className="w-12 h-12 text-blue-600 animate-spin" />,
          title: 'Đang xử lý...',
          description: 'Đang tải ảnh và hoàn tất chấm công. Vui lòng đợi một chút.',
          showButton: false
        };
        
      case 'checking':
        return {
          icon: <Clock className="w-12 h-12 text-blue-600 animate-spin" />,
          title: 'Đang kiểm tra...',
          description: 'Đang kiểm tra xem bạn đã chấm công hôm nay chưa. Vui lòng đợi một chút.',
          showButton: false
        };
        
      case 'sending':
        return {
          icon: <Clock className="w-12 h-12 text-blue-600 animate-spin" />,
          title: 'Đang ghi nhận...',
          description: 'Đang ghi nhận thông tin chấm công của bạn. Vui lòng đợi một chút.',
          showButton: false
        };
        
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600" />,
          title: 'Chấm công thành công!',
          description: 'Chúc mừng! Bạn đã chấm công thành công cho hôm nay. Tin nhắn sẽ tự động đóng sau 3 giây.',
          showButton: false
        };
        
              case 'already_checked_in':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-amber-600" />,
          title: 'Đã chấm công rồi',
          description: 'Hôm nay bạn đã chấm công thành công. Mỗi email chỉ được chấm công một lần mỗi ngày.',
          showButton: false
        };
        
      case 'unauthorized':
        return {
          icon: <X className="w-12 h-12 text-red-600" />,
          title: 'Không có quyền',
          description: 'Bạn không có quyền thực hiện chấm công. Vui lòng liên hệ quản trị viên để được cấp quyền.',
          showButton: false
        };
        
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-600" />,
          title: 'Có lỗi xảy ra',
          description: 'Không thể thực hiện chấm công. Vui lòng kiểm tra kết nối internet và thử lại.',
          showButton: true,
          buttonText: 'Thử lại',
          buttonDisabled: false
        };
        
      default:
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600" />,
          title: 'Chấm công',
          description: 'Sẵn sàng chấm công.',
          showButton: true,
          buttonText: 'Chấm công',
          buttonDisabled: false
        };
    }
  };

  const statusContent = getStatusContent();
  const isLoading = attendanceStatus === 'checking' || attendanceStatus === 'sending' || attendanceStatus === 'uploading';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={statusContent.showCamera ? "sm:max-w-2xl" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {statusContent.title}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {statusContent.showCamera && onPhotoCapture ? (
          <CameraCapture
            onCapture={onPhotoCapture}
            onCancel={() => onOpenChange(false)}
            isProcessing={attendanceStatus === 'uploading'}
          />
        ) : (
          <div className="flex flex-col items-center text-center py-6">
            <div className="mb-4">
              {statusContent.icon}
            </div>
            
            <DialogDescription className="text-base mb-6">
              {statusContent.description}
            </DialogDescription>
            
            {statusContent.showButton && (
              <Button
                onClick={onAttendance}
                disabled={statusContent.buttonDisabled || isLoading}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {statusContent.buttonText}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 