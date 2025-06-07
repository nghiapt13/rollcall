import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdminUser } from '@/config/authorized-users';

// Định nghĩa các route cần bảo vệ (chỉ admin mới truy cập được)
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/dashboard(.*)',
  // Thêm các route khác cần bảo vệ ở đây
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Nếu route được bảo vệ
  if (isProtectedRoute(req)) {
    // Nếu chưa đăng nhập, chuyển hướng đến sign-in
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    
    // Nếu đã đăng nhập nhưng không phải admin, chuyển hướng về trang chủ
    if (!isAdminUser(userId)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};