import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { CreditCard, Wallet, Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getPaymentMethods, simulatePayment } from '../../lib/api.js';

const PaymentSimulation = ({ orderId, amount, onPaymentComplete, onClose }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const data = await getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const data = await simulatePayment({
        order_id: orderId,
        payment_method: selectedMethod,
        card_number: cardNumber || null,
        amount: amount,
      });
      
      setPaymentResult(data);

      if (data.success) {
        setTimeout(() => {
          onPaymentComplete(data.payment);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentResult({
        success: false,
        message: 'Payment processing failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (methodId) => {
    switch (methodId) {
      case 'credit_card':
        return <CreditCard className="w-6 h-6" />;
      case 'wallet':
        return <Wallet className="w-6 h-6" />;
      case 'bank_transfer':
        return <Building2 className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Order Amount</p>
            <p className="text-2xl font-bold text-gray-800">EGP {amount.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Order ID: #{orderId}</p>
          </div>
        </div>

        {!paymentResult && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Payment Method
              </label>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 text-gray-600">
                        {getMethodIcon(method.id)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedMethod === 'credit_card' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number (for simulation)
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="16"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Cards ending with even numbers have higher success rate
                </p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing || !selectedMethod}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                `Pay EGP ${amount.toFixed(2)}`
              )}
            </button>
          </>
        )}

        {paymentResult && (
          <div className={`p-4 rounded-lg ${paymentResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center">
              {paymentResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mr-3" />
              )}
              <div>
                <p className={`font-medium ${paymentResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                </p>
                <p className={`text-sm ${paymentResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {paymentResult.message}
                </p>
                {paymentResult.payment && (
                  <p className="text-xs text-gray-500 mt-1">
                    Transaction ID: {paymentResult.payment.provider_transaction_id}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSimulation;
