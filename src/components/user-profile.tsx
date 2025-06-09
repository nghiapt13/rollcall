import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
          <span className="font-medium text-gray-900">
            {user.fullName || "Người dùng"}
          </span>
          <span className="text-sm text-gray-500">
            {user.emailAddresses[0]?.emailAddress}
          </span>
        </div>
      )}
    </div>
  );
}