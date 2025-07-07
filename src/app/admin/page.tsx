'use client';

import { AdminClearAttendance } from './components/admin-clear-attendance';
import { ViewGoogleSheets } from './components/view-google-sheets';
import { getAuthorizedUserCount } from '@/config/authorized-users';
import { Settings, Users, Database } from 'lucide-react';

export default function AdminPage() {
  const totalUsers = getAuthorizedUserCount();

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center mb-4">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trang Quản Trị</h1>
            <p className="text-sm sm:text-base text-gray-600">Quản lý hệ thống chấm công</p>
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
                <p className="text-xl sm:text-2xl font-bold text-blue-800">{totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Database className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-green-600 font-medium">Bản ghi chấm công</p>
                <p className="text-xl sm:text-2xl font-bold text-green-800">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-orange-600 font-medium">Hôm nay</p>
                <p className="text-base sm:text-lg font-bold text-orange-800">
                  {new Date().toLocaleDateString('vi-VN')}
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
          
          {/* Nút xem Google Sheets */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <ViewGoogleSheets />
            
            {/* Component xóa dữ liệu chấm công */}
            <AdminClearAttendance />
          </div>
        </div>
      </div>
    </div>
  );
}