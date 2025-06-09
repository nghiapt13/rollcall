import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { sendLoginDataToSheet } from '@/lib/google-sheets';

export function useManualAttendance() {
  const { user } = useUser();
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'checking' | 'sending' | 'success' | 'error' | 'already_checked_in' | 'unauthorized' | 'camera' | 'uploading'>('idle');

  const handleAttendance = useCallback(async () => {
    console.log('🎯 Bắt đầu quá trình điểm danh...');
    
    if (!user) {
      console.log('❌ Không có thông tin người dùng');
      setAttendanceStatus('error');
      return;
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      console.log('❌ Không có thông tin email');
      setAttendanceStatus('error');
      return;
    }

    try {
      // Kiểm tra trạng thái điểm danh trước khi mở camera
      setAttendanceStatus('checking');
      console.log('🔍 Kiểm tra trạng thái điểm danh...');
      
      const checkResponse = await fetch('/api/check-attendance', {
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
        setAttendanceStatus('error');
        return;
      }

      // Nếu đã điểm danh hôm nay
      if (checkResult.hasCheckedInToday) {
        console.log('⚠️ Đã điểm danh hôm nay');
        setAttendanceStatus('already_checked_in');
        return;
      }

      // Nếu chưa điểm danh → chuyển sang chế độ camera
      setAttendanceStatus('camera');
      
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra trạng thái:', error);
      setAttendanceStatus('error');
    }
  }, [user]);

  const handlePhotoCapture = useCallback(async (imageBlob: Blob) => {
    console.log('📸 Đã nhận được ảnh, bắt đầu xử lý...');
    
    if (!user) {
      console.log('❌ Không có thông tin người dùng');
      setAttendanceStatus('error');
      return;
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      console.log('❌ Không có thông tin email');
      setAttendanceStatus('error');
      return;
    }

    try {
      setAttendanceStatus('uploading');
      console.log('☁️ Đang tải ảnh lên Google Drive...');
      
      // Upload ảnh lên Google Drive
      const formData = new FormData();
      formData.append('photo', imageBlob, 'attendance-photo.jpg');
      formData.append('userEmail', userEmail);

      const uploadResponse = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Lỗi khi upload ảnh');
      }

      console.log('✅ Upload ảnh thành công');
      
      // Gửi thông tin điểm danh kèm link ảnh
      setAttendanceStatus('sending');
      console.log('📤 Đang gửi dữ liệu điểm danh...');
      
      const loginData = {
        email: userEmail,
        name: user.fullName || 'N/A',
        // Loại bỏ loginTime
        userId: user.id,
        photoLink: uploadResult.viewLink
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
    handlePhotoCapture,
    resetStatus,
    isLoading: attendanceStatus === 'checking' || attendanceStatus === 'sending' || attendanceStatus === 'uploading'
  };
}