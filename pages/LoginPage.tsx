const handleGoogleLogin = () => {
  window.location.href = '/api/auth/google/login';
};
const location = useLocation();
const params = new URLSearchParams(location.search);
const googleUserParam = params.get('googleUser');

let googleUser: { email: string; name: string; picture: string } | null = null;
if (googleUserParam) {
  try {
    googleUser = JSON.parse(decodeURIComponent(googleUserParam));
    console.log('Google user:', googleUser);
  } catch (e) {
    console.error(e);
  }
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, loginWithCredentials } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'worker' | 'management'>('worker');
  const location = useLocation();

  // Nếu vừa được redirect từ Google (googleLogin=1)
  // thì gọi login('google') và chuyển vào màn bên trong
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleLogin = params.get('googleLogin');

    if (googleLogin === '1') {
      // Tạo user WORKER giả lập bằng Google (logic nằm trong AppContext.login)
      login('google');
    }
  }, [location.search, login, navigate]);

  // Credentials state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleWorkerLogin = (provider: 'zalo' | 'google') => {
    login(provider, UserRole.WORKER);
    navigate('/cs', { replace: true });
  };

  const handleManagementLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginWithCredentials(username, password);
    if (success) {
        navigate('/admin');
    } else {
        setError('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 py-6">
    <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-xl px-4 py-6 sm:px-8 sm:py-8 text-center">
        <div className="flex justify-center mb-6">
            <img 
              src="https://cdn0685.cdn4s.com/media/logo/logo.png" 
              alt="Olive Food & Services Logo" 
              className="h-24 object-contain"
            />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Olive Food & Services</h1>
        <p className="text-gray-500 mb-6">Hệ thống quản lý suất ăn công nghiệp</p>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
            <button 
                onClick={() => setActiveTab('worker')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'worker' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Khách hàng
            </button>
            <button 
                onClick={() => setActiveTab('management')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'management' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Quản lý / Admin
            </button>
        </div>

        {activeTab === 'worker' ? (
            <div className="space-y-4 animate-fade-in">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Đăng nhập nhanh</p>
                <button
                    onClick={() => handleWorkerLogin('zalo')}
                    className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <div className="font-bold text-xl">Z</div>
                    <span>Đăng nhập bằng Zalo</span>
                </button>
                <button
                     onClick={handleGoogleLogin}
                        className="w-full mt-3 flex items-center justify-center rounded-xl border border-gray-300 py-3 text-gray-700 hover:bg-gray-50 transition"
                        >
                 {/* icon + text như cũ */}
                     Đăng nhập bằng Google
                </button>
            </div>
        ) : (
            <form onSubmit={handleManagementLogin} className="space-y-4 animate-fade-in">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Đăng nhập hệ thống</p>
                <div className="text-left">
                     <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                     <div className="relative">
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none"
                            placeholder="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                        <UserIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                     </div>
                </div>
                <div className="text-left">
                     <label className="block text-xs font-medium text-gray-500 mb-1">Mật khẩu</label>
                     <div className="relative">
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none"
                            placeholder="••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                     </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E66000] text-white py-3 px-4 rounded-xl font-medium transition-colors mt-2"
                >
                    <span>Đăng nhập</span>
                    <ArrowRight size={18} />
                </button>
            </form>
        )}
      </div>
    </div>
  );
};