import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { UserRole } from '../../../../prisma/app/generated/prisma/client';

export async function GET() {
    try {
        // Đếm số lượng người dùng có quyền điểm danh (ADMIN + EMPLOYEE)
        const attendanceEligibleCount = await prisma.user.count({
            where: {
                role: {
                    in: [UserRole.ADMIN, UserRole.EMPLOYEE]
                },
                isActive: true
            }
        });

        // Đếm theo từng role
        const [adminCount, employeeCount, userCount] = await Promise.all([
            prisma.user.count({
                where: { role: UserRole.ADMIN, isActive: true }
            }),
            prisma.user.count({
                where: { role: UserRole.EMPLOYEE, isActive: true }
            }),
            prisma.user.count({
                where: { role: UserRole.USER, isActive: true }
            })
        ]);

        const totalUsers = await prisma.user.count({
            where: { isActive: true }
        });

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                attendanceEligible: attendanceEligibleCount,
                byRole: {
                    admin: adminCount,
                    employee: employeeCount,
                    user: userCount
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê người dùng:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Lỗi server khi lấy thống kê người dùng'
            },
            { status: 500 }
        );
    }
}