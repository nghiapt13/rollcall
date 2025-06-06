'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useManualAttendance } from '@/hooks/use-manual-attendance';
import { useAttendanceStatus } from '@/hooks/use-attendance-status';
import { Button } from '@/components/ui/button';
import { CheckCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { AttendanceDialog } from '@/components/attendance-dialog';
import { isAuthorizedUser } from '@/config/authorized-users';

export function AttendanceButton() {
  const { user } = useUser();
  const { attendanceStatus, handleAttendance, resetStatus } = useManualAttendance();
  const { hasCheckedInToday, isLoading: statusLoading, refreshStatus } = useAttendanceStatus();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Kiểm tra quyền truy cập
  const hasPermission = user?.id ? isAuthorizedUser(user.id) : false;

  // Nếu đang kiểm tra trạng thái ban đầu
  if (statusLoading) {
    return (
      <Button disabled size="lg" className="px-6 py-3">
        <Clock className="w-4 h-4 mr-2 animate-spin" />
        Đang kiểm tra...
      </Button>
    );
  }

  const handleOpenDialog = () => {
    // Kiểm tra lại trước khi mở dialog
    if (hasCheckedInToday) {
      return; // Không làm gì nếu đã điểm danh
    }
    
    setIsDialogOpen(true);
    // Ngay lập tức chạy quá trình điểm danh sau khi mở dialog
    setTimeout(() => {
      handleAttendance();
    }, 100); // Delay nhỏ để dialog kịp mở
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetStatus(); // Reset trạng thái khi đóng dialog
      // Refresh trạng thái điểm danh sau khi đóng dialog
      if (attendanceStatus === 'success') {
        refreshStatus();
      }
    }
  };

  // Nếu đã điểm danh rồi
  if (hasCheckedInToday) {
    return (
      <Button disabled size="lg" className="px-6 py-3 bg-green-600">
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Đã điểm danh hôm nay
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button 
        onClick={handleOpenDialog}
        disabled={statusLoading || !hasPermission}
        size="lg" 
        className={`px-6 py-3 ${
          hasPermission 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-gray-400 cursor-not-allowed text-gray-200'
        }`}
      >
        {statusLoading ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Đang kiểm tra...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Điểm danh
          </>
        )}
      </Button>
      
      {/* Thông báo khi không có quyền */}
      {!hasPermission && user && (
        <div className="flex items-center space-x-2 text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-lg max-w-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Bạn đang sử dụng tài khoản không được phòng CTSV BTEC FPT ĐN cấp phép. Vui lòng chuyển sang tài khoản đã được cấp phép của phòng CTSV BTEC FPT ĐN để điểm danh.</span>
        </div>
      )}
      
      <AttendanceDialog
        isOpen={isDialogOpen}
        onOpenChange={handleCloseDialog}
        attendanceStatus={attendanceStatus}
        onAttendance={handleAttendance}
      />
    </div>
  );
} 