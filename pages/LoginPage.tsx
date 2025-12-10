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

  // ⬇ xử lý callback Google
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleLogin = params.get("googleLogin");

    if (googleLogin === "1") {
      console.log("Google login callback OK");

      login("google", UserRole.WORKER);

      // Điều hướng vào trang công nhân
      navigate("/cs", { replace: true });
    }
  }, [location.search]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google/login";
  };

  const handleWorkerLogin = (provider: "zalo" | "google") => {
    login(provider, UserRole.WORKER);
    navigate("/cs", { replace: true });
  };

  const handleManagementLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginWithCredentials(username, password);
    if (success) navigate("/admin");
    else setError("Sai tên đăng nhập hoặc mật khẩu");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">

        {/* Logo */}
        <img
          src="https://cdn0685.cdn4s.com/media/logo/logo.png"
          className="h-20 mx-auto mb-4"
        />

        <h1 className="text-2xl font-bold mb-2">Olive Food & Services</h1>
        <p className="text-gray-500 mb-6">
          Hệ thống quản lý suất ăn công nghiệp
        </p>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab("worker")}
            className={`flex-1 py-2 rounded-md ${
              activeTab === "worker"
                ? "bg-white text-gray-800 shadow"
                : "text-gray-500"
            }`}
          >
            Khách hàng
          </button>

          <button
            onClick={() => setActiveTab("management")}
            className={`flex-1 py-2 rounded-md ${
              activeTab === "management"
                ? "bg-white text-gray-800 shadow"
                : "text-gray-500"
            }`}
          >
            Quản lý / Admin
          </button>
        </div>

        {activeTab === "worker" ? (
          <div className="space-y-4">

            <p className="text-sm text-gray-400 uppercase">Đăng nhập nhanh</p>

            <button
              onClick={() => handleWorkerLogin("zalo")}
              className="w-full bg-blue-500 text-white py-3 rounded-xl"
            >
              Z Đăng nhập bằng Zalo
            </button>

            <button
              onClick={handleGoogleLogin}
              className="w-full border py-3 rounded-xl"
            >
              Đăng nhập bằng Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleManagementLogin} className="space-y-4">

            <div className="text-left">
              <label className="text-sm">Username</label>
              <input
                className="w-full border rounded-xl p-3"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="text-left">
              <label className="text-sm">Mật khẩu</label>
              <input
                type="password"
                className="w-full border rounded-xl p-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-xl"
            >
              Đăng nhập
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
