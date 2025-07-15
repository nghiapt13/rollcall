import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        console.log('🔍 Kiểm tra trạng thái checkout');

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'Thiếu thông tin userId'
            }, { status: 400 });
        }

        // Tìm user bằng clerkId
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Không tìm thấy người dùng'
            }, { status: 404 });
        }

        // Lấy ngày hôm nay
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Tìm bản ghi điểm danh hôm nay
        const todayAttendance = await prisma.attendance.findFirst({
            where: {
                userId: user.id,  // ✅ Sử dụng user.id từ database
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        const hasCheckedInToday = !!todayAttendance;
        const hasCheckedOutToday = !!(todayAttendance?.checkOutTime);

        return NextResponse.json({
            success: true,
            hasCheckedInToday,
            hasCheckedOutToday,
            message: hasCheckedOutToday 
                ? 'Đã checkout hôm nay' 
                : !hasCheckedInToday 
                    ? 'Chưa check-in hôm nay'
                    : 'Có thể checkout'
        });

    } catch (error) {
        console.error('❌ Lỗi kiểm tra checkout:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi kiểm tra trạng thái checkout'
        }, { status: 500 });
    }
}