'use client';

import { useUser } from '@clerk/nextjs';
import { CheckCircle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useLoginTracker } from '@/hooks/use-login-tracker';

export function LoginStatus() {
  const { isSignedIn } = useUser();
  const { trackingStatus: status } = useLoginTracker();

  if (!isSignedIn || status === 'idle') {
    return null;
  }

  const statusConfig = {
    checking: {
      icon: <Clock className="w-4 h-4 animate-spin" />,
      text: 'Đang kiểm tra trạng thái chấm công...',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700'
    },
    sending: {
      icon: <Clock className="w-4 h-4 animate-spin" />,
      text: 'Đang ghi nhận thông tin đăng nhập...',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700'
    },
    success: {
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'Đã ghi nhận thông tin đăng nhập thành công',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-700'
    },
    already_checked_in: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      text: 'Hôm nay bạn đã chấm công thành công',
      bgColor: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-700'
    },
    error: {
      icon: <AlertCircle className="w-4 h-4" />,
      text: 'Có lỗi khi ghi nhận thông tin đăng nhập',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-700'
    }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-md border ${currentStatus.bgColor} ${currentStatus.textColor}`}>
      {currentStatus.icon}
      <span className="text-sm font-medium">{currentStatus.text}</span>
    </div>
  );
} 