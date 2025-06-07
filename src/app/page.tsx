'use client';

import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AttendanceButton } from "@/components/attendance-button";
import { CameraDebug } from "@/components/camera-debug";
import { LogOut, Bug, Settings } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { isAdminUser } from "@/config/authorized-users";

export default function Home() {
  const {user,isSignedIn} = useUser();
  const { openSignIn, signOut } = useClerk();
  const [showDebug, setShowDebug] = useState(false);
  
  // Kiểm tra quyền admin
  const isAdmin = user?.id ? isAdminUser(user.id) : false;
  
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 -mt-20">
      <Image
        src="/2020-Btec.png"
        alt="BTEC"
        width={300}
        height={300}
        className=""
      />
      <h1 className="text-4xl font-bold text-orange-500 align-center mb-2">CHẤM CÔNG NGÀY - FPI</h1>
      
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
          <div className="text-md font-medium">
            Xin chào {user?.fullName}, bây giờ là {new Date().toLocaleString('vi-VN', {
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
          
          {/* Admin and Debug Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Admin Button - Chỉ hiển thị cho admin */}
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                >
                  <Settings className="w-4 h-4" />
                  Quản trị
                </Button>
              </Link>
            )}
            
            {/* Debug Camera Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Bug className="w-4 h-4" />
              {showDebug ? 'Ẩn Debug' : 'Debug Camera'}
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>
      )}
      
      {/* Camera Debug Panel */}
      {showDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <Button
              onClick={() => setShowDebug(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 p-0 rounded-full"
              variant="destructive"
            >
              ×
            </Button>
            <CameraDebug />
          </div>
        </div>
      )}
    </div>
  );
}
