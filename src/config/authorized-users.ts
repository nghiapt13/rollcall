// Lấy danh sách email được phép từ environment variables
const getAuthorizedUserEmails = (): string[] => {
  const userEmails = process.env.NEXT_PUBLIC_AUTHORIZED_USER_EMAILS;
  if (!userEmails) {
    console.warn('NEXT_PUBLIC_AUTHORIZED_USER_EMAILS not found in environment variables');
    return [];
  }
  return userEmails.split(',').map(email => email.trim().toLowerCase()).filter(email => email.length > 0);
};

export const AUTHORIZED_USER_EMAILS = getAuthorizedUserEmails();

/**
 * Kiểm tra xem email có được phép điểm danh không
 */
export function isAuthorizedUser(email: string): boolean {
  return AUTHORIZED_USER_EMAILS.includes(email.toLowerCase());
}

/**
 * Lấy số lượng user được phép
 */
export function getAuthorizedUserCount(): number {
  return AUTHORIZED_USER_EMAILS.length;
}

// Danh sách email được cấp quyền admin từ environment variables
const getAuthorizedAdminEmails = (): string[] => {
  const adminEmails = process.env.NEXT_PUBLIC_AUTHORIZED_ADMIN_EMAILS;
  if (!adminEmails) {
    console.warn('NEXT_PUBLIC_AUTHORIZED_ADMIN_EMAILS not found in environment variables');
    return [];
  }
  return adminEmails.split(',').map(email => email.trim().toLowerCase()).filter(email => email.length > 0);
};

const AUTHORIZED_ADMIN_EMAILS = getAuthorizedAdminEmails();

/**
 * Kiểm tra xem email có quyền admin không
 */
export function isAdminUser(email: string): boolean {
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase());
}

// Giữ lại các function cũ để tương thích ngược (deprecated)
const getAuthorizedUserIds = (): string[] => {
  const userIds = process.env.NEXT_PUBLIC_AUTHORIZED_USER_IDS;
  if (!userIds) {
    return [];
  }
  return userIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
};

export const AUTHORIZED_USER_IDS = getAuthorizedUserIds();

/**
 * @deprecated Sử dụng isAuthorizedUser(email) thay thế
 */
export function isAuthorizedUserId(userId: string): boolean {
  return AUTHORIZED_USER_IDS.includes(userId);
}
