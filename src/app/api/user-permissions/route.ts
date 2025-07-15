import { NextRequest, NextResponse } from 'next/server';
import  prisma from '@/lib/prisma';
import { getUserPermissions } from '@/config/authorized-users';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        // Lấy thông tin user từ database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },  // ✅ Đúng - tìm bằng clerkId
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true
            }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Không tìm thấy người dùng'
            }, { status: 404 });
        }

        // Lấy thông tin quyền hạn
        const permissions = getUserPermissions(user.role);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive
            },
            permissions
        });

    } catch (error) {
        console.error('❌ Lỗi kiểm tra quyền:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi kiểm tra quyền'
        }, { status: 500 });
    }
}