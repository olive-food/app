import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Search, AlertCircle } from 'lucide-react';

interface GoogleProfile {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
}

export const CompanySelection: React.FC = () => {
  const { kitchens, user, login } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const processedRef = useRef(false);

  // Xử lý googleUser=? trên URL khi quay về /cs
  useEffect(() => {
    if (processedRef.current) return;

    const params = new URLSearchParams(location.search);
    const encoded = params.get('googleUser');
    if (!encoded) return;

    try {
      const decoded = decodeURIComponent(encoded);
      const profile: GoogleProfile = JSON.parse(decoded);

      console.log('Processing Google user:', profile.name);

      login('google', UserRole.WORKER, profile);
    } catch (e) {
      console.error('Failed to process Google user from URL:', e);
    } finally {
      processedRef.current = true;
      // Xoá query khỏi URL, giữ lại /cs
      navigate('/cs', { replace: true });
    }
  }, [location.search, login, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const slug = code.trim().toLowerCase();
    const kitchen = kitchens.find((k) => k.slug.toLowerCase() === slug);

    if (!kitchen) {
      setError('Không tìm thấy bếp với mã này. Vui lòng kiểm tra lại.');
      return;
    }

    navigate(`/cs/${kitchen.slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm p-6">
        {/* Header: avatar + chào tên */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={
              user?.avatar ||
              'https://ui-avatars.com/api/?name=Khach+hang&background=random'
            }
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="text-xs text-slate-500">Xin chào,</p>
            <p className="text-lg font-semibold">
              {user?.name || 'Khách hàng'}
            </p>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-2">Truy cập Bếp ăn</h1>
        <p className="text-sm text-slate-600 mb-4">
          Vui lòng nhập mã bếp (ví dụ: <strong>ss</strong>, <strong>gt</strong>) hoặc truy
          cập link do công ty cung cấp.
        </p>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Nhập mã bếp (slug)"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2.5 rounded-xl hover:bg-orange-600 transition-colors text-sm"
          >
            Truy cập
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Hệ thống suất ăn công nghiệp Olive Food Services
        </p>
      </div>
    </div>
  );
};
