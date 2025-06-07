// Danh sách userId được cấp phép điểm danh từ environment variables
const getAuthorizedUserIds = (): string[] => {
  const userIds = process.env.NEXT_PUBLIC_AUTHORIZED_USER_IDS;
  if (!userIds) {
    console.warn('NEXT_PUBLIC_AUTHORIZED_USER_IDS not found in environment variables');
    return [];
  }
  return userIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
};

export const AUTHORIZED_USER_IDS = getAuthorizedUserIds();

/**
 * Kiểm tra xem userId có được phép điểm danh không
 */
export function isAuthorizedUser(userId: string): boolean {
  return AUTHORIZED_USER_IDS.includes(userId);
}

/**
 * Lấy số lượng user được phép
 */
export function getAuthorizedUserCount(): number {
  return AUTHORIZED_USER_IDS.length;
}

// Danh sách userId được cấp quyền admin từ environment variables
const getAuthorizedAdminIds = (): string[] => {
  const adminIds = process.env.NEXT_PUBLIC_AUTHORIZED_ADMIN_IDS;
  if (!adminIds) {
    console.warn('NEXT_PUBLIC_AUTHORIZED_ADMIN_IDS not found in environment variables');
    return [];
  }
  return adminIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
};

const AUTHORIZED_ADMIN_IDS = getAuthorizedAdminIds();

/**
 * Kiểm tra xem userId có quyền admin không
 */
export function isAdminUser(userId: string): boolean {
  return AUTHORIZED_ADMIN_IDS.includes(userId);
}
