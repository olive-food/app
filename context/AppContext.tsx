import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Kitchen, DailyMenu, SurveyResponse, UserRole } from '../types';
import { MOCK_KITCHENS, MOCK_USERS, INITIAL_MENUS, INITIAL_SURVEYS } from '../constants';

interface AppContextType {
  currentUser: User | null;
  login: (provider: 'zalo' | 'google', role?: UserRole) => void;
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
  
  // Admin Features
  addKitchen: (kitchen: Kitchen) => void;
  updateKitchen: (kitchen: Kitchen) => void;
  deleteKitchen: (id: string) => void;
  registerManager: (user: User) => void;
  // Manager Features
  addWindowToKitchen: (kitchenId: string, windowName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [kitchens, setKitchens] = useState<Kitchen[]>(MOCK_KITCHENS);
  const [menus, setMenus] = useState<DailyMenu[]>(INITIAL_MENUS);
  const [surveys, setSurveys] = useState<SurveyResponse[]>(INITIAL_SURVEYS);

  // Load user from session storage for persistence on refresh
  useEffect(() => {
    const storedUser = sessionStorage.getItem('olive_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (provider: 'zalo' | 'google', role: UserRole = UserRole.WORKER) => {
    // Quick login for workers
    const user: User = {
        id: `worker_${Date.now()}`,
        name: `Công nhân (${provider === 'zalo' ? 'Zalo' : 'Google'})`,
        avatar: `https://ui-avatars.com/api/?name=Worker&background=random`,
        role: UserRole.WORKER
    };
    setCurrentUser(user);
    sessionStorage.setItem('olive_user', JSON.stringify(user));
  };

  const loginWithCredentials = (username: string, pass: string): boolean => {
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
        setCurrentUser(user);
        sessionStorage.setItem('olive_user', JSON.stringify(user));
        return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('olive_user');
  };

  const addMenu = (newMenu: DailyMenu) => {
    setMenus(prev => [...prev.filter(m => m.id !== newMenu.id), newMenu]);
  };

  const updateMenu = (updatedMenu: DailyMenu) => {
    setMenus(prev => {
        // Remove existing menu for the same date/window/kitchen if it exists to replace it
        const filtered = prev.filter(m => 
            !(m.kitchenId === updatedMenu.kitchenId && 
              m.windowNumber === updatedMenu.windowNumber && 
              m.date === updatedMenu.date) &&
            m.id !== updatedMenu.id
        );
        return [...filtered, updatedMenu];
    });
  };

  const addRating = (menuId: string, stars: number) => {
    if (!currentUser) return;
    setMenus(prev => prev.map(menu => {
      if (menu.id === menuId) {
        return {
          ...menu,
          ratings: [...menu.ratings, { userId: currentUser.id, stars, timestamp: Date.now() }]
        };
      }
      return menu;
    }));
  };

  const addSurvey = (surveyData: Omit<SurveyResponse, 'id' | 'userId' | 'date'>) => {
    if (!currentUser) return;
    const newSurvey: SurveyResponse = {
      id: `sur_${Date.now()}`,
      userId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      ...surveyData
    };
    setSurveys(prev => [...prev, newSurvey]);
    console.log("SYNC: Data sent to Google Sheet Webhook", newSurvey);
  };

  const getKitchenBySlug = (slug: string) => {
    return kitchens.find(k => k.slug === slug);
  };

  // --- Admin Functions ---
  const addKitchen = (newKitchen: Kitchen) => {
    setKitchens(prev => [...prev, newKitchen]);
  };

  const updateKitchen = (updatedKitchen: Kitchen) => {
    setKitchens(prev => prev.map(k => k.id === updatedKitchen.id ? updatedKitchen : k));
  };

  const deleteKitchen = (id: string) => {
    setKitchens(prev => prev.filter(k => k.id !== id));
  };

  const registerManager = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const addWindowToKitchen = (kitchenId: string, windowName: string) => {
    setKitchens(prev => prev.map(k => {
        if (k.id === kitchenId) {
            const nextId = k.windows.length > 0 ? Math.max(...k.windows.map(w => w.id)) + 1 : 1;
            return {
                ...k,
                totalWindows: k.windows.length + 1,
                windows: [...k.windows, { id: nextId, name: windowName }]
            };
        }
        return k;
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
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
      addWindowToKitchen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};