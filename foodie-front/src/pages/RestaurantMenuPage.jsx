import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, ShoppingCart, Star, Search } from 'lucide-react';
import ReviewForm from '../components/Customer/ReviewForm';

export function RestaurantMenuPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { addItem, items } = useCart();

  const loadData = useCallback(async () => {
    try {
      const [restaurant, categories, items, reviews, userReviewData] = await Promise.all([
        apiFetch(`/restaurants/${id}`),
        apiFetch(`/restaurants/${id}/categories`),
        apiFetch(`/restaurants/${id}/menu-items`),
        apiFetch(`/restaurants/${id}/reviews`),
        user ? apiFetch(`/restaurants/${id}/user-review`) : Promise.resolve({ hasReviewed: false })
      ]);
      setRestaurant(restaurant);
      setCategories(categories);
      setMenuItems(items);
      setReviews(reviews);
      setUserHasReviewed(userReviewData?.hasReviewed || false);
      console.log('Loaded reviews:', reviews);
      console.log('User review status:', userReviewData);
    } catch (error) {
      console.error('Error loading menu data:', error);
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [id, loadData]);

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      restaurant_id: id,
    });
  };

  const handleReviewSubmit = async () => {
    // Refresh reviews and user review status after successful submission
    try {
      const [reviews, userReviewData] = await Promise.all([
        apiFetch(`/restaurants/${id}/reviews`),
        apiFetch(`/restaurants/${id}/user-review`)
      ]);
      setReviews(reviews);
      setUserHasReviewed(userReviewData?.hasReviewed || false);
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    }
  };


  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           item.category_id === selectedCategory ||
                           (selectedCategory === 'uncategorized' && !item.category_id);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Restaurant not found</p>
      </div>
    );
  }

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 relative">
          {restaurant.image_url ? (
            <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-20 h-20 text-white opacity-50" />
            </div>
          )}
        </div>

        <div className="p-6">
          <button
            onClick={() => navigate('/restaurants')}
            className="text-orange-600 hover:text-orange-700 font-medium mb-4 inline-flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Restaurants
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-gray-600 mb-4">{restaurant.description}</p>
          )}
          <p className="text-sm text-gray-600">{restaurant.address}</p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No menu items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {item.avg_rating && item.avg_rating > 0 ? (
                  <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center space-x-1 shadow-md">
                    <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {item.avg_rating.toFixed(1)}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium inline-flex items-center transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-1" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Section - Moved below menu items */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {user && !userHasReviewed && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No reviews yet</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.user?.full_name || 'Anonymous'}
                    </h4>
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
                
                {review.dish && (
                  <p className="text-sm text-gray-500 mt-2">
                    Reviewed: {review.dish.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItemCount > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 bg-orange-500 text-white px-6 py-4 rounded-full shadow-lg hover:bg-orange-600 font-bold inline-flex items-center space-x-2 transition-all hover:scale-105"
        >
          <ShoppingCart className="w-6 h-6" />
          <span>View Cart ({cartItemCount})</span>
        </button>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          restaurantId={id}
          onClose={() => setShowReviewForm(false)}
          onSuccess={handleReviewSubmit}
        />
      )}
    </div>
  );
}
