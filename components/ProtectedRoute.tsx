// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

/**
 * Component bảo vệ route:
 * - Nếu chưa đăng nhập → chuyển về /login
 * - Nếu đăng nhập nhưng không đúng vai trò → chuyển về trang phù hợp
 * - Nếu đúng → hiển thị nội dung bên trong (Outlet)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser } = useApp();

  // 1. Chưa đăng nhập -> quay về /login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Đã đăng nhập nhưng không đúng role được phép
  if (!allowedRoles.includes(currentUser.role)) {
    // Nếu là công nhân thì cho về trang chọn bếp
    if (currentUser.role === UserRole.WORKER) {
      return <Navigate to="/cs" replace />;
    }

    // Nếu là admin hoặc kitchen manager thì cho về trang admin
    if (
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.KITCHEN_MANAGER
    ) {
      return <Navigate to="/admin" replace />;
    }

    // Mặc định an toàn: quay về /login
    return <Navigate to="/login" replace />;
  }

  // 3. Đúng quyền → render các route con
  return <Outlet />;
};

// Route chỉ dành cho Admin / Quản lý bếp
export const AdminRoute: React.FC = () => (
  <ProtectedRoute
    allowedRoles={[UserRole.ADMIN, UserRole.KITCHEN_MANAGER]}
  />
);

// Route dành cho Công nhân (và Admin/Manager vẫn truy cập được)
export const WorkerRoute: React.FC = () => (
  <ProtectedRoute
    allowedRoles={[
      UserRole.WORKER,
      UserRole.ADMIN,
      UserRole.KITCHEN_MANAGER,
    ]}
  />
);

export default ProtectedRoute;
