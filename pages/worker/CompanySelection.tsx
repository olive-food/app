import React, { useState, useEffect, useRef } from 'react'; // 👈 Thêm useRef
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext'; 
import { UserRole } from '../../types'; // Cần thêm để sử dụng UserRole.WORKER
import { Search, AlertCircle } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho user lấy từ Google URL
interface GoogleUser {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
}

export const CompanySelection: React.FC = () => {
// Lấy biến 'user' và hàm 'login' trực tiếp từ AppContext
const { kitchens, user, login } = useApp();
    
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // 🌟 Dùng useRef để đảm bảo logic chỉ chạy 1 lần duy nhất
    const hasProcessedGoogleUser = useRef(false);

    // 🌟 LOGIC CHÍNH: Xử lý đăng nhập Google
    useEffect(() => {
        // Kiểm tra để tránh chạy logic nhiều lần không cần thiết
        if (currentUser) return; // Nếu user đã có trong Context, bỏ qua
        if (hasProcessedGoogleUser.current) return; // Nếu đã xử lý lần trước, bỏ qua
        
        const params = new URLSearchParams(location.search);
        const googleUserEncoded = params.get('googleUser');

        if (googleUserEncoded) {
            hasProcessedGoogleUser.current = true; // Đánh dấu đã xử lý
            
            try {
                // 1. Giải mã và phân tích cú pháp JSON
                const decodedJson = decodeURIComponent(googleUserEncoded);
                const userData: GoogleUser = JSON.parse(decodedJson);
                
                // 2. Gọi hàm login để cập nhật State và Local Storage
                // Chúng ta gán role WORKER cho user Google (Dùng hằng số UserRole.WORKER)
                login('google', UserRole.WORKER, userData); 
                
                // 3. Dọn dẹp URL: Xóa tham số googleUser khỏi URL 
                // Quan trọng: Chỉ xóa tham số, không chuyển hướng sang trang khác
                navigate(location.pathname, { replace: true }); 

            } catch (error) {
                console.error("Lỗi parse thông tin người dùng từ URL:", error);
                // Dọn dẹp URL ngay cả khi lỗi
                navigate(location.pathname, { replace: true });
            }
        }
    }, [location.search, navigate, login, currentUser]); 


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const kitchen = kitchens.find(k => k.slug.toLowerCase() === code.toLowerCase());
        if (kitchen) {
            // Khi tìm thấy bếp, user đã được lưu vào Context, chuyển user vào bếp
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
                        // Hiển thị thông tin user đã được lưu trong Context
                        src={user?.avatar || user?.picture || 'https://via.placeholder.com/40'} 
                        alt="User" 
                        className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <div>
                        <p className="text-xs opacity-80">Xin chào,</p>
                        <p className="font-bold text-lg">{user?.name || 'Bạn'}</p>
                    </div>
                </div>
                <h1 className="text-2xl font-bold mt-4">Truy cập Bếp ăn</h1>
                <p className="text-sm opacity-90">Vui lòng nhập mã bếp hoặc truy cập link do công ty cung cấp.</p>
            </div>

            {/* Access Form: Giữ nguyên logic hiển thị form */}
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