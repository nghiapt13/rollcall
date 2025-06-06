

'use client';

import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AttendanceButton } from "@/components/attendance-button";

export default function Home() {
  const {user,isSignedIn} = useUser();
  const { openSignIn } = useClerk();
  
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 -mt-20">
      <Image
        src="/2020-Btec.png"
        alt="BTEC"
        width={300}
        height={300}
        className=""
      />
      <h1 className="text-4xl font-bold text-orange-500 align-center mb-2">ĐIỂM DANH NGÀY - FPI</h1>
      
      {!isSignedIn ? (
        <Button
          size="lg"
          onClick={() => openSignIn()}
          className="px-4 py-2 bg-orange-500 text-white rounded-md"
        >
          Đăng nhập để điểm danh
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
        </div>
      )}
    </div>
  );
}
