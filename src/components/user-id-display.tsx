'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Copy, Check, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UserIdDisplay() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  const handleCopyUserId = async () => {
    if (!user?.id) return;

    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Lỗi copy:', error);
      // Fallback cho browsers không hỗ trợ clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = user.id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Vui lòng đăng nhập để xem User ID</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-blue-800">Thông tin User ID</CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          Sử dụng User ID này để cấp quyền quản trị viên
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Thông tin người dùng */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-blue-800">Tên:</span>
            <span className="ml-2 text-blue-700">{user.fullName || 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-blue-800">Email:</span>
            <span className="ml-2 text-blue-700">
              {user.emailAddresses[0]?.emailAddress || 'N/A'}
            </span>
          </div>
        </div>

        {/* User ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-800">User ID:</label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-white border border-blue-200 rounded-md">
              <code className="text-sm font-mono text-gray-800 break-all">
                {user.id}
              </code>
            </div>
            <Button
              onClick={handleCopyUserId}
              size="sm"
              className="shrink-0"
              variant={copied ? "default" : "outline"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Đã copy
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
          <div className="flex items-start">
            <Info className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Cách cấp quyền admin:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Copy User ID ở trên</li>
                <li>Thêm vào file <code>.env.local</code>:</li>
                <li><code>NEXT_PUBLIC_AUTHORIZED_USER_IDS=user_id_1,user_id_2</code></li>
                <li>Restart server: <code>npm run dev</code></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Example env variable */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-800">
            Ví dụ thêm vào .env.local:
          </label>
          <div className="p-3 bg-gray-100 border rounded-md">
            <code className="text-xs text-gray-700 break-all">
              NEXT_PUBLIC_AUTHORIZED_USER_IDS={user.id}
            </code>
          </div>
        </div>

        {/* Thời gian tạo */}
        <div className="text-xs text-gray-500 pt-2 border-t border-blue-200">
          <p>🕒 Thời gian: {new Date().toLocaleString('vi-VN')}</p>
          <p>📍 Trang: /admin</p>
        </div>
      </CardContent>
    </Card>
  );
} 