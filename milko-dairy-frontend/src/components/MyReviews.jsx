import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit2, Package } from 'lucide-react';
import RatingStars from './RatingStars';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reviews/my-reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review deleted successfully');
      fetchMyReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Star className="text-yellow-500" size={32} />
            My Reviews
          </h1>
          <p className="text-gray-600 mt-2">
            You have written {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">You haven't written any reviews yet. Start by ordering products!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Product Info & Review */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <img
                        src={review.product?.image || '/placeholder-product.png'}
                        alt={review.product?.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />

                      {/* Review Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {review.product?.name}
                        </h3>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <RatingStars rating={review.rating} size={18} />
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete Review"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;