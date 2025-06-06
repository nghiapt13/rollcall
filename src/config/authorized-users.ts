// Danh sách userId được cấp phép điểm danh
export const AUTHORIZED_USER_IDS = [
  // Thêm userId của ClerkJS vào đây
  'user_2y8mP4B98VNQyNkqIDhNfwtQuby',
  'user_2y928V81U09M2TGAE050tJ5Ny0r'
  
  // Để lấy userId của bạn, hãy console.log(user.id) trong component
  // hoặc kiểm tra trong ClerkJS dashboard
];

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