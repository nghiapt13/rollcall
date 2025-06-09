'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCheckoutWithCamera } from '@/hooks/use-checkout-with-camera';
import { useAttendanceStatus } from '@/hooks/use-attendance-status';
import { Button } from '@/components/ui/button';
import { LogOut, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';
import { CheckoutDialog } from './checkout-dialog';
import { isAuthorizedUser } from '@/config/authorized-users';

export function CheckoutButton() {
    const { user } = useUser();
    const { checkoutStatus, handleCheckout, handlePhotoCapture, resetStatus, hasCheckedOutToday, isCheckingStatus } = useCheckoutWithCamera();
    const { hasCheckedInToday, isLoading: isCheckingAttendance } = useAttendanceStatus();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Kiểm tra quyền truy cập
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    const hasPermission = userEmail ? isAuthorizedUser(userEmail) : false;

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

    // Không hiển thị gì khi đang kiểm tra trạng thái attendance
    if (isCheckingAttendance) {
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

    // Không hiển thị gì nếu không có quyền
    if (!hasPermission) {
        return (
            <div className="flex flex-col items-center space-y-2">
                <Button disabled size="lg" className="px-6 py-3 bg-gray-400">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Không có quyền checkout
                </Button>
                <p className="text-sm text-gray-600 text-center">
                    Vui lòng liên hệ quản trị viên để được cấp quyền
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
                size="lg" 
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isCheckingStatus}
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