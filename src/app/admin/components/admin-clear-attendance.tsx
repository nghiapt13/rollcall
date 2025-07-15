'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AdminClearAttendance() {
  const { user } = useUser();
  const [confirmCode, setConfirmCode] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
const router = useRouter();
  const handleClearAttendance = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }

    setIsClearing(true);

    try {
      const response = await fetch('/api/clear-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.emailAddresses[0]?.emailAddress,
          confirmCode: confirmCode.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Xóa dữ liệu chấm công thành công!`,
          {
            duration: 5000,
          }
        );
        setConfirmCode('');
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Không thể xóa dữ liệu chấm công');
      }

    } catch (error) {
      console.error('❌ Lỗi xóa dữ liệu:', error);
      toast.error('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setIsClearing(false);
    }
  };

  const resetForm = () => {
    setConfirmCode('');
  };

  const closeModal = () => {
    setIsOpen(false);
    resetForm();
  };

  if (!user) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-center">
        <Shield className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">Vui lòng đăng nhập để truy cập tính năng quản trị</p>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Xóa dữ liệu chấm công
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Xóa dữ liệu chấm công
          </DialogTitle>
          <DialogDescription className="text-red-700">
            <strong>⚠️ CẢNH BÁO:</strong> Thao tác này sẽ xóa hoàn toàn tất cả dữ liệu chấm công của mọi người dùng.
            Hành động này KHÔNG THỂ HOÀN TÁC!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                </ul>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="flex-1"
              disabled={isClearing}
            >
              Hủy bỏ
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={
                    isClearing ||
                    confirmCode.trim() !== 'DELETE MY DATA'
                  }
                  className="flex-1"
                >
                  {isClearing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa dữ liệu
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}