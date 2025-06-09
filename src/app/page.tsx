"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AttendanceButton } from "@/components/attendance-button";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { isAdminUser } from '@/config/authorized-users';
import { CheckoutButton } from "@/components/checkout-button";
import { useAttendanceStatus } from "@/hooks/use-attendance-status";
import { UserProfile } from "@/components/user-profile";

export default function Home() {
  const { user, isSignedIn } = useUser();
  const { openSignIn, signOut } = useClerk();
  const { hasCheckedInToday } = useAttendanceStatus();

  // Kiểm tra quyền admin bằng email
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const isAdmin = userEmail ? isAdminUser(userEmail) : false;


  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 -mt-20">
      <Image
        src="/2020-Btec.png"
        alt="BTEC"
        width={250}
        height={250}
        className=""
      />
      <h1 className="text-3xl font-bold text-orange-500 align-center mb-2">CHẤM CÔNG NGÀY - FPI</h1>

      {!isSignedIn ? (
        <Button
          size="lg"
          onClick={() => openSignIn()}
          className="px-4 py-2 bg-orange-500 text-white rounded-md"
        >
          Đăng nhập để bắt đầu chấm công
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* User Profile Component */}
          <UserProfile className="mb-2" />
          
          <div className="text-sm sm:text-md font-medium text-center">
            Bây giờ là {new Date().toLocaleString('vi-VN', {
              timeZone: 'Asia/Ho_Chi_Minh', 
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              day: '2-digit', 
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
          
          <AttendanceButton />
          
          {/* Chỉ hiển thị checkout button khi đã check-in */}
          {hasCheckedInToday && <CheckoutButton/>}
          
          {/* Hiển thị thông báo khi chưa check-in */}
          {hasCheckedInToday === false && (
            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Vui lòng check-in trước khi checkout
            </div>
          )}

          {/* Admin and Debug Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Admin Button - Chỉ hiển thị cho admin */}
            {isAdmin && (
              <Link href="/admin" className="w-full sm:w-auto mx-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
