import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  currentRating: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ 
  currentRating, 
  onRate, 
  readOnly = false,
  size = 20
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onRate && onRate(star)}
          className={`focus:outline-none transition-transform ${!readOnly ? 'hover:scale-110' : ''}`}
        >
          <Star
            size={size}
            fill={star <= currentRating ? "#F59E0B" : "none"}
            color={star <= currentRating ? "#F59E0B" : "#D1D5DB"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
};
