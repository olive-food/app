import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { CompanySelection } from './pages/worker/CompanySelection';
import { KitchenView } from './pages/worker/KitchenView';
import { AdminDashboard } from './pages/admin/AdminDashboard';
// 🌟 THÊM IMPORT: Component bảo vệ tuyến đường
import { WorkerRoute, AdminRoute } from './components/ProtectedRoute'; 

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* 1. Tuyến đường công khai (Đăng nhập) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 2. TUYẾN ĐƯỜNG WORKER (Đã đăng nhập) */}
          <Route element={<WorkerRoute />}> 
             {/* Trang chọn bếp (CS) không cần bảo vệ chặt như các trang khác,
                nhưng nếu user chưa login thì phải redirect về /login */}
             <Route path="/cs" element={<CompanySelection />} /> 
             <Route path="/cs/:slug" element={<KitchenView />} />
          </Route>
          
          {/* 3. TUYẾN ĐƯỜNG ADMIN (Đã đăng nhập và là Admin) */}
          <Route element={<AdminRoute />}>
             <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* 4. Fallback */}
          {/* Nếu user vào root (/) và chưa đăng nhập, chuyển đến /login. 
             Nếu user đã đăng nhập, cần chuyển đến trang chính của họ (Ví dụ: /cs) */}
          <Route path="/" element={<Navigate to="/cs" replace />} /> 
          <Route path="*" element={<Navigate to="/cs" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;