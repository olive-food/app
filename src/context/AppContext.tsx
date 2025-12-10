import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserRole } from "../types";

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  email?: string | null;
  provider?: "zalo" | "google";
}

interface AppContextType {
  currentUser: User | null;
  login: (
    provider: "zalo" | "google",
    role?: UserRole,
    profile?: { id?: string; name?: string; email?: string; picture?: string }
  ) => void;
  logout: () => void;
  loginWithCredentials: (username: string, password: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load lại user từ sessionStorage khi mở app
  useEffect(() => {
    const savedUser = sessionStorage.getItem("olive_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Hàm login chung cho Google & Zalo
  const login = (
    provider: "zalo" | "google",
    role: UserRole = UserRole.WORKER,
    profile?: { id?: string; name?: string; email?: string; picture?: string }
  ) => {
    const user: User = {
      id: profile?.id ?? `worker_${Date.now()}`,
      name:
        profile?.name ??
        `Công nhân (${provider === "zalo" ? "Zalo" : "Google"})`,
      avatar:
        profile?.picture ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profile?.name || "Worker"
        )}&background=random`,
      role,
      email: profile?.email ?? null,
      provider,
    };

    setCurrentUser(user);
    sessionStorage.setItem("olive_user", JSON.stringify(user));
  };

  const loginWithCredentials = (username: string, password: string): boolean => {
    if (username === "admin" && password === "123456") {
      const adminUser: User = {
        id: "admin_1",
        name: "Quản trị viên",
        avatar: "https://ui-avatars.com/api/?name=Admin&background=ff6b00",
        role: UserRole.ADMIN,
      };
      setCurrentUser(adminUser);
      sessionStorage.setItem("olive_user", JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("olive_user");
  };

  return (
    <AppContext.Provider value={{ currentUser, login, logout, loginWithCredentials }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
};
