import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Tạo filter cho ngày
        let dateFilter = {};
        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
            dateFilter = {
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            };
        } else {
            // Mặc định lấy dữ liệu hôm nay
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            dateFilter = {
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            };
        }

        // Lấy attendance records với thông tin user
        const attendanceRecords = await prisma.attendance.findMany({
            where: dateFilter,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        imageUrl: true
                    }
                }
            },
            orderBy: {
                checkInTime: 'desc'
            },
            skip,
            take: limit
        });

        // Đếm tổng số records
        const totalRecords = await prisma.attendance.count({
            where: dateFilter
        });

        const totalPages = Math.ceil(totalRecords / limit);

        return NextResponse.json({
            success: true,
            data: {
                records: attendanceRecords,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalRecords,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('❌ Lỗi lấy attendance records:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi lấy dữ liệu attendance'
        }, { status: 500 });
    }
}