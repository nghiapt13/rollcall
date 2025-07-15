import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { UserRole } from '@/generated/prisma';
import {prisma} from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { confirmCode } = await request.json();

        console.log('=== XÓA DỮ LIỆU CHẤM CÔNG ===');

        // Kiểm tra authentication
        const user = await currentUser();
        if (!user) {
            console.log('❌ CHẶN: Chưa đăng nhập');
            return NextResponse.json({
                success: false,
                error: 'Bạn cần đăng nhập để thực hiện thao tác này.',
                unauthorized: true
            }, { status: 401 });
        }

        // Lấy thông tin user từ database để kiểm tra role
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: { role: true, email: true, name: true }
        });

        if (!dbUser || dbUser.role !== UserRole.ADMIN) {
            console.log('❌ CHẶN: Không có quyền admin', { userRole: dbUser?.role });
            return NextResponse.json({
                success: false,
                error: 'Bạn không có quyền admin. Vui lòng liên hệ quản trị viên.',
                unauthorized: true
            }, { status: 403 });
        }

        console.log('✅ Xác thực admin thành công:', { email: dbUser.email, name: dbUser.name });

        // Kiểm tra mã xác nhận
        if (confirmCode !== 'DELETE MY DATA') {
            return NextResponse.json({
                success: false,
                error: 'Mã xác nhận không đúng. Vui lòng nhập: DELETE MY DATA'
            }, { status: 400 });
        }

        // Đếm số bản ghi chấm công trước khi xóa
        const totalRecords = await prisma.attendance.count();
        console.log('📊 Tổng số bản ghi chấm công:', totalRecords);

        if (totalRecords === 0) {
            console.log('⚠️ Không có dữ liệu chấm công để xóa');
            return NextResponse.json({
                success: true,
                message: 'Không có dữ liệu chấm công để xóa',
                deletedRecords: 0
            });
        }

        // Xóa tất cả dữ liệu chấm công
        console.log('🗑️ Đang xóa tất cả dữ liệu chấm công...');
        
        const deleteResult = await prisma.attendance.deleteMany({});
        
        console.log(`✅ Đã xóa ${deleteResult.count} bản ghi chấm công`);

        return NextResponse.json({
            success: true,
            message: `Đã xóa thành công`,
            deletedRecords: deleteResult.count,
            totalRecordsBefore: totalRecords,
            totalRecordsAfter: 0
        });

    } catch (error) {
        console.error('❌ Lỗi xóa dữ liệu:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi server: ' + (error as Error).message
        }, { status: 500 });
    }
}