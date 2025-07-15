'use client';

import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AttendanceButton } from "@/components/attendance-button";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { useAttendanceStatus } from "@/hooks/use-attendance-status";
import { UserProfile } from "@/components/user-profile";
import { Instruction } from "@/components/instruction";
import { useCurrentRole } from "@/hooks/useCurrentRole"; // ✅ Thêm import
import { UserRole } from '@/generated/prisma';


export default function Home() {
  const {  isSignedIn } = useUser();
  const { openSignIn, signOut } = useClerk();
  const { hasCheckedInToday } = useAttendanceStatus();
  const { role } = useCurrentRole(); // ✅ Sử dụng hook để lấy role

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 -mt-5">
      
      <Image
        src="/2020-Btec.png"
        alt="BTEC"
        width={200}
        height={200}
        className=""
      />
      <h1 className="text-3xl font-bold text-orange-500 align-center">CHẤM CÔNG HÀNG NGÀY</h1>
      <h2 className="text-xl font-bold text-orange-500 align-center">PHÒNG CTSV FPI ĐÀ NẴNG</h2>

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
            {role === UserRole.ADMIN && (
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
          
          <Instruction />

          <Button asChild size="sm" variant="outline" className="border-black">
            <Link href="https://m.me/Nghia.PT21" target="_blank">
              <Image src="/messenger.svg" alt="Messenger" width={15} height={15} />
              Báo lỗi
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
