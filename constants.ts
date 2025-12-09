import { Kitchen, UserRole, User, DailyMenu, SurveyResponse } from './types';

export const MOCK_KITCHENS: Kitchen[] = [
  {
    id: 'k1',
    name: 'Bếp Samsung',
    slug: 'ss',
    logoUrl: 'https://picsum.photos/100/100?random=1',
    description: 'Bếp ăn tiêu chuẩn quốc tế phục vụ 24/7.',
    totalWindows: 8,
    windows: Array.from({length: 8}, (_, i) => ({ id: i + 1, name: `Cửa ${i + 1}` }))
  },
  {
    id: 'k2',
    name: 'Bếp Goertek',
    slug: 'gt',
    logoUrl: 'https://picsum.photos/100/100?random=2',
    description: 'Chuyên phục vụ các món ăn truyền thống và Á Âu.',
    totalWindows: 4,
    windows: Array.from({length: 4}, (_, i) => ({ id: i + 1, name: `Cửa ${i + 1}` }))
  },
  {
    id: 'k3',
    name: 'Bếp TP.Link',
    slug: 'tplink',
    logoUrl: 'https://picsum.photos/100/100?random=3',
    description: 'Bếp ăn đảm bảo vệ sinh an toàn thực phẩm.',
    totalWindows: 2,
    windows: Array.from({length: 2}, (_, i) => ({ id: i + 1, name: `Cửa ${i + 1}` }))
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin_global',
    name: 'Super Admin',
    username: 'admin',
    password: 'admin', // Default password as requested
    avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff',
    role: UserRole.ADMIN
  },
  {
    id: 'mgr_samsung',
    name: 'Quản Lý Samsung',
    username: 'manager_ss',
    password: '123',
    avatar: 'https://ui-avatars.com/api/?name=Manager+SS&background=random',
    role: UserRole.KITCHEN_MANAGER,
    managedKitchenId: 'k1'
  },
  {
    id: 'mgr_goertek',
    name: 'Quản Lý Goertek',
    username: 'manager_gt',
    password: '123',
    avatar: 'https://ui-avatars.com/api/?name=Manager+GT&background=random',
    role: UserRole.KITCHEN_MANAGER,
    managedKitchenId: 'k2'
  }
];

export const INITIAL_MENUS: DailyMenu[] = [
  {
    id: 'm1',
    kitchenId: 'k1',
    windowNumber: 1,
    date: new Date().toISOString().split('T')[0],
    mainDish: 'Gà kho sả ớt',
    sideDish: 'Đậu phụ sốt cà',
    veggie: 'Cải thìa xào tỏi',
    soup: 'Canh bí xanh tôm',
    dessert: 'Chuối',
    calories: 650,
    imageUrl: 'https://picsum.photos/400/300?random=10',
    ratings: []
  },
  {
    id: 'm2',
    kitchenId: 'k1',
    windowNumber: 2,
    date: new Date().toISOString().split('T')[0],
    mainDish: 'Thịt kho tàu',
    sideDish: 'Trứng chiên',
    veggie: 'Rau muống luộc',
    soup: 'Canh chua cá',
    dessert: 'Dưa hấu',
    calories: 700,
    imageUrl: 'https://picsum.photos/400/300?random=11',
    ratings: []
  },
   {
    id: 'm3',
    kitchenId: 'k2',
    windowNumber: 1,
    date: new Date().toISOString().split('T')[0],
    mainDish: 'Cá thu rim',
    sideDish: 'Lạc rang muối',
    veggie: 'Su su luộc',
    soup: 'Canh rau ngót',
    dessert: 'Sữa chua',
    calories: 600,
    imageUrl: 'https://picsum.photos/400/300?random=12',
    ratings: []
  }
];

export const INITIAL_SURVEYS: SurveyResponse[] = [
  {
    id: 's1',
    userId: 'u1',
    kitchenId: 'k1',
    date: new Date().toISOString().split('T')[0],
    foodQuality: 4,
    portionSize: 5,
    hygiene: 4,
    staffAttitude: 5,
    comment: 'Đồ ăn ngon, phục vụ nhanh.'
  },
  {
    id: 's2',
    userId: 'u2',
    kitchenId: 'k1',
    date: new Date().toISOString().split('T')[0],
    foodQuality: 2,
    portionSize: 3,
    hygiene: 3,
    staffAttitude: 4,
    comment: 'Món gà hơi mặn, cần điều chỉnh lại.'
  }
];