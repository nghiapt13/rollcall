'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useManualAttendance } from '@/hooks/use-manual-attendance';
import { useAttendanceStatus } from '@/hooks/use-attendance-status';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { Button } from '@/components/ui/button';
import { CheckCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { AttendanceDialog } from '@/components/attendance-dialog';
import { UserRole } from '@/generated/prisma';

export function AttendanceButton() {
  const { user } = useUser();
  const router = useRouter();
  const { attendanceStatus, handleAttendance, handlePhotoCapture, resetStatus } = useManualAttendance();
  const { hasCheckedInToday, isLoading: statusLoading, refreshStatus } = useAttendanceStatus();
  const { canAttendance, role, isLoading: roleLoading, error: roleError } = useCurrentRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Theo dõi trạng thái success để refresh ngay lập tức
  useEffect(() => {
    if (attendanceStatus === 'success') {
      // Refresh ngay khi checkin thành công
      refreshStatus();
      router.refresh();
    }
  }, [attendanceStatus, refreshStatus, router]);

  // Nếu đang kiểm tra trạng thái ban đầu hoặc quyền
  if (statusLoading || roleLoading) {
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
    // Ngay lập tức kiểm tra và chạy quá trình điểm danh
    setTimeout(() => {
      handleAttendance();
    }, 100); // Delay nhỏ để dialog kịp mở
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetStatus(); // Reset trạng thái khi đóng dialog
    }
  };

  // Nếu đã điểm danh rồi
  if (hasCheckedInToday) {
    return (
      <Button disabled size="lg" className="px-6 py-3 bg-green-600">
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Đã check-in hôm nay
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={handleOpenDialog}
        disabled={statusLoading || !canAttendance}
        size="lg"
        className={`px-6 py-3 ${canAttendance
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
            Check-in
          </>
        )}
      </Button>

      {/* Thông báo khi không có quyền */}
      {!canAttendance && user && (
        <div className="flex items-center space-x-2 text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-lg max-w-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>
            {role === UserRole.USER
              ? 'Bạn đang sử dụng tài khoản không được phòng CTSV BTEC FPT ĐN cấp phép. Vui lòng liên hệ Trưởng phòng CTSV BTEC FPT ĐN để xác thực.'

              : roleError
                ? `Lỗi kiểm tra quyền: ${roleError}`
                : 'Bạn không có quyền điểm danh. Vui lòng liên hệ quản trị viên.'
            }
          </span>
        </div>
      )}

      {/* Hiển thị role hiện tại cho debug */}
      {process.env.NODE_ENV === 'development' && role && (
        <div className="text-xs text-gray-500">
          Role hiện tại: {role}
        </div>
      )}

      <AttendanceDialog
        isOpen={isDialogOpen}
        onOpenChange={handleCloseDialog}
        attendanceStatus={attendanceStatus}
        onAttendance={handleAttendance}
        onPhotoCapture={handlePhotoCapture}
      />
    </div>
  );
}