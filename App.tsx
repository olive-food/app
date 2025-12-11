import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { CompanySelection } from './pages/worker/CompanySelection';
import { KitchenView } from './pages/worker/KitchenView';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { WorkerRoute, AdminRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* 1. Đăng nhập */}
          <Route path="/login" element={<LoginPage />} />

          {/* 2. Trang chọn bếp (CS) – CHO PHÉP MỞ, không chặn */}
          <Route path="/cs" element={<CompanySelection />} />

          {/* 3. Các trang cần đăng nhập (Worker) */}
          <Route element={<WorkerRoute />}>
            {/* Vào bếp cụ thể */}
            <Route path="/cs/:slug" element={<KitchenView />} />
          </Route>

          {/* 4. Trang Admin (cần quyền Admin/Manager) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* 5. Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
