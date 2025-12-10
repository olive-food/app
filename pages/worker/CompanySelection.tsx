import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext'; // Đã có sẵn
import { UserRole } from '../../types'; // Cần thêm để sử dụng UserRole.WORKER
import { Search, AlertCircle } from 'lucide-react';

// Định nghĩa kiểu dữ liệu (đã có trong AppContext, nhưng cần định nghĩa lại cho rõ ràng)
interface GoogleUser {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
}

export const CompanySelection: React.FC = () => {
    // 🌟 THAY ĐỔI: Lấy hàm login từ AppContext
    const { kitchens, user: currentUser, login } = useApp(); 
    
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // 🌟 LOGIC CHÍNH: Xử lý đăng nhập Google
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const googleUserEncoded = params.get('googleUser');

        if (googleUserEncoded) {
            try {
                // 1. Giải mã và phân tích cú pháp JSON
                const decodedJson = decodeURIComponent(googleUserEncoded);
                const userData: GoogleUser = JSON.parse(decodedJson);
                
                // 2. Gọi hàm login để cập nhật State và Local Storage
                // Chúng ta gán role WORKER cho user Google
                login('google', UserRole.WORKER, userData); 
                
                // 3. Dọn dẹp URL: Xóa tham số googleUser khỏi URL 
                // Điều này giúp trang sạch đẹp và ngăn lỗi nếu người dùng refresh
                // Lệnh này không reload trang, chỉ thay đổi lịch sử trình duyệt.
                navigate(location.pathname, { replace: true }); 

            } catch (error) {
                console.error("Lỗi parse thông tin người dùng từ URL:", error);
                // Dọn dẹp URL ngay cả khi lỗi để tránh lặp lại lỗi
                navigate(location.pathname, { replace: true });
            }
        }
    }, [location.search, navigate, login]); // dependencies: chạy lại khi URL, navigate, hoặc login thay đổi


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
                        // Bây giờ currentUser (là user: AppUser | null) sẽ có thông tin
                        src={currentUser?.avatar || currentUser?.picture || 'https://via.placeholder.com/40'} 
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

            {/* Access Form ... (phần còn lại giữ nguyên) */}
            <div className="px-4 w-full max-w-md mx-auto flex-1 flex flex-col items-center">
                <div className="bg-white p-6 rounded-2xl shadow-sm w-full">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* ... */}
                    </form>
                </div>
                <div className="mt-8 text-center text-gray-400 text-sm">
                    <p>Hệ thống suất ăn công nghiệp Olive Food & Services</p>
                </div>
            </div>
        </div>
    );
};