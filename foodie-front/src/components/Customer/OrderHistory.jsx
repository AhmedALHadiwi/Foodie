import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, Package } from 'lucide-react';
 
export function OrderHistory({ onViewOrder, onReviewRestaurant }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await apiFetch('/customer/orders');
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'on_the_way': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600">Start ordering from your favorite restaurants!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{order.restaurant?.name || 'Restaurant'}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
                <p className="text-xl font-bold text-orange-600 mt-2">
                  ${order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-3 my-4">
              <div className="text-sm text-gray-700">
                {(order.items || []).slice(0, 3).map((item, index) => (
                  <span key={item.id}>
                    {item.quantity}x {item.dish?.name || 'Item'}
                    {index < Math.min((order.items || []).length, 3) - 1 ? ', ' : ''}
                  </span>
                ))}
                {(order.items || []).length > 3 && (
                  <span className="text-gray-500"> and {(order.items || []).length - 3} more</span>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => onViewOrder(order.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium inline-flex items-center justify-center transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              {order.status === 'delivered' && (
                <button
                  onClick={() => onReviewRestaurant && onReviewRestaurant(order.id, order.restaurant?.id)}
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium inline-flex items-center justify-center transition-colors"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Rate Restaurant
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
