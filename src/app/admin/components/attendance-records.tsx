'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CalendarIcon,  ChevronLeftIcon, ChevronRightIcon, EyeIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AttendanceRecord {
    id: string;
    checkInTime: string;
    checkInPhoto?: string;
    checkOutTime?: string;
    checkOutPhoto?: string;
    date: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        imageUrl:string;
    };
}

interface AttendanceData {
    records: AttendanceRecord[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export function AttendanceRecords() {
    const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchAttendanceRecords = async (date: string, page: number = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/attendance-records?date=${date}&page=${page}&limit=10`);
            const result = await response.json();

            if (result.success) {
                setAttendanceData(result.data);
            } else {
                console.error('Lỗi lấy dữ liệu:', result.error);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceRecords(selectedDate, currentPage);
    }, [selectedDate, currentPage]);

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const formatTime = (timeString: string) => {
        return format(new Date(timeString), 'HH:mm:ss', { locale: vi });
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    };

    // const getRoleBadgeColor = (role: string) => {
    //     switch (role) {
    //         case 'ADMIN':
    //             return 'bg-red-100 text-red-800';
    //         case 'EMPLOYEE':
    //             return 'bg-blue-100 text-blue-800';
    //         default:
    //             return 'bg-gray-100 text-gray-800';
    //     }
    // };

    const ImageButton = ({ photoUrl, label }: { photoUrl?: string; label: string }) => {
        if (!photoUrl) {
            return <span className="text-gray-400 text-sm">Không có ảnh</span>;
        }

        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImage(photoUrl)}
                className="flex items-center gap-1 h-8"
            >
                <EyeIcon className="h-3 w-3" />
                {label}
            </Button>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách chấm công</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header với bộ lọc ngày */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Danh sách chấm công
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label htmlFor="date-picker" className="text-sm font-medium">
                                Chọn ngày:
                            </label>
                            <Input
                                id="date-picker"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            Tổng: {attendanceData?.pagination.totalRecords || 0} bản ghi
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bảng attendance records */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableCaption>
                            Danh sách điểm danh ngày {formatDate(selectedDate)}
                        </TableCaption>
                        <TableHeader>
                            <TableRow className='text-center'>
                                <TableHead className="w-[200px] text-center">Tên</TableHead>
                                <TableHead>Thời gian check-in</TableHead>
                                <TableHead>Hình ảnh check-in</TableHead>
                                <TableHead>Check-out</TableHead>
                                <TableHead>Ảnh Check-out</TableHead>
                                <TableHead>Trạng thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceData?.records.map((record) => (
                                <TableRow key={record.id}>
                                    {/* Thông tin nhân viên */}
                                    <TableCell className=''>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage 
                                                    src={record.user.imageUrl || undefined} 
                                                    alt={record.user.name}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {record.user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-sm">{record.user.name}</div>
                                                <div className="text-xs text-gray-500">{record.user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>


                                    {/* Thời gian check-in */}
                                    <TableCell>
                                        <div className="font-mono text-sm bg-green-50 px-2 py-1 rounded text-green-700">
                                            {formatTime(record.checkInTime)}
                                        </div>
                                    </TableCell>

                                    {/* Ảnh check-in */}
                                    <TableCell>
                                        <ImageButton photoUrl={record.checkInPhoto} label="Xem" />
                                    </TableCell>

                                    {/* Thời gian check-out */}
                                    <TableCell>
                                        {record.checkOutTime ? (
                                            <div className="font-mono text-sm bg-red-50 px-2 py-1 rounded text-red-700">
                                                {formatTime(record.checkOutTime)}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Chưa check-out</span>
                                        )}
                                    </TableCell>

                                    {/* Ảnh check-out */}
                                    <TableCell>
                                        <ImageButton photoUrl={record.checkOutPhoto} label="Xem" />
                                    </TableCell>

                                    {/* Trạng thái */}
                                    <TableCell>
                                        {record.checkOutTime ? (
                                            <Badge className="bg-green-100 text-green-800">
                                                Hoàn thành
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-yellow-100 text-yellow-800">
                                                Chưa checkout
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Thông báo khi không có dữ liệu */}
                    {attendanceData && attendanceData.records.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="text-gray-500">
                                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Không có dữ liệu điểm danh cho ngày {formatDate(selectedDate)}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {attendanceData && attendanceData.pagination.totalPages > 1 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Trang {attendanceData.pagination.currentPage} / {attendanceData.pagination.totalPages}
                                <span className="ml-2">({attendanceData.pagination.totalRecords} bản ghi)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!attendanceData.pagination.hasPrev}
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                    Trước
                                </Button>

                                {/* Hiển thị số trang */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, attendanceData.pagination.totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!attendanceData.pagination.hasNext}
                                >
                                    Sau
                                    <ChevronRightIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal hiển thị ảnh */}
            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Ảnh điểm danh</DialogTitle>
                        </DialogHeader>
                        <Image
                            src={selectedImage}
                            alt="Ảnh điểm danh"
                            width={1600}
                            height={900}
                            className="max-w-full h-auto rounded"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}