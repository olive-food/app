import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { CompanySelection } from './pages/worker/CompanySelection';
import { KitchenView } from './pages/worker/KitchenView';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Worker Routes */}
          <Route path="/cs" element={<CompanySelection />} />
          <Route path="/cs/:slug" element={<KitchenView />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
