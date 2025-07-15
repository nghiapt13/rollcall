import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import {prisma} from '@/lib/prisma';
import { UserRole } from '../../../../../prisma/app/generated/prisma/client';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
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
      select: { role: true, id: true }
    });

    if (!dbUser || dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Không cho phép admin tự thay đổi role của chính mình
    if (params.id === dbUser.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Cập nhật role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
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
      select: { role: true, id: true }
    });

    if (!dbUser || dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Không cho phép admin xóa chính mình
    if (params.id === dbUser.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    // Xóa user (soft delete)
    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}