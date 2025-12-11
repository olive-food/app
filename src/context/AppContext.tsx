import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { UserRole } from '../types';

type LoginProvider = 'google' | 'zalo' | 'manual';

export interface AppUser {
  id?: string;
  name: string;
  email?: string;
  avatar?: string;
  provider: LoginProvider;
  role: UserRole;
}

interface AppContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (
    provider: LoginProvider,
    role?: UserRole,
    profile?: {
      id?: string;
      email?: string;
      name?: string;
      picture?: string;
    }
  ) => void;
  loginWithCredentials: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'olive_user';

function loadUserFromStorage(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch (e) {
    console.error('Failed to read user from localStorage', e);
    return null;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user khi mở app / refresh
  useEffect(() => {
    const stored = loadUserFromStorage();
    if (stored) {
      setUser(stored);
      setIsAuthenticated(true);
    }
  }, []);

  // Hàm login chung cho Google / Zalo / manual
  const login = (
    provider: LoginProvider,
    role: UserRole = UserRole.WORKER,
    profile?: { id?: string; email?: string; name?: string; picture?: string }
  ) => {
    const newUser: AppUser = {
      id: profile?.id,
      email: profile?.email,
      name: profile?.name || 'Công nhân',
      avatar: profile?.picture,
      provider,
      role,
    };

    setUser(newUser);
    setIsAuthenticated(true);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    }
  };

  // Đăng nhập quản lý bằng username/password (demo)
  const loginWithCredentials = (username: string, password: string): boolean => {
    // Anh có thể thay bằng API thực tế sau này
    const ok = username === 'admin' && password === 'olive123';
    if (ok) {
      const adminUser: AppUser = {
        id: 'admin',
        name: 'Admin Olive',
        provider: 'manual',
        role: UserRole.ADMIN,
      };
      setUser(adminUser);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
      }
    }
    return ok;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
};
