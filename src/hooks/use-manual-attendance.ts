import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { sendLoginDataToSheet } from '@/lib/google-sheets';

export function useManualAttendance() {
  const { user } = useUser();
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'checking' | 'sending' | 'success' | 'error' | 'already_checked_in' | 'unauthorized'>('idle');

  const handleAttendance = useCallback(async () => {
    console.log('🎯 Bắt đầu quá trình điểm danh...');
    
    if (!user) {
      console.log('❌ Không có user');
      setAttendanceStatus('error');
      return;
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      console.log('❌ Không có email');
      setAttendanceStatus('error');
      return;
    }

    try {
      setAttendanceStatus('sending');
      console.log('📤 Đang gửi dữ liệu điểm danh...');
      
      const loginData = {
        email: userEmail,
        name: user.fullName || 'N/A',
        loginTime: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        userId: user.id
      };

      // Gửi trực tiếp, API sẽ tự kiểm tra
      await sendLoginDataToSheet(loginData);
      
      console.log('✅ Điểm danh thành công!');
      setAttendanceStatus('success');
      
    } catch (error) {
      console.error('❌ Lỗi khi điểm danh:', error);
      
      // Kiểm tra loại lỗi
      const errorCode = (error as Error & { code?: string })?.code;
      
      if (errorCode === 'ALREADY_CHECKED_IN') {
        console.log('⚠️ Đã điểm danh hôm nay');
        setAttendanceStatus('already_checked_in');
      } else if (errorCode === 'UNAUTHORIZED') {
        console.log('🚫 Không có quyền truy cập');
        setAttendanceStatus('unauthorized');
      } else {
        console.log('❌ Lỗi khác');
        setAttendanceStatus('error');
      }
    }
  }, [user]);

  const resetStatus = useCallback(() => {
    setAttendanceStatus('idle');
  }, []);

  return {
    attendanceStatus,
    handleAttendance,
    resetStatus,
    isLoading: attendanceStatus === 'checking' || attendanceStatus === 'sending'
  };
} 