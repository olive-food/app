import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useApp();

    if (!isAuthenticated) {
        // 1. Chưa đăng nhập: Luôn chuyển hướng về trang đăng nhập
        return <Navigate to="/login" replace />;
    }

    // 2. Đã đăng nhập: Kiểm tra vai trò
    if (user && !allowedRoles.includes(user.role)) {
        // Vai trò không được phép: Chuyển về trang mặc định hoặc trang lỗi
        // Ví dụ: ADMIN cố truy cập trang Worker
        console.warn(`User ${user.role} tried to access restricted route.`);
        // Có thể chuyển về trang Dashboard của user đó, nhưng tạm thời chuyển về /cs
        return <Navigate to="/cs" replace />; 
    }
    
    // 3. Đã đăng nhập và đúng vai trò: Hiển thị nội dung
    return <Outlet />;
};

// Component để bảo vệ các tuyến đường chỉ dành cho Admin
export const AdminRoute: React.FC = () => {
    return <ProtectedRoute allowedRoles={[UserRole.ADMIN]} />;
};

// Component để bảo vệ các tuyến đường chỉ dành cho Worker
export const WorkerRoute: React.FC = () => {
    return <ProtectedRoute allowedRoles={[UserRole.WORKER, UserRole.ADMIN]} />; // ADMIN cũng có thể truy cập
};