export enum UserRole {
  ADMIN = 'ADMIN',
  KITCHEN_MANAGER = 'KITCHEN_MANAGER',
  WORKER = 'WORKER'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  username?: string; // For login
  password?: string; // For login (simulation)
  managedKitchenId?: string; // For managers
  company?: string; // For workers
}

export interface Kitchen {
  id: string;
  name: string;
  slug: string; // e.g., 'ss', 'gt'
  logoUrl: string;
  description?: string;
  totalWindows: number; // Number of serving windows
  windows: KitchenWindow[]; // Dynamic list of windows
}

export interface KitchenWindow {
  id: number;
  name: string; // e.g. "Cửa 1", "Cửa VIP"
}

export interface MenuDish {
  name: string;
  type: 'main' | 'side' | 'veggie' | 'soup' | 'dessert';
}

export interface DailyMenu {
  id: string;
  kitchenId: string;
  windowNumber: number; // Which window (Cửa) serves this
  date: string; // ISO string YYYY-MM-DD
  mainDish: string;
  sideDish: string;
  veggie: string;
  soup: string;
  dessert: string;
  calories: number;
  imageUrl: string;
  ratings: DishRating[];
}

export interface DishRating {
  userId: string;
  stars: number; // 1-5
  timestamp: number;
}

export interface SurveyResponse {
  id: string;
  userId: string;
  kitchenId: string;
  date: string;
  foodQuality: number; // 1-5
  portionSize: number; // 1-5
  hygiene: number; // 1-5
  staffAttitude: number; // 1-5
  comment: string;
}