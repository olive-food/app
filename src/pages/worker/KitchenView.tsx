import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Utensils, Flame, Leaf, IceCream, Info } from 'lucide-react';
import { RatingStars } from '../../components/RatingStars';
import { SurveyModal } from '../../components/SurveyModal';
import { Link } from 'react-router-dom';

export const KitchenView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getKitchenBySlug, menus, addRating } = useApp();
  const [activeWindow, setActiveWindow] = useState(1);
  const [showSurvey, setShowSurvey] = useState(false);

  const kitchen = getKitchenBySlug(slug || '');

  if (!kitchen) {
    return <Navigate to="/cs" />;
  }

  // Get menu for today for the active window
  const today = new Date().toISOString().split('T')[0];
  const currentMenu = menus.find(
    m => m.kitchenId === kitchen.id && m.windowNumber === activeWindow && m.date === today
  );

  // Calculate average rating
  const getAverageRating = (ratings: {stars: number}[]) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.stars, 0);
    return sum / ratings.length;
  };

  const currentRating = currentMenu ? getAverageRating(currentMenu.ratings) : 0;

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center p-4">
            <Link to="/cs" className="p-2 -ml-2 text-gray-600">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="flex-1 text-center font-bold text-lg text-gray-800">{kitchen.name}</h1>
            <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Window Selector */}
        <div className="overflow-x-auto pb-2 px-4 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
                {kitchen.windows.map((win) => (
                    <button
                        key={win.id}
                        onClick={() => setActiveWindow(win.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activeWindow === win.id 
                            ? 'bg-[#FF6B00] text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {win.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="p-4 pb-24 max-w-2xl mx-auto">
        {currentMenu ? (
            <div className="space-y-6">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
                    <img 
                        src={currentMenu.imageUrl} 
                        alt={currentMenu.mainDish} 
                        className="w-full h-56 object-cover"
                    />
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">{currentMenu.mainDish}</h2>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500 mb-1">Đánh giá món</span>
                                <RatingStars 
                                    currentRating={Math.round(currentRating)} 
                                    onRate={(r) => addRating(currentMenu.id, r)}
                                    size={24}
                                />
                                <span className="text-xs text-gray-400 mt-1">{currentMenu.ratings.length} lượt</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-orange-500 font-medium text-sm mt-2">
                            <Flame size={16} />
                            <span>{currentMenu.calories} Kcal</span>
                        </div>
                    </div>
                </div>

                {/* Details List */}
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                    <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wide mb-4">Chi tiết suất ăn</h3>
                    
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Utensils size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Món phụ</p>
                            <p className="font-medium text-gray-800">{currentMenu.sideDish}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Leaf size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Rau / Canh</p>
                            <p className="font-medium text-gray-800">{currentMenu.veggie} & {currentMenu.soup}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                            <IceCream size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Tráng miệng</p>
                            <p className="font-medium text-gray-800">{currentMenu.dessert}</p>
                        </div>
                    </div>
                </div>

                 <button 
                    onClick={() => setShowSurvey(true)}
                    className="w-full bg-[#FFF3E0] text-[#E65100] py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#FFE0B2] transition-colors"
                >
                    <Info size={20} />
                    Gửi ý kiến phản hồi về bữa ăn
                </button>

            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Utensils size={48} className="mb-4 opacity-50" />
                <p>Chưa có thực đơn cho cửa này hôm nay.</p>
            </div>
        )}
      </div>

      <SurveyModal 
        isOpen={showSurvey} 
        onClose={() => setShowSurvey(false)} 
        kitchenId={kitchen.id}
      />
    </div>
  );
};