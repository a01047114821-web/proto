import React from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../types/index.js';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-800">{review.customer} 고객님</span>
        <div className="flex">
          {Array(5).fill(0).map((_, j) => (
            <Star 
              key={j} 
              className={`w-4 h-4 ${j < review.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-indigo-600 font-medium">{review.text}</p>
    </div>
  );
};

export default ReviewCard;