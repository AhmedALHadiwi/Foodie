import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
// eslint-disable-next-line no-unused-vars
import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

export function Cart({ onClose, onOrderPlaced, isModal = true }) {
  const { items, removeItem, updateQuantity, updateInstructions, clearCart, total, restaurantId } = useCart();
  const { user, profile } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.default_address || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!user || !restaurantId) return;

    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: restaurantId,
          total_amount: total,
          delivery_address: deliveryAddress,
          customer_notes: customerNotes || null,
          items: items.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price,
            special_instructions: item.special_instructions || null,
          })),
        }),
      });

      clearCart();
      onOrderPlaced(order.id);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    const wrapperClass = isModal 
      ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      : "min-h-screen bg-gray-50 flex items-center justify-center p-4";
    const containerClass = "bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center";

    return (
      <div className={wrapperClass}>
        <div className={containerClass}>
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
          <button
            onClick={onClose}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-medium transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const wrapperClass = isModal 
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
    : "min-h-screen bg-gray-50 py-8";
  const containerClass = isModal 
    ? "bg-white rounded-lg shadow-xl max-w-2xl w-full my-8"
    : "bg-white rounded-lg shadow-xl max-w-4xl mx-auto";

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>
        <div className={`${isModal ? 'sticky top-0' : ''} bg-white border-b px-6 py-4 flex items-center justify-between ${isModal ? 'rounded-t-lg' : ''}`}>
          <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
          {isModal && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-orange-600 font-bold mt-1">
                      ${item.price.toFixed(2)}
                    </p>

                    <div className="flex items-center space-x-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-gray-900 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.special_instructions || ''}
                      onChange={(e) => updateInstructions(item.id, e.target.value)}
                      placeholder="Special instructions (optional)"
                      className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address *
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="123 Main St, Apt 4, City, State 12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Notes (optional)
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Any special instructions for your order"
              />
            </div>
          </div>
        </div>

        <div className={`border-t px-6 py-4 bg-gray-50 ${isModal ? 'rounded-b-lg' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-orange-600">${total.toFixed(2)}</span>
          </div>

          <div className="flex space-x-3">
            {!isModal && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold transition-colors"
              >
                Continue Shopping
              </button>
            )}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`${isModal ? 'w-full' : 'flex-1'} bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition-colors`}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
