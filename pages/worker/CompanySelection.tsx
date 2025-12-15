import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Search, AlertCircle } from 'lucide-react';

type OAuthProfile = {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
};

export const CompanySelection: React.FC = () => {
  const { kitchens, user, login } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const processedRef = useRef(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // ✅ Parse zaloUser/googleUser từ URL và login()
  useEffect(() => {
    if (processedRef.current) return;

    const params = new URLSearchParams(location.search);
    const googleParam = params.get('googleUser');
    const zaloParam = params.get('zaloUser');

    const raw = googleParam || zaloParam;
    if (!raw) return;

    try {
      const profile: OAuthProfile = JSON.parse(decodeURIComponent(raw));
      const provider = googleParam ? 'google' : 'zalo';

      login(provider, UserRole.WORKER, profile);
    } catch (e) {
      console.error('Failed to parse OAuth user:', e);
    } finally {
      processedRef.current = true;
      // Xoá query khỏi URL
      navigate('/cs', { replace: true });
    }
  }, [location.search, login, navigate]);

  // ✅ Nếu chưa có user -> về login (tránh vào CS chay)
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

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

  if (!user) return null;

  const displayName = user.name || 'Khách hàng';
  const avatarUrl =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF6B00&color=fff`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              // fallback nếu avatar lỗi
              (e.currentTarget as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF6B00&color=fff`;
            }}
          />
          <div>
            <p className="text-xs text-slate-500">Xin chào,</p>
            <p className="text-lg font-semibold">{displayName}</p>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-2">Truy cập Bếp ăn</h1>
        <p className="text-sm text-slate-600 mb-4">
          Vui lòng nhập mã bếp (ví dụ: <strong>ss</strong>, <strong>gt</strong>) hoặc truy cập link do công ty cung cấp.
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
