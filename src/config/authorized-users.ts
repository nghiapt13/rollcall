import { UserRole } from '@/generated/prisma';
import {prisma} from '@/lib/prisma';

/**
 * Kiểm tra xem user có quyền điểm danh dựa trên role không
 * Chỉ ADMIN và EMPLOYEE được phép điểm danh
 * USER không được phép điểm danh
 */
export function canUserAttendance(userRole: UserRole): boolean {
  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.EMPLOYEE];
  return allowedRoles.includes(userRole);
}

/**
 * Kiểm tra quyền điểm danh với thông tin chi tiết
 */
export function checkAttendancePermission(userRole: UserRole): {
  allowed: boolean;
  reason: string;
  roleCheck: boolean;
} {
  const roleCheck = canUserAttendance(userRole);
  
  if (!roleCheck) {
    return {
      allowed: false,
      reason: `Role '${userRole}' không được phép điểm danh. Chỉ ADMIN và EMPLOYEE mới có quyền.`,
      roleCheck: false
    };
  }
  
  return {
    allowed: true,
    reason: 'Có quyền điểm danh',
    roleCheck: true
  };
}

/**
 * Lấy thông tin quyền hạn của user dựa trên role
 */
export function getUserPermissions(userRole: UserRole) {
  return {
    canAttendance: canUserAttendance(userRole),
    role: userRole,
    isAdmin: userRole === UserRole.ADMIN,
    isEmployee: userRole === UserRole.EMPLOYEE,
    isUser: userRole === UserRole.USER
  };
}

/**
 * Kiểm tra xem user có phải admin không
 */
export function isAdminRole(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Kiểm tra xem user có phải employee không
 */
export function isEmployeeRole(userRole: UserRole): boolean {
  return userRole === UserRole.EMPLOYEE;
}

/**
 * Kiểm tra xem user có phải user thường không
 */
export function isUserRole(userRole: UserRole): boolean {
  return userRole === UserRole.USER;
}

/**
 * Lấy tất cả các role được phép điểm danh
 */
export function getAllowedAttendanceRoles(): UserRole[] {
  return [UserRole.ADMIN, UserRole.EMPLOYEE];
}

/**
 * Lấy tất cả các role có trong hệ thống
 */
export function getAllRoles(): UserRole[] {
  return [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER];
}

/**
 * Đếm số lượng người dùng có quyền điểm danh (ADMIN và EMPLOYEE)
 * @returns Promise<number> - Số lượng người dùng có role ADMIN hoặc EMPLOYEE
 */
export async function getAttendanceEligibleUserCount(): Promise<number> {
  try {
    const count = await prisma.user.count({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.EMPLOYEE]
        },
        isActive: true // Chỉ tính người dùng đang hoạt động
      }
    });
    return count;
  } catch (error) {
    console.error('Error counting attendance eligible users:', error);
    return 0;
  }
}

/**
 * Đếm số lượng người dùng theo từng role
 * @returns Promise<{admin: number, employee: number, total: number}>
 */
export async function getUserCountByRole(): Promise<{
  admin: number;
  employee: number;
  total: number;
}> {
  try {
    const [adminCount, employeeCount] = await Promise.all([
      prisma.user.count({
        where: {
          role: UserRole.ADMIN,
          isActive: true
        }
      }),
      prisma.user.count({
        where: {
          role: UserRole.EMPLOYEE,
          isActive: true
        }
      })
    ]);

    return {
      admin: adminCount,
      employee: employeeCount,
      total: adminCount + employeeCount
    };
  } catch (error) {
    console.error('Error counting users by role:', error);
    return { admin: 0, employee: 0, total: 0 };
  }
}

/**
 * Lấy thống kê chi tiết về người dùng
 * @returns Promise<{totalUsers: number, activeUsers: number, attendanceEligible: number}>
 */
export async function getUserStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  attendanceEligible: number;
  byRole: {
    admin: number;
    employee: number;
    user: number;
  };
}> {
  try {
    const [totalUsers, activeUsers, attendanceEligible, adminCount, employeeCount, userCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          role: { in: [UserRole.ADMIN, UserRole.EMPLOYEE] },
          isActive: true
        }
      }),
      prisma.user.count({ where: { role: UserRole.ADMIN, isActive: true } }),
      prisma.user.count({ where: { role: UserRole.EMPLOYEE, isActive: true } }),
      prisma.user.count({ where: { role: UserRole.USER, isActive: true } })
    ]);

    return {
      totalUsers,
      activeUsers,
      attendanceEligible,
      byRole: {
        admin: adminCount,
        employee: employeeCount,
        user: userCount
      }
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      attendanceEligible: 0,
      byRole: { admin: 0, employee: 0, user: 0 }
    };
  }
}