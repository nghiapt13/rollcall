import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { checkAttendancePermission } from '@/config/authorized-users';

export async function POST(request: NextRequest) {
    try {
        const { checkoutTime, userId, photoLink } = await request.json();

        console.log('🔄 Đang xử lý checkout:', { checkoutTime, userId, photoLink });

        if (!checkoutTime || !userId) {
            return NextResponse.json({
                success: false,
                error: 'Thiếu thông tin bắt buộc'
            }, { status: 400 });
        }

        // Tìm user bằng clerkId
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true, email: true, name: true, isActive: true }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Không tìm thấy thông tin người dùng'
            }, { status: 404 });
        }

        if (!user.isActive) {
            return NextResponse.json({
                success: false,
                error: 'Tài khoản đã bị vô hiệu hóa'
            }, { status: 403 });
        }

        // Kiểm tra quyền điểm danh dựa trên role
        const permissionCheck = checkAttendancePermission(user.role);
        
        if (!permissionCheck.allowed) {
            console.log('🚫 Không có quyền checkout:', permissionCheck.reason);
            return NextResponse.json({
                success: false,
                error: 'access_denied',
                message: permissionCheck.reason,
                details: {
                    userRole: user.role,
                    roleCheck: permissionCheck.roleCheck
                },
                unauthorized: true
            }, { status: 403 });
        }

        // Lấy ngày hôm nay
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Tìm bản ghi check-in hôm nay
        const todayAttendance = await prisma.attendance.findFirst({
            where: {
                userId: user.id,  // ✅ Sử dụng user.id từ database
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        if (!todayAttendance) {
            return NextResponse.json({
                success: false,
                error: 'Chưa check-in hôm nay',
                notCheckedIn: true
            }, { status: 400 });
        }

        if (todayAttendance.checkOutTime) {
            return NextResponse.json({
                success: false,
                error: 'Đã checkout hôm nay',
                alreadyCheckedOut: true
            }, { status: 409 });
        }

        // Cập nhật checkout time và photo
        const updatedAttendance = await prisma.attendance.update({
            where: {
                id: todayAttendance.id
            },
            data: {
                checkOutTime: new Date(checkoutTime),
                checkOutPhoto: photoLink
            },
            include: {
                user: {
                    select: {
                        role: true
                    }
                }
            }
        });

        console.log('✅ Checkout thành công!');
        
        return NextResponse.json({
            success: true,
            message: 'Checkout thành công',
            attendance: {
                id: updatedAttendance.id,
                checkOutTime: updatedAttendance.checkOutTime,
                checkOutPhoto: updatedAttendance.checkOutPhoto,
                userRole: updatedAttendance.user.role
            }
        });

    } catch (error) {
        console.error('❌ Lỗi khi checkout:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi thực hiện checkout'
        }, { status: 500 });
    }
}