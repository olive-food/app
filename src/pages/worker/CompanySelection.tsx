import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, AlertCircle } from 'lucide-react';

export const CompanySelection: React.FC = () => {
  const { kitchens, currentUser } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const kitchen = kitchens.find(k => k.slug.toLowerCase() === code.toLowerCase());
    if (kitchen) {
        navigate(`/cs/${kitchen.slug}`);
    } else {
        setError('Không tìm thấy bếp với mã này. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
        {/* Header */}
        <div className="bg-[#FF6B00] text-white p-6 rounded-b-3xl shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-2">
                <img 
                    src={currentUser?.avatar || 'https://via.placeholder.com/40'} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-white"
                />
                <div>
                    <p className="text-xs opacity-80">Xin chào,</p>
                    <p className="font-bold text-lg">{currentUser?.name || 'Bạn'}</p>
                </div>
            </div>
            <h1 className="text-2xl font-bold mt-4">Truy cập Bếp ăn</h1>
            <p className="text-sm opacity-90">Vui lòng nhập mã bếp hoặc truy cập link do công ty cung cấp.</p>
        </div>

        {/* Access Form */}
        <div className="px-4 w-full max-w-md mx-auto flex-1 flex flex-col items-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm w-full">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mã Bếp (VD: ss, gt)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                    setError('');
                                }}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none"
                                placeholder="Nhập mã bếp..."
                            />
                            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-[#FF6B00] text-white font-bold py-3 rounded-xl hover:bg-[#E66000] transition-colors"
                    >
                        Truy cập
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center text-gray-400 text-sm">
                <p>Hệ thống suất ăn công nghiệp Olive Food & Services</p>
            </div>
        </div>
    </div>
  );
};