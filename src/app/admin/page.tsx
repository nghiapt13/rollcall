'use client';

import { AdminClearAttendance } from './components/admin-clear-attendance';
import { useUser } from '@clerk/nextjs';
import { Settings, Users, LogOut, LogIn, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AttendanceRecords } from './components/attendance-records';
import { UserManagement } from './components/user-management';

interface AttendanceStats {
  checkedInCount: number;
  checkedOutCount: number;
  date: string;
  totalRecords: number;
}

interface UserStats {
  totalUsers: number;
  attendanceEligible: number;
  byRole: {
    admin: number;
    employee: number;
    user: number;
  };
}

export default function AdminPage() {
  const [time, setTime] = useState("");
  const { user } = useUser();
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);


  // Cập nhật thời gian
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("vi-VN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Lấy thống kê
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy thống kê chấm công
        const attendanceResponse = await fetch('/api/attendance-stats');
        const attendanceResult = await attendanceResponse.json();
        if (attendanceResult.success) {
          setAttendanceStats(attendanceResult.data);
        }

        // Lấy thống kê người dùng từ API
        const userResponse = await fetch('/api/user-stats');
        const userResult = await userResponse.json();
        if (userResult.success) {
          setUserStats(userResult.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour >= 0 && hour < 12 ? "Chào buổi sáng" : hour >= 12 && hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";



  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center mb-4">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{greeting} {user?.fullName}</h1>
            <p className="text-md sm:text-xl text-gray-600">Bây giờ là {time}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Tổng người dùng</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-800">
                  {loading ? '...' : Math.max((userStats?.attendanceEligible || 0) - 1, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-green-600 font-medium">Đã checkin hôm nay</p>
                <p className="text-xl sm:text-2xl font-bold text-green-800">
                  {loading ? '...' : attendanceStats?.checkedInCount || '...'} / {Math.max((userStats?.attendanceEligible || 0) - 1, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <LogOut className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-orange-600 font-medium">Đã checkout hôm nay</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-800">
                  {loading ? '...' : attendanceStats?.checkedOutCount || '...'} / {Math.max((userStats?.attendanceEligible || 0) - 1, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Công cụ quản trị */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Quản lý dữ liệu
          </h2>

          <AttendanceRecords/>
          <UserManagement/>
          <AdminClearAttendance />
        </div>
      </div>
    </div>
  );
}