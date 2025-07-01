'use client';

import { AdminClearAttendance } from '@/components/admin-clear-attendance';
import { ViewGoogleSheets } from '@/components/view-google-sheets';
import { Settings, Users, Database } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Settings className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trang Quản Trị</h1>
            <p className="text-gray-600">Quản lý hệ thống chấm công</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Tổng người dùng</p>
                <p className="text-2xl font-bold text-blue-800">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Bản ghi chấm công</p>
                <p className="text-2xl font-bold text-green-800">-</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Hôm nay</p>
                <p className="text-lg font-bold text-orange-800">
                  {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Công cụ quản trị */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Quản lý dữ liệu
          </h2>
          
          {/* Nút xem Google Sheets */}
          <div className="mb-4">
            <ViewGoogleSheets />
          </div>
          
          {/* Component xóa dữ liệu chấm công */}
          <AdminClearAttendance />
        </div>

        {/* Hướng dẫn sử dụng */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-gray-800 mb-2">📖 Hướng dẫn sử dụng</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>Xem dữ liệu:</strong> Xem toàn bộ dữ liệu chấm công trên Google Sheets</p>
            <p>• <strong>Xóa dữ liệu chấm công:</strong> Xóa tất cả bản ghi chấm công của mọi người dùng</p>
            <p>• <strong>Quản lý người dùng:</strong> Thêm email vào file .env để cấp quyền chấm công</p>
            <p>• <strong>Quản lý admin:</strong> Thêm email vào NEXT_PUBLIC_AUTHORIZED_ADMIN_EMAILS trong .env</p>
          </div>
        </div>
      </div>
    </div>
  );
}