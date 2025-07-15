import { Metadata } from "next"
import { metadata as rootMetadata } from "../layout"
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { UserRole } from '@/generated/prisma';

export const metadata: Metadata = {
    title: `Trang quản trị | ${rootMetadata.title}`
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Kiểm tra đăng nhập
    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }

    // Kiểm tra role từ database
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        select: {
            role: true,
            isActive: true
        }
    });

    // Nếu user không tồn tại hoặc không phải admin
    if (!dbUser || !dbUser.isActive || dbUser.role !== UserRole.ADMIN) {
        redirect('/');
    }

    return (
        <div className="admin-layout">
            {children}
        </div>
    );
}
