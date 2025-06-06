import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { sendLoginDataToSheet, checkAttendanceStatus } from '@/lib/google-sheets';

export function useLoginTracker() {
  const { user, isSignedIn } = useUser();
  const hasTrackedLogin = useRef(false);
  const [trackingStatus, setTrackingStatus] = useState<'idle' | 'checking' | 'sending' | 'success' | 'error' | 'already_checked_in'>('idle');

  useEffect(() => {
    if (isSignedIn && user && !hasTrackedLogin.current) {
      const userEmail = user.emailAddresses[0]?.emailAddress;
      
      if (!userEmail) {
        setTrackingStatus('error');
        return;
      }

      setTrackingStatus('checking');
      
      // Kiểm tra xem đã điểm danh hôm nay chưa
      checkAttendanceStatus(userEmail)
        .then((result) => {
          if (result.hasCheckedInToday) {
            // Đã điểm danh hôm nay rồi
            setTrackingStatus('already_checked_in');
            hasTrackedLogin.current = true;
          } else {
            // Chưa điểm danh, tiến hành gửi dữ liệu
            setTrackingStatus('sending');
            
            const loginData = {
              email: userEmail,
              name: user.fullName || 'N/A',
              loginTime: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
              userId: user.id
            };

            return sendLoginDataToSheet(loginData);
          }
        })
        .then((result) => {
          if (result) { // Chỉ khi thực sự gửi dữ liệu
            console.log('Đã ghi nhận thông tin đăng nhập thành công');
            setTrackingStatus('success');
            hasTrackedLogin.current = true;
          }
        })
        .catch((error) => {
          console.error('Lỗi khi xử lý điểm danh:', error);
          setTrackingStatus('error');
        });
    }
  }, [isSignedIn, user]);

  // Reset flag khi user đăng xuất
  useEffect(() => {
    if (!isSignedIn) {
      hasTrackedLogin.current = false;
      setTrackingStatus('idle');
    }
  }, [isSignedIn]);

  return { trackingStatus };
} 