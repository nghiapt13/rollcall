import { NextRequest, NextResponse } from 'next/server';
import  {prisma}  from '@/lib/prisma';
import { checkAttendancePermission } from '@/config/authorized-users';

export async function POST(request: NextRequest) {
    try {
        const { email, name, userId, photoLink } = await request.json();

        console.log('📨 Xử lý check-in:', { email, name, userId, photoLink });

        // Validation cơ bản
        if (!email || !name || !userId) {
            return NextResponse.json({
                success: false,
                error: 'Thiếu thông tin bắt buộc'
            }, { status: 400 });
        }

        // Lấy thông tin user từ database để kiểm tra role
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },  // ✅ Sửa từ id thành clerkId
            select: { role: true, email: true, name: true, isActive: true, id: true }
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
        const permissionCheck = checkAttendancePermission(user.role);  // ✅ Chỉ truyền user.role

        if (!permissionCheck.allowed) {
            console.log('🚫 Không có quyền điểm danh:', permissionCheck.reason);
            return NextResponse.json({
                success: false,
                error: 'access_denied',
                message: permissionCheck.reason,
                details: {
                    userRole: user.role,
                    roleCheck: permissionCheck.roleCheck
                    // ✅ Xóa emailCheck vì không còn cần thiết
                },
                unauthorized: true
            }, { status: 403 });
        }

        // Lấy ngày hôm nay
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Kiểm tra đã check-in hôm nay chưa
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId: user.id,  // ✅ Dùng user.id từ database
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        if (existingAttendance) {
            console.log('❌ CHẶN: Đã điểm danh hôm nay');
            return NextResponse.json({
                success: false,
                error: 'already_checked_in',
                message: 'Hôm nay bạn đã điểm danh thành công',
                alreadyCheckedIn: true
            }, { status: 409 });
        }

        // Tạo bản ghi điểm danh mới
        const newAttendance = await prisma.attendance.create({
            data: {
                userId: user.id,  // ✅ Dùng user.id từ database
                checkInTime: new Date(),
                checkInPhoto: photoLink,
                date: startOfDay
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        console.log('✅ Check-in thành công!');

        return NextResponse.json({
            success: true,
            message: 'Điểm danh thành công!',
            attendance: {
                id: newAttendance.id,
                checkInTime: newAttendance.checkInTime,
                checkInPhoto: newAttendance.checkInPhoto,
                date: newAttendance.date,
                userRole: newAttendance.user.role
            }
        });

    } catch (error) {
        console.error('❌ Lỗi check-in:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server khi thực hiện check-in',
            details: (error as Error).message
        }, { status: 500 });
    }
}