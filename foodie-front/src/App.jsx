/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { hasToken } from './utils/authUtils';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Layout/Header';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { RestaurantList } from './components/Customer/RestaurantList';
import { MenuBrowser } from './components/Customer/MenuBrowser';
import { Cart } from './components/Customer/Cart';
import { OrderTracking } from './components/Customer/OrderTracking';
import { OrderHistory } from './components/Customer/OrderHistory';
import { RatingForm } from './components/Customer/RatingForm';
import ReviewForm from './components/Customer/ReviewForm';
import { RestaurantDashboard } from './components/Restaurant/RestaurantDashboard';
import { ProfileModal } from './components/Profile/ProfileModal';
import { ProtectedRoute } from './components/Routing/ProtectedRoute';
import { PrivateRoute } from './components/Routing/PrivateRoute';
import { GuestRoute } from './components/Routing/GuestRoute';
import Profile from './pages/Profile';
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
function AppContent() {
  const { user, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [ratingOrderId, setRatingOrderId] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [currentView, setCurrentView] = useState('customer');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleOrderPlaced = (orderId) => {
    setShowCart(false);
    setTrackingOrderId(orderId);
  };

  const handleViewOrder = (orderId) => {
    setShowOrderHistory(false);
    setTrackingOrderId(orderId);
  };

  const handleRateOrder = (orderId) => {
    setShowOrderHistory(false);
    setTrackingOrderId(null);
    setRatingOrderId(orderId);
  };

  const handleReviewRestaurant = (orderId, restaurantId) => {
    setReviewData({ orderId, restaurantId });
  };

  const handleCloseReview = () => {
    setReviewData(null);
  };

  const handleReviewSuccess = (review) => {
    // Show success message or refresh data
    alert('Review submitted successfully!');
  };

  return (
    <Router>
      <Routes>
        {/* Landing page - only accessible when not authenticated */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                {authMode === 'login' ? (
                  <LoginForm
                    onSuccess={() => setAuthMode(null)}
                    onSwitchToSignup={() => setAuthMode('signup')}
                  />
                ) : authMode === 'signup' ? (
                  <SignupForm
                    onSuccess={() => setAuthMode(null)}
                    onSwitchToLogin={() => setAuthMode('login')}
                  />
                ) : (
                  <div className="space-y-12 max-w-6xl mx-auto">
                    <section className="bg-white rounded-2xl shadow-xl px-8 py-12 text-center">
                      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                        Crave it. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Order it.</span> Love it.
                      </h1>
                      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Discover top-rated restaurants near you, customize your meal, and track your order live from kitchen to door.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                          onClick={() => setAuthMode('signup')}
                          className="w-full sm:w-auto bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 font-semibold text-lg transition-colors"
                        >
                          Get Started Free
                        </button>
                        <button
                          onClick={() => setAuthMode('login')}
                          className="w-full sm:w-auto bg-white text-orange-600 border-2 border-orange-500 px-8 py-3 rounded-lg hover:bg-orange-50 font-semibold text-lg transition-colors"
                        >
                          Sign In
                        </button>
                      </div>
                    </section>

                    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl shadow p-6">
                        <div className="text-3xl mb-3">🍔</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Huge selection</h3>
                        <p className="text-gray-600">From burgers to sushi, browse menus from dozens of nearby restaurants.</p>
                      </div>
                      <div className="bg-white rounded-xl shadow p-6">
                        <div className="text-3xl mb-3">⚡</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning fast</h3>
                        <p className="text-gray-600">Order in seconds and get your meal delivered hot and fresh.</p>
                      </div>
                      <div className="bg-white rounded-xl shadow p-6">
                        <div className="text-3xl mb-3">📍</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Live tracking</h3>
                        <p className="text-gray-600">Track your order status in real-time from preparation to delivery.</p>
                      </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow p-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6">How it works</h2>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-3">1</div>
                          <h4 className="font-semibold text-gray-900 mb-1">Choose a restaurant</h4>
                          <p className="text-gray-600 text-sm">Explore nearby places and discover trending menus.</p>
                        </div>
                        <div className="text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-3">2</div>
                          <h4 className="font-semibold text-gray-900 mb-1">Customize your meal</h4>
                          <p className="text-gray-600 text-sm">Add items to cart, leave notes, and apply promo codes.</p>
                        </div>
                        <div className="text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-3">3</div>
                          <h4 className="font-semibold text-gray-900 mb-1">Track & enjoy</h4>
                          <p className="text-gray-600 text-sm">Watch your order progress live and enjoy your food!</p>
                        </div>
                      </div>
                    </section>

                    <section className="grid sm:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl shadow p-6 text-center">
                        <div className="text-3xl font-extrabold text-gray-900">500+</div>
                        <div className="text-gray-600">Restaurants</div>
                      </div>
                      <div className="bg-white rounded-xl shadow p-6 text-center">
                        <div className="text-3xl font-extrabold text-gray-900">4.8★</div>
                        <div className="text-gray-600">Average rating</div>
                      </div>
                      <div className="bg-white rounded-xl shadow p-6 text-center">
                        <div className="text-3xl font-extrabold text-gray-900">~30min</div>
                        <div className="text-gray-600">Avg. delivery time</div>
                      </div>
                    </section>

                    <section className="bg-orange-500 rounded-2xl shadow-xl px-8 py-10 text-center text-white">
                      <h3 className="text-3xl font-extrabold mb-3">Hungry? Let's fix that.</h3>
                      <p className="opacity-90 mb-6">Create your free account and get your first order delivered fast.</p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                          onClick={() => setAuthMode('signup')}
                          className="w-full sm:w-auto bg-white text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-50 font-semibold transition-colors"
                        >
                          Create Account
                        </button>
                        <button
                          onClick={() => setAuthMode('login')}
                          className="w-full sm:w-auto border-2 border-white/70 px-8 py-3 rounded-lg hover:bg-white/10 font-semibold transition-colors"
                        >
                          I already have an account
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </GuestRoute>
          }
        />

        {/* Protected routes - only accessible when authenticated */}
        <Route
          path="/restaurants"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Header
                  onShowAuth={() => setAuthMode('login')}
                  onShowOrders={() => {
                    setShowOrderHistory(true);
                    setSelectedRestaurant(null);
                  }}
                  currentView={currentView}
                  onToggleView={() => {
                    setCurrentView(currentView === 'customer' ? 'restaurant' : 'customer');
                    setSelectedRestaurant(null);
                    setShowOrderHistory(false);
                  }}
                />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {currentView === 'restaurant' && profile?.data?.user?.role === 'owner' ? (
                    <RestaurantDashboard />
                  ) : showOrderHistory ? (
                    <OrderHistory
                      onViewOrder={handleViewOrder}
                      onReviewRestaurant={handleReviewRestaurant}
                    />
                  ) : selectedRestaurant ? (
                    <MenuBrowser
                      restaurantId={selectedRestaurant}
                      onBack={() => setSelectedRestaurant(null)}
                      onViewCart={() => setShowCart(true)}
                    />
                  ) : (
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Restaurants</h2>
                      <RestaurantList onSelectRestaurant={setSelectedRestaurant} />
                    </div>
                  )}
                </main>

                {showCart && (
                  <Cart
                    onClose={() => setShowCart(false)}
                    onOrderPlaced={handleOrderPlaced}
                  />
                )}

                {trackingOrderId && (
                  <OrderTracking
                    orderId={trackingOrderId}
                    onClose={() => setTrackingOrderId(null)}
                    onRate={(orderId) => {
                      setTrackingOrderId(null);
                      setRatingOrderId(orderId);
                    }}
                  />
                )}

                {ratingOrderId && (
                  <RatingForm
                    orderId={ratingOrderId}
                    onClose={() => setRatingOrderId(null)}
                    onSuccess={() => {
                      setRatingOrderId(null);
                      alert('Thank you for your feedback!');
                    }}
                  />
                )}

                {reviewData && (
                  <ReviewForm
                    orderId={reviewData.orderId}
                    restaurantId={reviewData.restaurantId}
                    onClose={handleCloseReview}
                    onSuccess={handleReviewSuccess}
                  />
                )}

                </div>
            </ProtectedRoute>
          }
        />

        {/* Profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Header
                  onShowAuth={() => setAuthMode('login')}
                  onShowOrders={() => {
                    setShowOrderHistory(true);
                    setSelectedRestaurant(null);
                  }}
                  currentView={currentView}
                  onToggleView={() => {
                    setCurrentView(currentView === 'customer' ? 'restaurant' : 'customer');
                    setSelectedRestaurant(null);
                    setShowOrderHistory(false);
                  }}
                />
                <Profile />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to restaurants if authenticated, otherwise to landing */}
        <Route
          path="*"
          element={<Navigate to={hasToken() ? "/restaurants" : "/"} replace />}
        />
      </Routes>
    </Router>
  );
}
/* eslint-enable no-unused-vars */

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
