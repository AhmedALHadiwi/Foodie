import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Store, MapPin, Phone, Star } from 'lucide-react';
 
export function RestaurantList() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const restaurantsData = await apiFetch('/restaurants');
      console.log('Restaurants data:', restaurantsData);
      setRestaurants(restaurantsData || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No restaurants available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => {
        console.log('Restaurant:', restaurant.name, 'logo_url:', restaurant.logo_url);
        return (
        <div
          key={restaurant.id}
          onClick={() => navigate(`/restaurants/${restaurant.id}`)}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
        >
          <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 relative overflow-hidden">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-20 h-20 text-white opacity-50" />
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                {restaurant.name}
              </h3>
              {restaurant.avg_rating && restaurant.avg_rating > 0 ? (
                <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full">
                  <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span className="text-sm font-semibold text-orange-700">
                    {restaurant.avg_rating.toFixed(1)}
                  </span>
                </div>
              ) : null}
            </div>

            {restaurant.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {restaurant.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="line-clamp-1">{restaurant.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{restaurant.phone}</span>
              </div>
            </div>

            <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 font-medium transition-colors">
              View Menu
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}
