import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export function useAttendanceStatus() {
  const { user, isSignedIn } = useUser();
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!isSignedIn || !user) return;
    
    // ✅ Không cần kiểm tra email nữa
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/check-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id  // ✅ Chỉ gửi userId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setHasCheckedInToday(result.hasCheckedInToday);
      } else {
        console.error('Lỗi kiểm tra trạng thái:', result.error);
        setHasCheckedInToday(null);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái điểm danh:', error);
      setHasCheckedInToday(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    checkStatus();
  }, [isSignedIn, user, checkStatus]);

  // Reset khi người dùng đăng xuất
  useEffect(() => {
    if (!isSignedIn) {
      setHasCheckedInToday(null);
      setIsLoading(false);
    }
  }, [isSignedIn]);

  return {
    hasCheckedInToday,
    isLoading,
    refreshStatus: checkStatus
  };
}