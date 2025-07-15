import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import {prisma} from '@/lib/prisma';
import { UserRole } from '@/generated/prisma';

export async function GET(request: NextRequest) {
    try {
        // Kiểm tra quyền admin
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Lấy thông tin user từ database
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: { role: true }
        });

        if (!dbUser || dbUser.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        // Lấy tất cả người dùng
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                clerkId: true,
                imageUrl: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        attendances: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}