'use client';

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, CheckCircle2, X, LogOut, Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CameraCapture } from './camera-capture';

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutStatus: 'idle' | 'checking' | 'sending' | 'success' | 'error' | 'already_checked_out' | 'unauthorized' | 'not_checked_in' | 'camera' | 'uploading';
  onCheckout: () => void;
  onPhotoCapture?: (imageBlob: Blob) => void;
}

export function CheckoutDialog({ 
  isOpen, 
  onOpenChange, 
  checkoutStatus, 
  onCheckout,
  onPhotoCapture
}: CheckoutDialogProps) {

  // Tự động đóng dialog sau khi thành công hoặc có lỗi (copy từ attendance)
  useEffect(() => {
    if (checkoutStatus === 'success' || checkoutStatus === 'already_checked_out' || checkoutStatus === 'unauthorized') {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 10000); // Đóng sau 3 giây
      
      return () => clearTimeout(timer);
    }
  }, [checkoutStatus, onOpenChange]);

  const getStatusContent = () => {
    switch (checkoutStatus) {
      case 'idle':
        return {
          icon: <Clock className="w-12 h-12 text-orange-600 animate-spin" />,
          title: 'Đang chuẩn bị...',
          description: 'Đang khởi tạo quá trình checkout, vui lòng đợi một chút...',
          showButton: false
        };
        
      case 'camera':
        return {
          icon: <Camera className="w-12 h-12 text-orange-600" />,
          title: 'Chụp ảnh xác thực checkout',
          description: 'Vui lòng chụp ảnh để hoàn tất quá trình checkout',
          showButton: false,
          showCamera: true
        };
        
      case 'uploading':
        return {
          icon: <Clock className="w-12 h-12 text-orange-600 animate-spin" />,
          title: 'Đang xử lý...',
          description: 'Đang tải ảnh và hoàn tất checkout. Vui lòng đợi một chút.',
          showButton: false
        };
        
      case 'checking':
        return {
          icon: <Clock className="w-12 h-12 text-orange-600 animate-spin" />,
          title: 'Đang kiểm tra...',
          description: 'Đang kiểm tra xem bạn đã checkout hôm nay chưa. Vui lòng đợi một chút.',
          showButton: false
        };
        
      case 'sending':
        return {
          icon: <Clock className="w-12 h-12 text-orange-600 animate-spin" />,
          title: 'Đang ghi nhận...',
          description: 'Đang ghi nhận thông tin checkout của bạn. Vui lòng đợi một chút.',
          showButton: false
        };
        
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600" />,
          title: 'Checkout thành công!',
          description: 'Chúc mừng! Bạn đã checkout thành công cho hôm nay. Tin nhắn sẽ tự động đóng sau 3 giây.',
          showButton: false
        };
        
      case 'already_checked_out':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-amber-600" />,
          title: 'Đã checkout rồi',
          description: 'Hôm nay bạn đã checkout thành công. Mỗi email chỉ được checkout một lần mỗi ngày.',
          showButton: false
        };
        
      case 'not_checked_in':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-600" />,
          title: 'Chưa check-in',
          description: 'Bạn cần check-in trước khi có thể checkout. Vui lòng thực hiện check-in trước.',
          showButton: false
        };
        
      case 'unauthorized':
        return {
          icon: <X className="w-12 h-12 text-red-600" />,
          title: 'Không có quyền',
          description: 'Bạn không có quyền thực hiện checkout. Vui lòng liên hệ quản trị viên để được cấp quyền.',
          showButton: false
        };
        
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-600" />,
          title: 'Có lỗi xảy ra',
          description: 'Không thể thực hiện checkout. Vui lòng kiểm tra kết nối internet và thử lại.',
          showButton: true,
          buttonText: 'Thử lại',
          buttonDisabled: false
        };
        
      default:
        return {
          icon: <LogOut className="w-12 h-12 text-orange-600" />,
          title: 'Checkout',
          description: 'Sẵn sàng checkout.',
          showButton: true,
          buttonText: 'Checkout',
          buttonDisabled: false
        };
    }
  };

  const statusContent = getStatusContent();
  const isLoading = checkoutStatus === 'checking' || checkoutStatus === 'sending' || checkoutStatus === 'uploading';

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
            isProcessing={checkoutStatus === 'uploading'}
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
                onClick={onCheckout}
                disabled={statusContent.buttonDisabled || isLoading}
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
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