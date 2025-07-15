import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserRole } from '../../prisma/app/generated/prisma/client';
// import { getUserPermissions } from '@/config/authorized-users';

interface UserPermissions {
    canAttendance: boolean;
    role: UserRole;
    isAdmin: boolean;
    isEmployee: boolean;
    isUser: boolean;
}

export function useCurrentRole() {
    const { user, isSignedIn } = useUser();
    const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!isSignedIn || !user?.id) {
                setUserPermissions(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/user-permissions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    setUserPermissions(result.permissions);
                } else {
                    setError(result.error || 'Lỗi khi lấy thông tin quyền');
                }
            } catch (err) {
                console.error('Lỗi khi kiểm tra role:', err);
                setError('Lỗi kết nối khi kiểm tra quyền');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserRole();
    }, [isSignedIn, user]);

    // Reset khi user đăng xuất
    useEffect(() => {
        if (!isSignedIn) {
            setUserPermissions(null);
            setError(null);
            setIsLoading(false);
        }
    }, [isSignedIn]);

    return {
        userPermissions,
        isLoading,
        error,
        // Convenience getters
        canAttendance: userPermissions?.canAttendance || false,
        role: userPermissions?.role || null,
        isAdmin: userPermissions?.isAdmin || false,
        isEmployee: userPermissions?.isEmployee || false,
        isUser: userPermissions?.isUser || false,
        // Refresh function
        refresh: () => {
            if (isSignedIn && user?.id) {
                setIsLoading(true);
                // Trigger useEffect by updating a dependency
            }
        }
    };
}