'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
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
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users, Trash2, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    name: string;
    imageUrl?: string;
    role: 'USER' | 'ADMIN' | 'EMPLOYEE';
    isDeleted: boolean;
    createdAt: string;
    _count: {
        attendanceRecords: number;
    };
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<{ id: string; role: string } | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            const result = await response.json();

            if (result.success) {
                setUsers(result.data);
            } else {
                toast.error('Không thể tải danh sách người dùng');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            const result = await response.json();

            if (result.success) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, role: newRole as 'USER' | 'ADMIN' | 'EMPLOYEE' } : user
                ));
                toast.success('Cập nhật vai trò thành công'); // ✅ Đã có thông báo thành công
                setEditingUser(null);
            } else {
                toast.error(result.error || 'Không thể cập nhật vai trò');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Có lỗi xảy ra khi cập nhật vai trò');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                setUsers(users.filter(user => user.id !== userId));
                toast.success('Xóa người dùng thành công');
            } else {
                toast.error(result.error || 'Không thể xóa người dùng');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Có lỗi xảy ra khi xóa người dùng');
        } finally {
            setDeleteUserId(null);
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "user",
            header: "Người dùng",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.imageUrl} alt={user.name} />
                            <AvatarFallback>
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Vai trò
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const user = row.original;
                const getRoleVariant = (role: string) => {
                    switch (role) {
                        case 'ADMIN':
                            return 'default';
                        case 'EMPLOYEE':
                            return 'outline';
                        default:
                            return 'secondary';
                    }
                };
                
                const getRoleLabel = (role: string) => {
                    switch (role) {
                        case 'ADMIN':
                            return 'Quản trị viên';
                        case 'EMPLOYEE':
                            return 'Nhân viên';
                        default:
                            return 'Người dùng';
                    }
                };
                
                return (
                    <Badge
                        variant={getRoleVariant(user.role)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setEditingUser({ id: user.id, role: user.role })}
                    >
                        {getRoleLabel(user.role)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Ngày tạo
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return new Date(row.original.createdAt).toLocaleDateString('vi-VN');
            },
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteUserId(user.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                );
            },
        },
    ];

    useEffect(() => {
        if (isOpen && users.length === 0) {
            fetchUsers();
        }
    }, [isOpen]);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Users className="mr-2 h-4 w-4" />
                        Quản lý người dùng
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] p-1 sm:max-w-[1000px]">
                    <DialogHeader className="px-6 py-4">
                        <DialogTitle>Quản lý người dùng</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 pb-6 flex-1 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-lg font-medium">Không có người dùng nào</p>
                                    <p className="text-sm text-muted-foreground">Chưa có người dùng nào trong hệ thống.</p>
                                </div>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={users}
                                searchKey="user"
                                searchPlaceholder="Tìm kiếm theo tên hoặc email..."
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog chỉnh sửa vai trò */}
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa vai trò người dùng</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Vai trò mới:</label>
                            <Select
                                value={editingUser?.role}
                                onValueChange={(value) =>
                                    setEditingUser(prev => prev ? { ...prev, role: value } : null)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">Người dùng</SelectItem>
                                    <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setEditingUser(null)}>
                                Hủy
                            </Button>
                            <Button
                                onClick={() => editingUser && handleRoleChange(editingUser.id, editingUser.role)}
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}