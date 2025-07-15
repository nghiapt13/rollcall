import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function GET() {
    try {
        // Lấy ngày hôm nay
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Đếm số người đã check-in hôm nay
        const checkedInCount = await prisma.attendance.count({
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        // Đếm số người đã check-out hôm nay
        const checkedOutCount = await prisma.attendance.count({
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                checkOutTime: {
                    not: null
                }
            }
        });

        // Tổng số bản ghi điểm danh hôm nay
        const totalRecords = checkedInCount;

        return NextResponse.json({
            success: true,
            data: {  // ✅ Đổi từ 'stats' thành 'data'
                checkedInCount,
                checkedOutCount,
                totalRecords,
                date: startOfDay.toLocaleDateString('vi-VN'),
                pendingCheckout: checkedInCount - checkedOutCount
            }
        });

    } catch (error) {
        console.error('❌ Lỗi lấy thống kê:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi lấy thống kê điểm danh'
        }, { status: 500 });
    }
}