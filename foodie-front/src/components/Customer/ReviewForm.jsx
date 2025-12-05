import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Star, X, Send } from 'lucide-react';

export default function ReviewForm({ restaurantId, onClose, onSuccess }) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is a restaurant owner
  const userRole = user?.role || profile?.data?.user?.role;
  if (userRole === 'owner') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h3>
          <p className="text-gray-600 mb-6">Restaurant owners cannot submit reviews.</p>
          <button
            onClick={onClose}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentUser = user || profile?.data?.user;
      console.log('Submitting review with user:', { 
        userId: currentUser?.id, 
        userRole: currentUser?.role,
        profileRole: profile?.data?.user?.role 
      });
      const response = await apiFetch(`/restaurants/${restaurantId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: restaurantId,
          rating,
          comment: review,
        }),
      });

      onSuccess(response);
      onClose();
    } catch (err) {
      // Handle specific error messages
      if (err.message?.includes('already reviewed')) {
        setError('You have already reviewed this restaurant. Each customer can only leave one review.');
      } else if (err.message?.includes('cannot create review')) {
        setError(err.message);
      } else {
        setError(err.message || 'Failed to submit review');
      }
    }
    setLoading(false);
  };

  const StarButton = ({ value }) => (
    <button
      type="button"
      onClick={() => setRating(value)}
      onMouseEnter={() => setHoveredStar(value)}
      onMouseLeave={() => setHoveredStar(0)}
      className="p-1 transition-colors"
    >
      <Star
        className={`w-8 h-8 ${
          value <= (hoveredStar || rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        } transition-colors`}
      />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Rate Your Experience</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <StarButton key={value} value={value} />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
              Review (optional)
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Share your experience with this restaurant..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors inline-flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
