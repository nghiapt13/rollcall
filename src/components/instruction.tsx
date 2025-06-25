'use client';

import { useState } from 'react';
import { HelpCircle} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function Instruction() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full max-w-md mx-auto mt-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Hướng dẫn sử dụng
                    </Button>
                </DialogTrigger>

                <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto sm:mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            Cách sử dụng hệ thống chấm công
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 sm:space-y-6 mt-4">
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Hướng dẫn chi tiết từng bước để sử dụng hệ thống
                        </p>
                        <div className='bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 space-y-3 sm:space-y-4'>

                            {/* Bước 1: Đăng nhập */}
                            <div className="flex gap-3 sm:gap-4 leading-relaxed">
                                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                    1
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Đăng nhập</h4>
                                    <p className="text-gray-600 mt-1 text-xs sm:text-sm break-words">
                                        Sử dụng tài khoản Google đã được đăng kí với Trưởng phòng CTSV để đăng nhập vào hệ thống
                                    </p>
                                </div>
                            </div>
                            
                            {/* Bước 2: Check-in */}
                            <div className="flex gap-3 sm:gap-4 leading-relaxed">
                                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                    2
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                                        Check-in (Điểm danh vào)
                                    </h4>
                                    <p className="text-gray-600 mt-1 text-xs sm:text-sm break-words">
                                        Nhấn nút &quot;Điểm danh&quot; để ghi nhận giờ vào làm. Hệ thống sẽ yêu cầu chụp ảnh xác thực.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Bước 3: Chụp ảnh */}
                            <div className="flex gap-3 sm:gap-4 leading-relaxed">
                                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                    3
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                                        Chụp ảnh xác thực
                                    </h4>
                                    <p className="text-gray-600 mt-1 text-xs sm:text-sm break-words">
                                        Cho phép truy cập camera và chụp ảnh để xác thực danh tính.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Bước 4: Check-out */}
                            <div className="flex gap-3 sm:gap-4 leading-relaxed">
                                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                    4
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                                        Check-out (Điểm danh ra)
                                    </h4>
                                    <p className="text-gray-600 mt-1 text-xs sm:text-sm break-words">
                                        Khi kết thúc ca làm, nhấn nút &quot;Checkout&quot; và chụp ảnh xác thực để hoàn tất.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lưu ý quan trọng */}
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">📝 Lưu ý quan trọng:</h4>
                            <ul className="text-blue-800 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                <li>• Mỗi ngày chỉ được check-in và checkout một lần</li>
                                <li>• Phải check-in trước khi có thể checkout</li>
                                <li>• Ảnh xác thực là bắt buộc cho cả check-in và checkout</li>
                            </ul>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}