import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { checkAttendanceStatus } from '@/lib/google-sheets';

export function useAttendanceStatus() {
  const { user, isSignedIn } = useUser();
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(() => {
    if (!isSignedIn || !user) return;
    
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) return;

    setIsLoading(true);
    
    checkAttendanceStatus(userEmail)
      .then((result) => {
        setHasCheckedInToday(result.hasCheckedInToday);
      })
      .catch((error) => {
        console.error('Lỗi khi kiểm tra trạng thái điểm danh:', error);
        setHasCheckedInToday(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
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