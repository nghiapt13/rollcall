'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCheckoutWithCamera } from '@/hooks/use-checkout-with-camera';
import { useAttendanceStatus } from '@/hooks/use-attendance-status';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { Button } from '@/components/ui/button';
import { LogOut, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';
import { CheckoutDialog } from './checkout-dialog';
import { UserRole } from '@/generated/prisma';

export function CheckoutButton() {
    const { user } = useUser();
    const { checkoutStatus, handleCheckout, handlePhotoCapture, resetStatus, hasCheckedOutToday, isCheckingStatus } = useCheckoutWithCamera();
    const { hasCheckedInToday, isLoading: isCheckingAttendance } = useAttendanceStatus();
    const { canAttendance, role, isLoading: roleLoading, error: roleError } = useCurrentRole();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
        // Ngay lập tức kiểm tra và chạy quá trình checkout
        setTimeout(() => {
            handleCheckout();
        }, 100);
    };

    const handleCloseDialog = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            resetStatus();
        }
    };

    // Nếu đang kiểm tra trạng thái ban đầu hoặc quyền
    if (isCheckingAttendance || roleLoading) {
        return (
            <div className="flex flex-col items-center space-y-2">
                <Button disabled size="lg" className="px-6 py-3 bg-gray-400">
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Đang kiểm tra trạng thái...
                </Button>
            </div>
        );
    }

    // Không hiển thị checkout button nếu chưa check-in
    if (hasCheckedInToday === false) {
        return (
            <div className="flex flex-col items-center space-y-2">
                <Button disabled size="lg" className="px-6 py-3 bg-gray-400">
                    <Info className="w-4 h-4 mr-2" />
                    Chưa check-in hôm nay
                </Button>
                <p className="text-sm text-gray-600 text-center">
                    Bạn cần check-in trước khi có thể checkout
                </p>
            </div>
        );
    }

    // Hiển thị trạng thái đã checkout
    if (hasCheckedOutToday) {
        return (
            <div className="flex flex-col items-center space-y-2">
                <Button disabled size="lg" className="px-6 py-3 bg-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Đã checkout hôm nay
                </Button>
                <p className="text-sm text-green-600 text-center">
                    Bạn đã checkout thành công cho hôm nay. Về nhà cẩn thận nhé 💗
                </p>
            </div>
        );
    }

    // Hiển thị button checkout bình thường
    return (
        <div className="flex flex-col items-center space-y-2">
            <Button 
                onClick={handleOpenDialog}
                disabled={isCheckingStatus || !canAttendance}
                size="lg" 
                className={`px-6 py-3 ${
                    canAttendance 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'bg-gray-400 cursor-not-allowed text-gray-200'
                }`}
            >
                {isCheckingStatus ? (
                    <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Đang kiểm tra...
                    </>
                ) : (
                    <>
                        <LogOut className="w-4 h-4 mr-2" />
                        Checkout
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
                                : 'Bạn không có quyền checkout. Vui lòng liên hệ quản trị viên.'
                        }
                    </span>
                </div>
            )}

            <CheckoutDialog
                isOpen={isDialogOpen}
                onOpenChange={handleCloseDialog}
                checkoutStatus={checkoutStatus}
                onCheckout={handleCheckout}
                onPhotoCapture={handlePhotoCapture}
            />
        </div>
    );
}