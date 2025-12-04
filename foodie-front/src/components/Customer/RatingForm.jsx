import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Star, X } from 'lucide-react';
 
export function RatingForm({ orderId, onClose, onSuccess }) {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [ratings, setRatings] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await apiFetch(`/orders/${orderId}`);
      setOrder(data);
      const initialRatings = new Map();
      data.order_items.forEach((item) => {
        initialRatings.set(item.menu_items.id, {
          menu_item_id: item.menu_items.id,
          rating: 0,
          review: '',
        });
      });
      setRatings(initialRatings);
    } catch (error) {
      console.error('Error loading order:', error);
    }
    setLoading(false);
  };

  const updateRating = (menuItemId, rating) => {
    const newRatings = new Map(ratings);
    const current = newRatings.get(menuItemId) || { menu_item_id: menuItemId, rating: 0, review: '' };
    newRatings.set(menuItemId, { ...current, rating });
    setRatings(newRatings);
  };

  const updateReview = (menuItemId, review) => {
    const newRatings = new Map(ratings);
    const current = newRatings.get(menuItemId) || { menu_item_id: menuItemId, rating: 0, review: '' };
    newRatings.set(menuItemId, { ...current, review });
    setRatings(newRatings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ratedItems = Array.from(ratings.values()).filter(r => r.rating > 0);

    if (ratedItems.length === 0) {
      setError('Please rate at least one item');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const ratingInserts = ratedItems.map((rating) => ({
        menu_item_id: rating.menu_item_id,
        rating: rating.rating,
        review: rating.review || null,
      }));

      await apiFetch(`/orders/${orderId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ ratings: ratingInserts }),
      });

      onSuccess();
    } catch (err) {
      console.error('Error submitting ratings:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit ratings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <p className="text-gray-500">Order not found</p>
          <button
            onClick={onClose}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-900">Rate Your Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {order.order_items.map((item) => {
              const itemRating = ratings.get(item.menu_items.id);
              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{item.menu_items.name}</h3>

                  <div className="flex items-center space-x-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateRating(item.menu_items.id, star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (itemRating?.rating || 0)
                              ? 'text-orange-500 fill-orange-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    {itemRating && itemRating.rating > 0 && (
                      <span className="text-sm font-medium text-gray-700 ml-2">
                        {itemRating.rating} star{itemRating.rating !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <textarea
                    value={itemRating?.review || ''}
                    onChange={(e) => updateReview(item.menu_items.id, e.target.value)}
                    placeholder="Share your thoughts about this item (optional)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Ratings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
