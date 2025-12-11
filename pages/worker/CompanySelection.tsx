import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext'; 
import { UserRole } from '../../types'; // Rất quan trọng
import { Search, AlertCircle } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho user lấy từ Google URL
interface GoogleUser {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
}

export const CompanySelection: React.FC = () => {
    // 🌟 ĐÚNG: Lấy biến 'user' từ Context
    const { kitchens, user, login } = useApp();
    
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // Dùng useRef để đảm bảo logic xử lý Google User chỉ chạy 1 lần duy nhất
    const hasProcessedGoogleUser = useRef(false);

    // LOGIC CHÍNH: Xử lý đăng nhập Google từ tham số URL
    useEffect(() => {
        // 1. Kiểm tra: Nếu user đã đăng nhập, hoặc đã xử lý rồi thì thoát
        if (user) return; 
        if (hasProcessedGoogleUser.current) return; 
        
        const params = new URLSearchParams(location.search);
        const googleUserEncoded = params.get('googleUser');

        if (googleUserEncoded) {
            hasProcessedGoogleUser.current = true; 
            
            try {
                const decodedJson = decodeURIComponent(googleUserEncoded);
                const userData: GoogleUser = JSON.parse(decodedJson);
                
                // Ghi log để kiểm tra (Anh có thể kiểm tra Console của trình duyệt)
                console.log("Frontend SUCCESS: Processing user data for:", userData.name); 

                login('google', UserRole.WORKER, userData); 
                
                // Dọn dẹp URL: Xóa tham số googleUser khỏi URL (quan trọng)
                navigate(location.pathname, { replace: true }); 

            } catch (error) {
                console.error("Failed to process Google User from URL:", error);
                // Dọn dẹp URL ngay cả khi lỗi
                navigate(location.pathname, { replace: true });
            }
        }
    // 🌟 ĐÚNG: Dependency array chỉ sử dụng biến 'user'
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
                        // 🌟 ĐÚNG: Hiển thị Avatar bằng biến user
                        src={user?.avatar || user?.picture || 'https://via.placeholder.com/40'} 
                        alt="User" 
                        className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <div>
                        <p className="text-xs opacity-80">Xin chào,</p>
                        {/* 🌟 ĐÚNG: Hiển thị Tên người dùng bằng biến user */}
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