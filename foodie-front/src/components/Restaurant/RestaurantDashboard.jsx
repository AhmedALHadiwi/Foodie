import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
// eslint-disable-next-line no-unused-vars
import { Store, Package } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { OrderManagement } from './OrderManagement';
// eslint-disable-next-line no-unused-vars
import { MenuManagement } from './MenuManagement';
// eslint-disable-next-line no-unused-vars
import { SalesReports } from './SalesReports';



export function RestaurantDashboard() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    loadRestaurant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRestaurant = async () => {
    if (!user) return;

    try {
      const data = await apiFetch('/my-restaurant');
      setRestaurant(data);
      console.log('Restaurant loaded:', data);
    } catch (error) {
      console.error('Error loading restaurant:', error);
      // If 404, restaurant doesn't exist for this owner
      if (error.message?.includes('Restaurant not found')) {
        setRestaurant(null);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Store className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</h2>
            <p className="text-gray-600 mb-6">Set up your restaurant to start accepting orders</p>
            <button
              onClick={() => setShowSetup(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-medium inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Set Up Restaurant
            </button>
          </div>
        </div>

        {showSetup && (
          <RestaurantSetup
            onComplete={() => {
              setShowSetup(false);
              loadRestaurant();
            }}
            onCancel={() => setShowSetup(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-sm text-gray-600">{restaurant.address}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-6 mt-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'menu'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'orders' && restaurant && <OrderManagement restaurantId={restaurant.id} />}
        {activeTab === 'menu' && restaurant && <MenuManagement restaurantId={restaurant.id} />}
        {activeTab === 'reports' && restaurant && <SalesReports restaurantId={restaurant.id} />}
      </div>
    </div>
  );
}
