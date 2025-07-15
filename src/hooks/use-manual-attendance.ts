import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

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
          userId: user.id,
        }),
      });

      const checkResult = await checkResponse.json();
      
      if (!checkResult.success) {
        console.error('❌ Lỗi kiểm tra trạng thái:', checkResult.error);
        
        // Kiểm tra lỗi unauthorized
        if (checkResult.error?.includes('không có quyền') || checkResult.error?.includes('unauthorized')) {
          setAttendanceStatus('unauthorized');
        } else {
          setAttendanceStatus('error');
        }
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
      console.log('☁️ Đang tải ảnh lên Cloudinary...');
      
      // Upload ảnh lên Cloudinary
      const formData = new FormData();
      formData.append('photo', imageBlob, 'attendance-photo.jpg');
      formData.append('userEmail', userEmail);
      formData.append('userId', user.id);

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
      
      const checkinResponse = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: userEmail,
          name: user.fullName || user.firstName || userEmail,  // ✅ Thêm name
          photoLink: uploadResult.imageUrl  // ✅ Sử dụng imageUrl từ Cloudinary
        }),
      });

      const checkinResult = await checkinResponse.json();
      
      if (!checkinResult.success) {
        throw new Error(checkinResult.error || 'Lỗi khi điểm danh');
      }
      
      console.log('✅ Điểm danh thành công!');
      setAttendanceStatus('success');
      
    } catch (error) {
      console.error('❌ Lỗi khi điểm danh:', error);
      
      // Kiểm tra loại lỗi
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('đã điểm danh') || errorMessage.includes('already checked in')) {
        console.log('⚠️ Đã điểm danh hôm nay');
        setAttendanceStatus('already_checked_in');
      } else if (errorMessage.includes('không có quyền') || errorMessage.includes('unauthorized')) {
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