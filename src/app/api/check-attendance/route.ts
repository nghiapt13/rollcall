import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        console.log('🔍 Kiểm tra trạng thái chấm công');

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'Thiếu thông tin userId'
            }, { status: 400 });
        }

        // Lấy ngày hôm nay (chỉ ngày, không có giờ)
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        console.log('📅 Kiểm tra ngày:', startOfDay.toLocaleDateString('vi-VN'));

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

        // Tìm bản ghi điểm danh hôm nay
        const todayAttendance = await prisma.attendance.findFirst({
            where: {
                userId: user.id,  // ✅ Đúng - dùng user.id từ database
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        const hasCheckedInToday = !!todayAttendance;
        
        return NextResponse.json({
            success: true,
            hasCheckedInToday,
            todayRecord: todayAttendance ? {
                id: todayAttendance.id,
                email: todayAttendance.user.email,
                name: todayAttendance.user.name,
                checkInTime: todayAttendance.checkInTime,
                checkInPhoto: todayAttendance.checkInPhoto,
                checkOutTime: todayAttendance.checkOutTime,
                checkOutPhoto: todayAttendance.checkOutPhoto,
                date: todayAttendance.date
            } : null,
            checkDate: startOfDay.toLocaleDateString('vi-VN'),
            message: hasCheckedInToday 
                ? 'Đã check-in hôm nay' 
                : 'Chưa check-in hôm nay'
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('❌ Lỗi kiểm tra attendance:', {
            message: err.message,
            timestamp: new Date().toISOString()
        });
        
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi kiểm tra trạng thái điểm danh',
            details: err.message
        }, { status: 500 });
    }
}