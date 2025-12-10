import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";

export const LoginPage: React.FC = () => {
  const { login, loginWithCredentials } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<"worker" | "management">("worker");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Nhận googleUser từ URL sau khi Google redirect về
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleUserParam = params.get("googleUser");

    if (!googleUserParam) return;

    try {
      // URLSearchParams đã decode 1 lần, nên ở đây parse thẳng cũng được
      const profile = JSON.parse(
        decodeURIComponent(googleUserParam)
      );

      // Lưu user thật vào context
      login("google", UserRole.WORKER, {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      });

      // Chuyển sang màn chọn bếp
      navigate("/cs", { replace: true });
    } catch (e) {
      console.error("Lỗi xử lý googleUser:", e);
    }
  }, [location.search, login, navigate]);

  // ✅ Bắt đầu flow Google OAuth
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google/login";
  };

  // Đăng nhập nhanh giả lập cho Zalo
  const handleWorkerLogin = (provider: "zalo" | "google") => {
    login(provider, UserRole.WORKER);
    navigate("/cs", { replace: true });
  };

  const handleManagementLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginWithCredentials(username, password);
    if (ok) navigate("/admin");
    else setError("Sai tên đăng nhập hoặc mật khẩu");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <img
          src="https://cdn0685.cdn4s.com/media/logo/logo.png"
          className="h-20 mx-auto mb-4"
          alt="Olive logo"
        />

        <h1 className="text-2xl font-bold mb-2">Olive Food & Services</h1>
        <p className="text-gray-500 mb-6">Hệ thống quản lý suất ăn công nghiệp</p>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab("worker")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "worker"
                ? "bg-white shadow text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Khách hàng
          </button>

          <button
            onClick={() => setActiveTab("management")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "management"
                ? "bg-white shadow text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Quản lý / Admin
          </button>
        </div>

        {/* WORKER LOGIN */}
        {activeTab === "worker" ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 uppercase mb-2">Đăng nhập nhanh</p>

            {/* Zalo (fake) */}
            <button
              onClick={() => handleWorkerLogin("zalo")}
              className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              <div className="font-bold text-xl">Z</div>
              <span>Đăng nhập bằng Zalo</span>
            </button>

            {/* Google thật */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center rounded-xl border border-gray-300 py-3 text-gray-700 hover:bg-gray-50 transition"
            >
              Đăng nhập bằng Google
            </button>
          </div>
        ) : (
          // MANAGEMENT LOGIN
          <form onSubmit={handleManagementLogin} className="space-y-4">
            <p className="text-sm text-gray-400 uppercase mb-2">
              Đăng nhập hệ thống
            </p>

            <div className="text-left">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#FF6B00] hover:bg-[#E66000] text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Đăng nhập
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
