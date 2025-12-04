import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
// eslint-disable-next-line no-unused-vars
import { Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
 
export function OrderManagement({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (restaurantId) {
      loadOrders();
    }

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      if (restaurantId) {
        loadOrders();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const loadOrders = async () => {
    if (!restaurantId) return;
    
    try {
      const data = await apiFetch(`/restaurants/${restaurantId}/orders`);
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'preparing': return <Clock className="w-5 h-5" />;
      case 'on_the_way': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'preparing', 'on_the_way', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status === 'all' ? 'All Orders' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {order.user?.full_name || 'Unknown Customer'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.replace('_', ' ').toUpperCase()}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.user?.phone || 'No phone'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4 my-4">
                <h4 className="font-semibold text-gray-900 mb-3">Order Items:</h4>
                <div className="space-y-2">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.quantity}x</span>{' '}
                        <span className="text-gray-900">{item.dish?.name || 'Unknown Item'}</span>
                        {item.notes && (
                          <p className="text-xs text-gray-600 ml-6 mt-1">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Delivery Address:</span> {order.delivery_address}
                </p>
                {order.customer_notes && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold">Customer Notes:</span> {order.customer_notes}
                  </p>
                )}
              </div>

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium transition-colors"
                      >
                        Start Preparing
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                      className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 font-medium transition-colors"
                    >
                      Mark Out for Delivery
                    </button>
                  )}
                  {order.status === 'on_the_way' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
