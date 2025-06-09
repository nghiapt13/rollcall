'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2, AlertTriangle, Shield, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AdminClearAttendance() {
  const { user } = useUser();
  const [confirmCode, setConfirmCode] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState<{
    success: boolean;
    message: string;
    deletedRows?: number;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleClearAttendance = async () => {
    if (!user) return;

    setIsClearing(true);
    setClearResult(null);

    try {
      const response = await fetch('/api/clear-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.emailAddresses[0]?.emailAddress, // Gửi email thay vì userId
          confirmCode: confirmCode.trim()
        }),
      });

      const result = await response.json();
      
      setClearResult({
        success: result.success,
        message: result.message || result.error,
        deletedRows: result.deletedRows
      });
      
      setShowResult(true);
      
      if (result.success) {
        setConfirmCode(''); // Reset form nếu thành công
      }

    } catch (error) {
      console.error('❌ Lỗi xóa dữ liệu:', error);
      setClearResult({
        success: false,
        message: 'Lỗi kết nối. Vui lòng thử lại sau.'
      });
      setShowResult(true);
    } finally {
      setIsClearing(false);
    }
  };

  const resetForm = () => {
    setConfirmCode('');
    setClearResult(null);
    setShowResult(false);
  };

  if (!user) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <Shield className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Vui lòng đăng nhập để truy cập tính năng quản trị</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <CardTitle className="text-red-800">Quản trị - Xóa dữ liệu chấm công</CardTitle>
        </div>
        <CardDescription className="text-red-700">
          <strong>⚠️ CẢNH BÁO:</strong> Thao tác này sẽ xóa hoàn toàn tất cả dữ liệu chấm công của mọi người dùng. 
          Hành động này KHÔNG THỂ HOÀN TÁC!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Kết quả thao tác */}
        {showResult && clearResult && (
          <div className={`p-4 rounded-lg ${
            clearResult.success 
              ? 'bg-green-100 border border-green-200' 
              : 'bg-red-100 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {clearResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <X className="w-5 h-5 text-red-600 mr-2" />
              )}
              <p className={`font-medium ${
                clearResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {clearResult.success ? 'Thành công!' : 'Thất bại!'}
              </p>
            </div>
            <p className={`text-sm ${
              clearResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {clearResult.message}
            </p>
            {clearResult.success && clearResult.deletedRows !== undefined && (
              <p className="text-sm text-green-600 mt-1">
                📊 Số bản ghi đã xóa: <strong>{clearResult.deletedRows}</strong>
              </p>
            )}
            <Button
              onClick={resetForm}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Đóng
            </Button>
          </div>
        )}

        {/* Form xóa dữ liệu */}
        {!showResult && (
          <>
            <div className="space-y-2">
              <Label htmlFor="confirmCode" className="text-red-800 font-medium">
                Nhập mã xác nhận để tiếp tục:
              </Label>
              <div className="p-3 bg-red-100 rounded-md border border-red-200">
                <code className="text-red-800 font-mono text-sm">DELETE MY DATA</code>
              </div>
              <Input
                id="confirmCode"
                type="text"
                placeholder="Nhập chính xác mã xác nhận..."
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="border-red-300 focus:border-red-500"
                disabled={isClearing}
              />
            </div>

            {/* Thông tin cảnh báo */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Hành động này sẽ:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Xóa tất cả thông tin chấm công của mọi tài khoản</li>
                    <li>Xóa tất cả ảnh đã chụp khi chấm công</li>
                    <li>Không thể khôi phục dữ liệu sau khi xóa</li>
                    <li>Chỉ giữ lại header trong Google Sheets</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Nút xóa với Alert Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={
                    isClearing || 
                    confirmCode.trim() !== 'DELETE MY DATA'
                  }
                  className="w-full"
                >
                  {isClearing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Đang xóa dữ liệu...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa tất cả dữ liệu chấm công
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center text-red-600">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Xác nhận xóa dữ liệu
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-left">
                    <strong>Bạn có chắc chắn muốn xóa tất cả dữ liệu chấm công?</strong>
                    <br /><br />
                    Hành động này sẽ:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Xóa vĩnh viễn tất cả bản ghi chấm công</li>
                      <li>Xóa tất cả link ảnh đã lưu</li>
                      <li>Không thể khôi phục dữ liệu</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAttendance}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xác nhận xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* Thông tin người dùng */}
        <div className="text-xs text-gray-600 pt-2 border-t">
          <p>👤 Đăng nhập với: {user.emailAddresses[0]?.emailAddress}</p>
          <p>🕒 Thời gian: {new Date().toLocaleString('vi-VN')}</p>
        </div>
      </CardContent>
    </Card>
  );
}