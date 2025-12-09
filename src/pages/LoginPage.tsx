import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, loginWithCredentials } = useApp();
  const navigate = useNavigate();
  
  // Default to worker view, toggle to admin view
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Credentials state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleWorkerLogin = (provider: 'zalo' | 'google') => {
    login(provider, UserRole.WORKER);
    navigate('/cs');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f6] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
            <img 
              src="https://cdn0685.cdn4s.com/media/logo/logo.png" 
              alt="Olive Food & Services Logo" 
              className="h-24 object-contain"
              style={{ width: 'auto', maxHeight: '96px' }} // Inline style backup
            />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Olive Food & Services</h1>
        <p className="text-gray-500 mb-8">Hệ thống quản lý suất ăn công nghiệp</p>

        {!isAdminMode ? (
            /* WORKER VIEW (DEFAULT) */
            <div className="space-y-4 animate-fade-in">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Đăng nhập nhanh</p>
                <button
                    onClick={() => handleWorkerLogin('zalo')}
                    className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm"
                >
                    <div className="font-bold text-xl bg-white text-blue-500 w-8 h-8 rounded-full flex items-center justify-center">Z</div>
                    <span>Đăng nhập bằng Zalo</span>
                </button>
                <button
                    onClick={() => handleWorkerLogin('google')}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <Mail size={20} className="text-red-500" />
                    <span>Đăng nhập bằng Google</span>
                </button>

                {/* Footer Link for Admin */}
                <div className="pt-8 mt-4 border-t border-gray-100">
                    <button 
                        onClick={() => setIsAdminMode(true)}
                        className="text-xs text-gray-400 hover:text-[#FF6B00] transition-colors underline decoration-dotted underline-offset-4"
                    >
                        Bạn là Quản lý / Admin? Đăng nhập tại đây
                    </button>
                </div>
            </div>
        ) : (
            /* ADMIN / MANAGER VIEW */
            <form onSubmit={handleManagementLogin} className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                     <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Quản lý hệ thống</p>
                </div>
                
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

                {/* Footer Link to go back */}
                <div className="pt-6">
                    <button 
                        type="button"
                        onClick={() => {
                            setIsAdminMode(false);
                            setError('');
                        }}
                        className="text-sm text-gray-500 hover:text-[#FF6B00] transition-colors"
                    >
                        ← Quay lại đăng nhập khách hàng
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};