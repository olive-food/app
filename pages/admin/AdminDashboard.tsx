import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navigate } from 'react-router-dom';
import { UserRole, Kitchen, User, DailyMenu } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Star, ClipboardList, Sparkles, LogOut, Plus, Home, UserPlus, Settings, UtensilsCrossed, Calendar, Image as ImageIcon, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { analyzeFeedback } from '../../services/geminiService';

type Tab = 'overview' | 'menu_mgmt' | 'kitchens' | 'accounts';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, kitchens, surveys, logout, 
    addKitchen, updateKitchen, deleteKitchen, registerManager, updateMenu, menus, addWindowToKitchen 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Forms State
  const [newKitchen, setNewKitchen] = useState({ name: '', slug: '', logoUrl: '', description: '' });
  const [editingKitchenId, setEditingKitchenId] = useState<string | null>(null);
  
  const [newManager, setNewManager] = useState({ name: '', username: '', password: '', kitchenId: '' });
  const [newWindowName, setNewWindowName] = useState('');
  
  // Delete Confirmation State
  const [deleteKitchenId, setDeleteKitchenId] = useState<string | null>(null);
  
  // Menu Update State
  const [selectedWindow, setSelectedWindow] = useState<number>(1);
  const [menuForm, setMenuForm] = useState<Partial<DailyMenu>>({
    mainDish: '', sideDish: '', veggie: '', soup: '', dessert: '', calories: 0, imageUrl: ''
  });


  // Permissions check
  if (!currentUser || (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.KITCHEN_MANAGER)) {
    return <Navigate to="/login" />;
  }

  const isSuperAdmin = currentUser.role === UserRole.ADMIN;
  const managedKitchen = kitchens.find(k => k.id === currentUser.managedKitchenId);

  // --- Helpers for Overview ---
  const relevantKitchens = isSuperAdmin ? kitchens : (managedKitchen ? [managedKitchen] : []);
  const relevantKitchenIds = relevantKitchens.map(k => k.id);
  const relevantSurveys = surveys.filter(s => relevantKitchenIds.includes(s.kitchenId));
  
  const avgHygiene = relevantSurveys.reduce((acc, s) => acc + s.hygiene, 0) / (relevantSurveys.length || 1);
  const avgQuality = relevantSurveys.reduce((acc, s) => acc + s.foodQuality, 0) / (relevantSurveys.length || 1);
  const totalReviews = relevantSurveys.length;

  const chartData = relevantKitchens.map(k => {
    const kSurveys = surveys.filter(s => s.kitchenId === k.id);
    const avg = kSurveys.reduce((acc, s) => acc + s.foodQuality, 0) / (kSurveys.length || 1);
    return { name: k.name, quality: parseFloat(avg.toFixed(1)), count: kSurveys.length };
  });

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await analyzeFeedback(relevantSurveys);
    setAiSummary(result);
    setLoadingAi(false);
  };

  // --- Handlers ---
  const handleKitchenFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newKitchen.name || !newKitchen.slug) return;

    if (editingKitchenId) {
        // Update existing
        const originalKitchen = kitchens.find(k => k.id === editingKitchenId);
        if (originalKitchen) {
            updateKitchen({
                ...originalKitchen,
                ...newKitchen
            });
            alert('Đã cập nhật thông tin bếp!');
        }
        setEditingKitchenId(null);
    } else {
        // Add new
        addKitchen({
            id: `k_${Date.now()}`,
            totalWindows: 0,
            windows: [],
            ...newKitchen
        });
        alert('Đã thêm bếp mới thành công!');
    }
    setNewKitchen({ name: '', slug: '', logoUrl: '', description: '' });
  };

  const startEditKitchen = (k: Kitchen) => {
    setNewKitchen({
        name: k.name,
        slug: k.slug,
        logoUrl: k.logoUrl,
        description: k.description || ''
    });
    setEditingKitchenId(k.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditKitchen = () => {
    setNewKitchen({ name: '', slug: '', logoUrl: '', description: '' });
    setEditingKitchenId(null);
  };

  const confirmDeleteKitchen = () => {
    if (deleteKitchenId) {
        deleteKitchen(deleteKitchenId);
        setDeleteKitchenId(null);
    }
  };

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newManager.username || !newManager.password) return;
    registerManager({
        id: `mgr_${Date.now()}`,
        role: UserRole.KITCHEN_MANAGER,
        avatar: `https://ui-avatars.com/api/?name=${newManager.name}&background=random`,
        managedKitchenId: newManager.kitchenId,
        ...newManager
    });
    setNewManager({ name: '', username: '', password: '', kitchenId: '' });
    alert('Đã tạo tài khoản quản lý thành công!');
  };

  const handleAddWindow = () => {
    if(!managedKitchen || !newWindowName) return;
    addWindowToKitchen(managedKitchen.id, newWindowName);
    setNewWindowName('');
  };

  const handleUpdateMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if(!managedKitchen) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedMenu: DailyMenu = {
        id: `m_${Date.now()}`, // Simple ID gen
        kitchenId: managedKitchen.id,
        windowNumber: selectedWindow,
        date: today,
        ratings: [],
        mainDish: menuForm.mainDish || 'Chưa cập nhật',
        sideDish: menuForm.sideDish || '',
        veggie: menuForm.veggie || '',
        soup: menuForm.soup || '',
        dessert: menuForm.dessert || '',
        calories: Number(menuForm.calories) || 0,
        imageUrl: menuForm.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'
    };
    updateMenu(updatedMenu);
    alert('Đã cập nhật thực đơn thành công!');
    setMenuForm({
        mainDish: '', sideDish: '', veggie: '', soup: '', dessert: '', calories: 0, imageUrl: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col shadow-sm z-10">
            <div className="mb-8 flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl ${isSuperAdmin ? 'bg-purple-600' : 'bg-[#FF6B00]'}`}>
                    {isSuperAdmin ? 'A' : 'M'}
                 </div>
                 <div>
                    <h1 className="font-bold text-gray-800">{isSuperAdmin ? 'Super Admin' : 'Quản Lý Bếp'}</h1>
                    <p className="text-xs text-gray-500">{managedKitchen?.name || 'Hệ thống Olive'}</p>
                 </div>
            </div>
            
            <nav className="flex-1 space-y-2">
                <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'overview' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <ClipboardList size={20} />
                    Tổng quan
                </button>

                {!isSuperAdmin && (
                    <button onClick={() => setActiveTab('menu_mgmt')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'menu_mgmt' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <UtensilsCrossed size={20} />
                        Quản lý Menu & Cửa
                    </button>
                )}

                {isSuperAdmin && (
                    <>
                        <button onClick={() => setActiveTab('kitchens')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'kitchens' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <Home size={20} />
                            Quản lý Bếp
                        </button>
                        <button onClick={() => setActiveTab('accounts')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'accounts' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <UserPlus size={20} />
                            Tài khoản Quản lý
                        </button>
                    </>
                )}
            </nav>

            <button onClick={logout} className="mt-auto flex items-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-lg transition-colors">
                <LogOut size={20} />
                Đăng xuất
            </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto relative">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="animate-fade-in space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Tổng quan hoạt động</h2>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
                                <div><p className="text-sm text-gray-500">Tổng đánh giá</p><p className="text-2xl font-bold">{totalReviews}</p></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Star size={24} /></div>
                                <div><p className="text-sm text-gray-500">Chất lượng</p><p className="text-2xl font-bold">{avgQuality.toFixed(1)}/5</p></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Sparkles size={24} /></div>
                                <div><p className="text-sm text-gray-500">Vệ sinh</p><p className="text-2xl font-bold">{avgHygiene.toFixed(1)}/5</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* AI Analysis */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700">AI Phân tích phản hồi (Gemini)</h3>
                                <button onClick={handleAiAnalysis} disabled={loadingAi} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                                    <Sparkles size={16} />{loadingAi ? 'Đang phân tích...' : 'Phân tích ngay'}
                                </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto border border-gray-100">
                                {aiSummary ? <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{aiSummary}</div> : <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center text-sm"><Sparkles size={32} className="mb-2 opacity-50" /><p>Nhấn nút để AI tổng hợp ý kiến từ {totalReviews} đánh giá.</p></div>}
                            </div>
                        </div>

                         {/* Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-4">Chất lượng món ăn theo Bếp</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} domain={[0, 5]} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="quality" fill="#FF6B00" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SUPER ADMIN: KITCHENS TAB */}
            {activeTab === 'kitchens' && isSuperAdmin && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý Bếp ăn</h2>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-[#FF6B00]">
                                {editingKitchenId ? 'Cập nhật thông tin Bếp' : 'Thêm Bếp mới'}
                            </h3>
                            {editingKitchenId && (
                                <button onClick={cancelEditKitchen} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        
                        <form onSubmit={handleKitchenFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Tên Bếp (VD: Bếp Samsung)" className="p-3 border rounded-lg" value={newKitchen.name} onChange={e => setNewKitchen({...newKitchen, name: e.target.value})} required />
                            <input type="text" placeholder="Mã Bếp - Slug (VD: ss, gt)" className="p-3 border rounded-lg" value={newKitchen.slug} onChange={e => setNewKitchen({...newKitchen, slug: e.target.value})} required />
                            <input type="text" placeholder="URL Logo" className="p-3 border rounded-lg" value={newKitchen.logoUrl} onChange={e => setNewKitchen({...newKitchen, logoUrl: e.target.value})} />
                            <input type="text" placeholder="Mô tả ngắn" className="p-3 border rounded-lg" value={newKitchen.description} onChange={e => setNewKitchen({...newKitchen, description: e.target.value})} />
                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" className="bg-[#FF6B00] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E66000] flex-1">
                                    {editingKitchenId ? 'Cập nhật Bếp' : 'Tạo Bếp'}
                                </button>
                                {editingKitchenId && (
                                    <button type="button" onClick={cancelEditKitchen} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300">
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kitchens.map(k => (
                            <div key={k.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <img src={k.logoUrl} className="w-16 h-16 rounded-lg bg-gray-100 object-cover" />
                                    <div>
                                        <h4 className="font-bold text-gray-800">{k.name}</h4>
                                        <p className="text-xs text-gray-500">Mã: {k.slug}</p>
                                        <p className="text-xs text-gray-500">{k.totalWindows} cửa - {k.windows.length} đang hoạt động</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => startEditKitchen(k)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setDeleteKitchenId(k.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa bếp"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SUPER ADMIN: ACCOUNTS TAB */}
            {activeTab === 'accounts' && isSuperAdmin && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Tài khoản Quản lý</h2>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-[#FF6B00]">Cấp tài khoản Quản lý Bếp</h3>
                        <form onSubmit={handleCreateManager} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Tên người quản lý" className="p-3 border rounded-lg" value={newManager.name} onChange={e => setNewManager({...newManager, name: e.target.value})} required />
                                <select className="p-3 border rounded-lg bg-white" value={newManager.kitchenId} onChange={e => setNewManager({...newManager, kitchenId: e.target.value})} required>
                                    <option value="">-- Chọn Bếp quản lý --</option>
                                    {kitchens.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                </select>
                                <input type="text" placeholder="Tên đăng nhập (Username)" className="p-3 border rounded-lg" value={newManager.username} onChange={e => setNewManager({...newManager, username: e.target.value})} required />
                                <input type="password" placeholder="Mật khẩu" className="p-3 border rounded-lg" value={newManager.password} onChange={e => setNewManager({...newManager, password: e.target.value})} required />
                            </div>
                            <button type="submit" className="bg-[#FF6B00] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E66000]">Tạo Tài khoản</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MANAGER: MENU MANAGEMENT */}
            {activeTab === 'menu_mgmt' && !isSuperAdmin && managedKitchen && (
                <div className="space-y-8">
                     <h2 className="text-2xl font-bold text-gray-800">Quản lý Thực đơn & Cửa</h2>

                     {/* Windows Management */}
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2"><Settings size={20}/> Danh sách Cửa (Windows)</h3>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Tổng: {managedKitchen.windows.length}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                            {managedKitchen.windows.map(w => (
                                <div key={w.id} className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 font-medium border border-gray-200">
                                    {w.name}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex gap-2 max-w-md">
                            <input 
                                type="text" 
                                placeholder="Tên cửa mới (VD: Cửa 9)" 
                                className="flex-1 p-3 border rounded-lg"
                                value={newWindowName}
                                onChange={e => setNewWindowName(e.target.value)}
                            />
                            <button onClick={handleAddWindow} className="bg-[#FF6B00] text-white px-4 rounded-lg hover:bg-[#E66000]">
                                <Plus size={20} />
                            </button>
                        </div>
                     </div>

                     {/* Menu Update Form */}
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                         <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><UtensilsCrossed size={20}/> Cập nhật Thực đơn Hôm nay</h3>
                         
                         <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Cửa áp dụng</label>
                            <div className="flex gap-2 flex-wrap">
                                {managedKitchen.windows.map(w => (
                                    <button 
                                        key={w.id}
                                        onClick={() => setSelectedWindow(w.id)}
                                        className={`px-4 py-2 rounded-lg border ${selectedWindow === w.id ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {w.name}
                                    </button>
                                ))}
                            </div>
                         </div>

                         <form onSubmit={handleUpdateMenu} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">Link Ảnh món ăn</label>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="https://..." className="flex-1 p-3 border rounded-lg" value={menuForm.imageUrl} onChange={e => setMenuForm({...menuForm, imageUrl: e.target.value})} />
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                                        {menuForm.imageUrl ? <img src={menuForm.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-400" />}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Món chính</label>
                                <input type="text" className="w-full p-3 border rounded-lg" value={menuForm.mainDish} onChange={e => setMenuForm({...menuForm, mainDish: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Món phụ</label>
                                <input type="text" className="w-full p-3 border rounded-lg" value={menuForm.sideDish} onChange={e => setMenuForm({...menuForm, sideDish: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Rau</label>
                                <input type="text" className="w-full p-3 border rounded-lg" value={menuForm.veggie} onChange={e => setMenuForm({...menuForm, veggie: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Canh</label>
                                <input type="text" className="w-full p-3 border rounded-lg" value={menuForm.soup} onChange={e => setMenuForm({...menuForm, soup: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Tráng miệng</label>
                                <input type="text" className="w-full p-3 border rounded-lg" value={menuForm.dessert} onChange={e => setMenuForm({...menuForm, dessert: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Calories (Kcal)</label>
                                <input type="number" className="w-full p-3 border rounded-lg" value={menuForm.calories} onChange={e => setMenuForm({...menuForm, calories: Number(e.target.value)})} />
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button type="submit" className="w-full bg-[#FF6B00] text-white py-3 rounded-xl font-bold hover:bg-[#E66000] transition-colors">
                                    Cập nhật Menu
                                </button>
                            </div>
                         </form>
                     </div>
                </div>
            )}
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {deleteKitchenId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa bếp</h3>
                        <p className="text-gray-500 mb-6">
                            Bạn có chắc chắn muốn xóa bếp này không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setDeleteKitchenId(null)}
                                className="flex-1 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={confirmDeleteKitchen}
                                className="flex-1 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                            >
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};