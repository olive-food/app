// pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, loginWithCredentials } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'worker' | 'management'>('worker');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // =========================================================
  // 1. Xử lý GOOGLE CALLBACK: ?googleUser=... trên URL
  //    -> Tự động đăng nhập + chuyển sang /cs
  // =========================================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleUserParam = params.get('googleUser');

    if (!googleUserParam) return;

    try {
      // googleUserParam đang là chuỗi JSON đã encode, ví dụ: %7B%22id%22...
      const decoded = decodeURIComponent(googleUserParam);
      const profile = JSON.parse(decoded); // { id, email, name, picture }

      // Đăng nhập với provider "google" + truyền profile để lấy đúng tên + avatar
      login('google', UserRole.WORKER, profile);

      // Chuyển sang trang chọn bếp / menu
      navigate('/cs', { replace: true });

      // Xoá query khỏi URL cho sạch: giữ lại /#/cs
      const cleanUrl = `${window.location.origin}/#/cs`;
      window.history.replaceState({}, '', cleanUrl);
    } catch (e) {
      console.error('Error handling googleUser callback:', e);
      // Nếu có lỗi thì xoá query và để người dùng ở lại màn hình login
      const cleanUrl = `${window.location.origin}/#/login`;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [location.search, login, navigate]);

  // =========================================================
  // 2. Người dùng bấm nút Google
  // =========================================================
  const handleGoogleLogin = () => {
    // Gửi sang API backend để bắt đầu luồng OAuth
    window.location.href = '/api/auth/google/login';
  };

  // 3. Người dùng bấm nút Zalo (login giả lập)
  const handleZaloLogin = () => {
    login('zalo', UserRole.WORKER);
    navigate('/cs');
  };

  // 4. Đăng nhập quản lý (username + password)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ok = loginWithCredentials(username, password);
    if (!ok) {
      setError('Sai tài khoản hoặc mật khẩu');
      return;
    }

    navigate('/admin');
  };

  // =========================================================
  // 5. Giao diện (logo + màu cam)
  // =========================================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white border border-orange-100 shadow-sm rounded-3xl p-6">
        {/* Logo + tiêu đề */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Olive Food Services"
            className="mx-auto mb-3 h-32 object-contain"
          />
          <h1 className="text-xl font-bold text-orange-600">
            Olive Food Services
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống phục vụ suất ăn công nghiệp & tiếp nhận ý kiến khách hàng
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 bg-orange-50 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setActiveTab('worker')}
            className={`flex-1 py-2 text-xs font-semibold rounded-2xl transition ${
              activeTab === 'worker'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-transparent text-orange-600'
            }`}
          >
            Khách hàng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('management')}
            className={`flex-1 py-2 text-xs font-semibold rounded-2xl transition ${
              activeTab === 'management'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-transparent text-orange-600'
            }`}
          >
            Quản lý / Admin
          </button>
        </div>

        {/* NỘI DUNG TAB KHÁCH HÀNG */}
        {activeTab === 'worker' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 border border-orange-300 rounded-2xl py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-50"
            >
              <UserIcon size={18} />
              <span>Đăng nhập bằng Google</span>
            </button>

            <button
              type="button"
              onClick={handleZaloLogin}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white rounded-2xl py-2.5 text-sm font-medium hover:bg-orange-600"
            >
              <UserIcon size={18} />
              <span>Đăng nhập bằng Zalo</span>
            </button>

            <p className="text-[11px] text-slate-500 text-center mt-1 px-2 leading-relaxed">
              <strong>
                Khách hàng đăng nhập bằng tài khoản Zalo hoặc Google để vào xem Menu
                hoặc chấm điểm &amp; góp ý cho bếp ăn.
              </strong>
            </p>
          </div>
        )}

        {/* NỘI DUNG TAB QUẢN LÝ */}
        {activeTab === 'management' && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tài khoản
              </label>
              <div className="flex items-center gap-2 border border-orange-200 rounded-2xl px-3 py-2">
                <UserIcon size={16} className="text-orange-400" />
                <input
                  type="text"
                  className="flex-1 outline-none text-sm"
                  placeholder="Nhập username quản lý"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mật khẩu
              </label>
              <div className="flex items-center gap-2 border border-orange-200 rounded-2xl px-3 py-2">
                <Lock size={16} className="text-orange-400" />
                <input
                  type="password"
                  className="flex-1 outline-none text-sm"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-2xl text-sm font-medium hover:bg-orange-600"
            >
              <span>Đăng nhập</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
