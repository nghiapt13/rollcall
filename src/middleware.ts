import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdminUser } from '@/config/authorized-users';
import { clerkClient } from '@clerk/nextjs/server';
import {get} from '@vercel/edge-config'



const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!process.env.EDGE_CONFIG) {
    req.nextUrl.pathname = `/missing-edge-config`
    return NextResponse.rewrite(req.nextUrl)
  }

  const isInMaintenanceMode = await get<boolean>('isInMaintenanceMode')

  if (isInMaintenanceMode) {
    req.nextUrl.pathname = `/maintenance`

    // Rewrite to the url
    return NextResponse.rewrite(req.nextUrl)
  }

  // Nếu route được bảo vệ
  if (isProtectedRoute(req)) {
    // Nếu chưa đăng nhập, chuyển hướng đến sign-in
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    try {
      // Lấy thông tin user từ Clerk để có email
      const user = await (await clerkClient()).users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress;

      // Nếu đã đăng nhập nhưng không phải admin, chuyển hướng về trang chủ
      if (!userEmail || !isAdminUser(userEmail)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (error) {
      console.error('Error getting user info:', error);
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
