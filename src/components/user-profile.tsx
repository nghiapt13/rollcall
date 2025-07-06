"use client";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface UserProfileProps {
  className?: string;
  showFullName?: boolean;
  avatarSize?: "sm" | "md" | "lg";
}

export function UserProfile({
  className = "",
  showFullName = true,
  avatarSize = "md"
}: UserProfileProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("vi-VN",{
        hour12:false,
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour >= 0 && hour < 12 ? "Chào buổi sáng" : hour >= 12 && hour < 18 ? "Chào buổi chiều" : "Chào buổi tối"



  const { user } = useUser();

  if (!user) {
    return null;
  }

  const sizeClasses = {
    sm: "size-8",
    md: "size-12",
    lg: "size-16"
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };



  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className={sizeClasses[avatarSize]}>
        <AvatarImage
          src={user.imageUrl}
          alt={user.fullName || "User avatar"}
        />
        <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
          {user.fullName ? getInitials(user.fullName) : "U"}
        </AvatarFallback>
      </Avatar>

      {showFullName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">{greeting},</span>
          <span className="font-medium text-gray-900">
            {user.fullName || "User"}
          </span>
          <span className="text-sm text-gray-500">
            {user.emailAddresses[0]?.emailAddress}
          </span>
          <div className="mt-1 text-sm text-gray-500 font-medium">
            Bây giờ là {time}
          </div>
        </div>
      )}
    </div>
  );
}