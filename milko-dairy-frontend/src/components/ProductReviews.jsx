import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Plus, Trash2 } from 'lucide-react';
import RatingStars from './RatingStars';
import ReviewForm from './ReviewForm';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchCurrentUser();
  }, [productId]);

  const fetchCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user')) || null;
    setCurrentUser(user);
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/product/${productId}`);
      setReviews(response.data.data);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleReviewAdded = () => {
    fetchReviews();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-purple-600" />
            Customer Reviews
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <RatingStars rating={averageRating} size={24} />
            <span className="text-gray-600">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <Plus size={20} />
          Write Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-2">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {review.user?.firstName} {review.user?.lastName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <RatingStars rating={review.rating} size={18} />
                    
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Helpful Button */}
                    <div className="flex items-center gap-4 mt-4">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition">
                        <ThumbsUp size={16} />
                        <span className="text-sm">Helpful</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Button (Only for review owner or admin) */}
                {(currentUser?._id === review.user?._id || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete Review"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onClose={() => setShowReviewForm(false)}
          onReviewAdded={handleReviewAdded}
        />
      )}
    </div>
  );
};

export default ProductReviews;