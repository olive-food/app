import React, { createContext, useContext, useState } from 'react';
import { User, Kitchen, DailyMenu, SurveyResponse, UserRole } from '../types';
import { MOCK_KITCHENS, MOCK_USERS, INITIAL_MENUS, INITIAL_SURVEYS } from '../constants';

type OAuthProfile = {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
};

interface AppContextType {
  currentUser: User | null;
  user: User | null;

  login: (provider: 'zalo' | 'google', role?: UserRole, profile?: OAuthProfile) => void;
  loginWithCredentials: (username: string, pass: string) => boolean;
  logout: () => void;

  kitchens: Kitchen[];
  menus: DailyMenu[];
  surveys: SurveyResponse[];

  addMenu: (menu: DailyMenu) => void;
  updateMenu: (menu: DailyMenu) => void;
  addRating: (menuId: string, rating: number) => void;
  addSurvey: (survey: Omit<SurveyResponse, 'id' | 'userId' | 'date'>) => void;
  getKitchenBySlug: (slug: string) => Kitchen | undefined;

  addKitchen: (kitchen: Kitchen) => void;
  updateKitchen: (kitchen: Kitchen) => void;
  deleteKitchen: (id: string) => void;
  registerManager: (user: User) => void;

  addWindowToKitchen: (kitchenId: string, windowName: string) => void;
}

const STORAGE_KEY = 'olive_user';

const AppContext = createContext<AppContextType | undefined>(undefined);

// ✅ NẠP USER NGAY LÚC KHỞI TẠO (không đợi useEffect)
function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadUserFromStorage());

  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [kitchens, setKitchens] = useState<Kitchen[]>(MOCK_KITCHENS);
  const [menus, setMenus] = useState<DailyMenu[]>(INITIAL_MENUS);
  const [surveys, setSurveys] = useState<SurveyResponse[]>(INITIAL_SURVEYS);

  const persistUser = (user: User | null) => {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  };

  const login = (provider: 'zalo' | 'google', role: UserRole = UserRole.WORKER, profile?: OAuthProfile) => {
    const displayName =
      profile?.name?.trim() ||
      `Khách hàng (${provider === 'zalo' ? 'Zalo' : 'Google'})`;

    const avatar =
      profile?.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF6B00&color=fff`;

    const newUser: User = {
      id: profile?.id ? `${provider}_${profile.id}` : `worker_${Date.now()}`,
      name: displayName,
      avatar,
      role,
    };

    setCurrentUser(newUser);
    persistUser(newUser);
  };

  const loginWithCredentials = (username: string, pass: string): boolean => {
    const user = users.find((u) => u.username === username && u.password === pass);
    if (user) {
      setCurrentUser(user);
      persistUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    persistUser(null);
  };

  const addMenu = (newMenu: DailyMenu) => {
    setMenus((prev) => [...prev.filter((m) => m.id !== newMenu.id), newMenu]);
  };

  const updateMenu = (updatedMenu: DailyMenu) => {
    setMenus((prev) => {
      const filtered = prev.filter(
        (m) =>
          !(
            m.kitchenId === updatedMenu.kitchenId &&
            m.windowNumber === updatedMenu.windowNumber &&
            m.date === updatedMenu.date
          ) && m.id !== updatedMenu.id
      );
      return [...filtered, updatedMenu];
    });
  };

  const addRating = (menuId: string, stars: number) => {
    if (!currentUser) return;
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              ratings: [...menu.ratings, { userId: currentUser.id, stars, timestamp: Date.now() }],
            }
          : menu
      )
    );
  };

  const addSurvey = (surveyData: Omit<SurveyResponse, 'id' | 'userId' | 'date'>) => {
    if (!currentUser) return;
    const newSurvey: SurveyResponse = {
      id: `sur_${Date.now()}`,
      userId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      ...surveyData,
    };
    setSurveys((prev) => [...prev, newSurvey]);
    console.log('SYNC: Data sent to Google Sheet Webhook', newSurvey);
  };

  const getKitchenBySlug = (slug: string) => kitchens.find((k) => k.slug === slug);

  const addKitchen = (newKitchen: Kitchen) => setKitchens((prev) => [...prev, newKitchen]);
  const updateKitchen = (updatedKitchen: Kitchen) =>
    setKitchens((prev) => prev.map((k) => (k.id === updatedKitchen.id ? updatedKitchen : k)));
  const deleteKitchen = (id: string) => setKitchens((prev) => prev.filter((k) => k.id !== id));
  const registerManager = (newUser: User) => setUsers((prev) => [...prev, newUser]);

  const addWindowToKitchen = (kitchenId: string, windowName: string) => {
    setKitchens((prev) =>
      prev.map((k) => {
        if (k.id === kitchenId) {
          const nextId = k.windows.length > 0 ? Math.max(...k.windows.map((w) => w.id)) + 1 : 1;
          return {
            ...k,
            totalWindows: k.windows.length + 1,
            windows: [...k.windows, { id: nextId, name: windowName }],
          };
        }
        return k;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        user: currentUser,
        login,
        loginWithCredentials,
        logout,
        kitchens,
        menus,
        surveys,
        addMenu,
        updateMenu,
        addRating,
        addSurvey,
        getKitchenBySlug,
        addKitchen,
        updateKitchen,
        deleteKitchen,
        registerManager,
        addWindowToKitchen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
