import React from 'react';

// ----------------------------------------------------
// 🌟 CẤU HÌNH BIẾN MÔI TRƯỜNG VÀ URL
// ----------------------------------------------------
// NÊN SỬ DỤNG process.env TRONG MÔI TRƯỜNG PRODUCTION
// Tạm dùng hằng số ZALO_APP_ID mà anh cung cấp
const ZALO_APP_ID = "3001013554755266868"; 

const BASE_URL = 
    process.env.VERCEL_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://app.olive.com.vn';

// Redirect URI cho Google và Zalo
const GOOGLE_AUTH_URL = `${BASE_URL}/api/auth/google/login`;
const ZALO_REDIRECT_URI = `${BASE_URL}/api/auth/zalo/callback`;
// ----------------------------------------------------


// Xử lý chuyển hướng cho Google Login
const handleGoogleLogin = () => {
    // Chuyển hướng đến Serverless Function của Google
    window.location.href = GOOGLE_AUTH_URL;
};

// Xử lý chuyển hướng cho Zalo Login
const handleZaloLogin = () => {
    // Mã state để ngăn chặn tấn công CSRF (nên lưu vào session storage nếu cần kiểm tra)
    const state = Math.random().toString(36).substring(2); 

    // URL Zalo OAuth v4
    const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${ZALO_APP_ID}&redirect_uri=${encodeURIComponent(ZALO_REDIRECT_URI)}&state=${state}`;

    // Chuyển hướng người dùng đến Zalo
    window.location.href = zaloAuthUrl;
};


export const LoginPage: React.FC = () => {

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold text-center text-[#FF6B00] mb-2">Olive CS App</h1>
                <p className="text-center text-gray-600 mb-8">Đăng nhập để tiếp tục</p>

                {/* Nút Đăng nhập bằng Zalo */}
                <button 
                    onClick={handleZaloLogin}
                    className="w-full flex items-center justify-center gap-2 bg-[#0070FF] text-white py-3 rounded-xl font-semibold hover:bg-[#005AD8] transition-colors mb-4"
                >
                    {/* Anh cần có icon Zalo.png trong thư mục public/ */}
                    <img src="/zalo-icon.png" alt="Zalo" className="w-6 h-6" /> 
                    Đăng nhập bằng Zalo
                </button>

                {/* Nút Đăng nhập bằng Google */}
                <button 
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                    {/* Anh cần có icon google.png trong thư mục public/ */}
                    <img src="/google-icon.png" alt="Google" className="w-6 h-6" /> 
                    Đăng nhập bằng Google
                </button>
                
                {/* Có thể thêm tùy chọn đăng nhập bằng mật khẩu nếu cần */}

            </div>
        </div>
    );
};