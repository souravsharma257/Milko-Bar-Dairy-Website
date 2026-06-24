import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import RatingStars from './RatingStars';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, onClose, onReviewAdded }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/reviews/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Review submitted successfully! 🎉');
      onReviewAdded(response.data.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Write a Review</h2>
          <p className="text-gray-600 text-sm">Share your experience with this product</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating *
            </label>
            <div className="flex items-center gap-2">
              <RatingStars
                rating={formData.rating}
                size={32}
                interactive={true}
                onRatingChange={(rating) => setFormData({ ...formData, rating })}
              />
              {formData.rating > 0 && (
                <span className="text-lg font-semibold text-purple-600 ml-2">
                  {formData.rating === 5 ? 'Excellent!' : 
                   formData.rating === 4 ? 'Very Good!' : 
                   formData.rating === 3 ? 'Good!' : 
                   formData.rating === 2 ? 'Fair' : 'Poor'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Tell us about your experience with this product..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;