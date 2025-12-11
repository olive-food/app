import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext'; 
import { UserRole } from '../../types'; // Cần đảm bảo file types.ts có UserRole
import { Search, AlertCircle } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho user lấy từ URL (dùng chung cho Google và Zalo)
interface AuthUser {
    id?: string;
    email?: string; // Chỉ có cho Google
    name?: string;
    picture?: string; // Zalo dùng 'picture', Google dùng 'picture'
}

export const CompanySelection: React.FC = () => {
    // Lấy user, login từ AppContext
    const { kitchens, user, login } = useApp();
    
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // LOGIC CHÍNH: Xử lý đăng nhập từ tham số URL (Google hoặc Zalo)
    useEffect(() => {
        // 1. Nếu user đã đăng nhập, thoát
        if (user) return; 
        
        const params = new URLSearchParams(location.search);
        
        let userEncoded = params.get('googleUser');
        let userSource: 'google' | 'zalo' | null = 'google';

        // 2. Kiểm tra Zalo User nếu không tìm thấy Google User
        if (!userEncoded) {
            userEncoded = params.get('zaloUser');
            userSource = userEncoded ? 'zalo' : null;
        }

        // 3. Xử lý User nếu tìm thấy tham số
        if (userEncoded && userSource) {
            try {
                const decodedJson = decodeURIComponent(userEncoded);
                const userData: AuthUser = JSON.parse(decodedJson);
                
                console.log(`SUCCESS: Processing user data via ${userSource}:`, userData.name); 

                // Gọi hàm login() để lưu user vào context và localStorage
                login(userSource, UserRole.WORKER, userData); 
                
                // 4. Dọn dẹp URL sau khi đăng nhập thành công (RẤT QUAN TRỌNG)
                navigate(location.pathname, { replace: true }); 

            } catch (error) {
                console.error(`Failed to process ${userSource} User from URL:`, error);
                navigate(location.pathname, { replace: true });
            }
        }
    }, [location.search, navigate, login, user]); 


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
                        // Hiển thị Avatar bằng biến user
                        src={user?.avatar || user?.picture || 'https://via.placeholder.com/40'} 
                        alt="User" 
                        className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <div>
                        <p className="text-xs opacity-80">Xin chào,</p>
                        {/* Hiển thị Tên người dùng bằng biến user */}
                        <p className="font-bold text-lg">{user?.name || 'Bạn'}</p>
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