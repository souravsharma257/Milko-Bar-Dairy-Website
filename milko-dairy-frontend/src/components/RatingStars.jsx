import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, maxRating = 5, size = 20, interactive = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        
        return (
          <Star
            key={index}
            size={size}
            className={`${
              interactive ? 'cursor-pointer transition-all' : ''
            } ${
              isFilled 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
      {!interactive && rating > 0 && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;