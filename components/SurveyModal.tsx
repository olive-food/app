import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RatingStars } from './RatingStars';

interface SurveyModalProps {
  kitchenId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ kitchenId, isOpen, onClose }) => {
  const { addSurvey } = useApp();
  const [formData, setFormData] = useState({
    foodQuality: 0,
    portionSize: 0,
    hygiene: 0,
    staffAttitude: 0,
    comment: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSurvey({
        kitchenId,
        ...formData
    });
    setSubmitted(true);
    setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({ foodQuality: 0, portionSize: 0, hygiene: 0, staffAttitude: 0, comment: '' });
    }, 2000);
  };

  const isFormValid = formData.foodQuality > 0 && formData.hygiene > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
        >
            <X size={24} />
        </button>

        <div className="bg-[#FF6B00] p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Khảo sát ý kiến</h2>
            <p className="text-sm opacity-90 mt-1">Góp ý của bạn giúp Olive Food & Services cải thiện mỗi ngày</p>
        </div>

        <div className="p-6">
            {submitted ? (
                <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-[#FF6B00] mb-4">
                        <Send size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Cảm ơn bạn!</h3>
                    <p className="text-gray-500 mt-2">Đánh giá của bạn đã được ghi nhận.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chất lượng món ăn</label>
                            <RatingStars size={28} currentRating={formData.foodQuality} onRate={(r) => setFormData({...formData, foodQuality: r})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Định lượng món ăn</label>
                            <RatingStars size={28} currentRating={formData.portionSize} onRate={(r) => setFormData({...formData, portionSize: r})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vệ sinh khu vực ăn</label>
                            <RatingStars size={28} currentRating={formData.hygiene} onRate={(r) => setFormData({...formData, hygiene: r})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thái độ nhân viên</label>
                            <RatingStars size={28} currentRating={formData.staffAttitude} onRate={(r) => setFormData({...formData, staffAttitude: r})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Góp ý khác</label>
                        <textarea 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none transition-all"
                            rows={3}
                            placeholder="Bạn có muốn món ăn nào xuất hiện trong menu tới không?..."
                            value={formData.comment}
                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${isFormValid ? 'bg-[#FF6B00] hover:bg-[#E66000]' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        Gửi đánh giá
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};