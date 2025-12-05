import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../lib/api';
import { CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react';
 
export function OrderTracking({ orderId, onClose, onRate }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      const data = await apiFetch(`/orders/${orderId}`);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    loadOrder();

    // Set up polling for real-time updates (every 5 seconds for better responsiveness)
    const interval = setInterval(loadOrder, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [orderId, loadOrder]);

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'preparing': return 1;
      case 'on_the_way': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Estimating...';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRemaining = (timestamp) => {
    if (!timestamp) return null;
    const now = new Date();
    const target = new Date(timestamp);
    const diff = target - now;
    
    if (diff <= 0) return 'Now';
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
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

  const currentStep = getStatusStep(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const steps = [
    { label: 'Order Placed', icon: Package, status: 'pending', time: order.placed_at },
    { label: 'Preparing', icon: Clock, status: 'preparing', time: order.preparing_at },
    { label: 'On the Way', icon: Truck, status: 'on_the_way', time: order.on_the_way_at },
    { label: 'Delivered', icon: CheckCircle, status: 'delivered', time: order.delivered_at },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Tracking</h2>
          <p className="text-sm text-gray-600">Order #{String(order.id).slice(0, 8)}</p>
        </div>

        <div className="p-6">
          {isCancelled ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Order Cancelled</h3>
              <p className="text-red-700">This order has been cancelled</p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="relative">
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="relative flex justify-between">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    const timeRemaining = getTimeRemaining(step.time);

                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all ${
                            isCompleted
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-orange-200 animate-pulse' : ''}`}
                        >
                          <StepIcon className="w-8 h-8" />
                        </div>
                        <p
                          className={`text-xs font-medium text-center mb-1 ${
                            isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.time && (
                          <p className={`text-xs text-center ${
                            isCurrent ? 'text-orange-600 font-medium' : 'text-gray-500'
                          }`}>
                            {isCurrent && timeRemaining && timeRemaining !== 'Now' 
                              ? `~${timeRemaining}` 
                              : formatTime(step.time)
                            }
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {isDelivered && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-medium">
                    Your order has been delivered! Enjoy your meal!
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Restaurant Details</h3>
            <p className="text-gray-900 font-semibold">{order.restaurant?.name || 'Restaurant'}</p>
            <p className="text-gray-600 text-sm">{order.restaurant?.phone || 'N/A'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-2">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-900">
                    {item.quantity}x {item.dish?.name || 'Item'}
                  </span>
                  <span className="text-gray-700 font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-orange-600 text-lg">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Delivery Address</h3>
            <p className="text-gray-700">{order.delivery_address}</p>
            {order.customer_notes && (
              <>
                <h3 className="font-bold text-gray-900 mt-4 mb-2">Order Notes</h3>
                <p className="text-gray-700">{order.customer_notes}</p>
              </>
            )}
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <p>Ordered: {new Date(order.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(order.updated_at).toLocaleString()}</p>
          </div>

          <div className="flex space-x-3">
            {isDelivered && (
              <button
                onClick={() => onRate(order.id)}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-medium transition-colors"
              >
                Rate Your Order
              </button>
            )}
            <button
              onClick={onClose}
              className={`${isDelivered ? 'flex-1' : 'w-full'} bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
