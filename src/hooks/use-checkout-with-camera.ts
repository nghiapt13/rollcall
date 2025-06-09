import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { sendCheckoutDataToSheet } from '@/lib/google-sheets';

export function useCheckoutWithCamera() {
    const { user } = useUser();
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'checking' | 'sending' | 'success' | 'error' | 'already_checked_out' | 'unauthorized' | 'not_checked_in' | 'camera' | 'uploading'>('idle');
    const [hasCheckedOutToday, setHasCheckedOutToday] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    // Kiểm tra trạng thái checkout khi component mount
    const checkInitialStatus = useCallback(async () => {
        if (!user) return;
        
        const userEmail = user.emailAddresses[0]?.emailAddress;
        if (!userEmail) return;

        setIsCheckingStatus(true);
        try {
            const checkResponse = await fetch('/api/check-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    userId: user.id
                }),
            });

            const checkResult = await checkResponse.json();
            if (checkResult.success) {
                setHasCheckedOutToday(checkResult.hasCheckedOutToday);
            }
        } catch (error) {
            console.error('❌ Lỗi kiểm tra trạng thái ban đầu:', error);
        } finally {
            setIsCheckingStatus(false);
        }
    }, [user]);

    useEffect(() => {
        checkInitialStatus();
    }, [checkInitialStatus]);

    const handleCheckout = useCallback(async () => {
        console.log('🎯 Bắt đầu quá trình checkout với camera...');

        if (!user) {
            console.log('❌ Không có thông tin người dùng');
            setCheckoutStatus('error');
            return;
        }

        const userEmail = user.emailAddresses[0]?.emailAddress;

        if (!userEmail) {
            console.log('❌ Không có thông tin email');
            setCheckoutStatus('error');
            return;
        }

        try {
            // Kiểm tra trạng thái checkout
            setCheckoutStatus('checking');
            console.log('🔍 Kiểm tra trạng thái checkout...');

            const checkResponse = await fetch('/api/check-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    userId: user.id
                }),
            });

            const checkResult = await checkResponse.json();

            if (!checkResult.success) {
                console.error('❌ Lỗi kiểm tra trạng thái:', checkResult.error);
                setCheckoutStatus('error');
                return;
            }

            // Nếu đã checkout hôm nay
            if (checkResult.hasCheckedOutToday) {
                console.log('⚠️ Đã checkout hôm nay');
                setCheckoutStatus('already_checked_out');
                setHasCheckedOutToday(true);
                return;
            }

            // Nếu chưa check-in hôm nay
            if (!checkResult.hasCheckedInToday) {
                console.log('⚠️ Chưa check-in hôm nay');
                setCheckoutStatus('not_checked_in');
                return;
            }

            // Nếu chưa checkout → chuyển sang chế độ camera
            setCheckoutStatus('camera');
            
        } catch (error) {
            console.error('❌ Lỗi khi kiểm tra trạng thái:', error);
            setCheckoutStatus('error');
        }
    }, [user]);

    const handlePhotoCapture = useCallback(async (imageBlob: Blob) => {
        console.log('📸 Đã nhận được ảnh checkout, bắt đầu xử lý...');
        
        if (!user) {
            console.log('❌ Không có thông tin người dùng');
            setCheckoutStatus('error');
            return;
        }

        const userEmail = user.emailAddresses[0]?.emailAddress;
        
        if (!userEmail) {
            console.log('❌ Không có thông tin email');
            setCheckoutStatus('error');
            return;
        }

        try {
            setCheckoutStatus('uploading');
            console.log('☁️ Đang tải ảnh checkout lên Google Drive...');
            
            // Upload ảnh lên Google Drive
            const formData = new FormData();
            formData.append('photo', imageBlob, 'checkout-photo.jpg');
            formData.append('userEmail', userEmail);
            formData.append('type', 'checkout'); // Thêm type để phân biệt

            const uploadResponse = await fetch('/api/upload-photo', {
                method: 'POST',
                body: formData,
            });

            const uploadResult = await uploadResponse.json();
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Lỗi khi upload ảnh');
            }

            console.log('✅ Upload ảnh checkout thành công');
            
            // Gửi thông tin checkout kèm link ảnh
            setCheckoutStatus('sending');
            console.log('📤 Đang gửi dữ liệu checkout...');
            
            const checkoutData = {
                email: userEmail,
                name: user.fullName || 'N/A',
                checkoutTime: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                userId: user.id,
                photoLink: uploadResult.viewLink
            };

            await sendCheckoutDataToSheet(checkoutData);
            
            console.log('✅ Checkout thành công!');
            setCheckoutStatus('success');
            setHasCheckedOutToday(true);
            
        } catch (error) {
            console.error('❌ Lỗi khi checkout:', error);
            
            const errorCode = (error as Error & { code?: string })?.code;
            
            if (errorCode === 'ALREADY_CHECKED_OUT') {
                setCheckoutStatus('already_checked_out');
                setHasCheckedOutToday(true);
            } else if (errorCode === 'UNAUTHORIZED') {
                setCheckoutStatus('unauthorized');
            } else if (errorCode === 'NOT_CHECKED_IN') {
                setCheckoutStatus('not_checked_in');
            } else {
                setCheckoutStatus('error');
            }
        }
    }, [user]);

    const resetStatus = useCallback(() => {
        setCheckoutStatus('idle');
    }, []);

    return {
        checkoutStatus,
        handleCheckout,
        handlePhotoCapture,
        resetStatus,
        hasCheckedOutToday,
        isCheckingStatus,
        isLoading: checkoutStatus === 'checking' || checkoutStatus === 'sending' || checkoutStatus === 'uploading'
    };
}