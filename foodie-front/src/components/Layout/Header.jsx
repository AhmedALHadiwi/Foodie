import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { LogOut, User, ShoppingBag, History, Store } from 'lucide-react';

export function Header({ onShowAuth, onShowOrders, currentView, onToggleView }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    // Redirect to landing page after logout
    navigate('/', { replace: true });
  };

  const handleShowProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">FoodOrder</h1>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {profile?.data?.user?.role === 'owner' && (
                  <button
                    onClick={onToggleView}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium inline-flex items-center transition-colors"
                  >
                    {currentView === 'customer' ? (
                      <>
                        <Store className="w-4 h-4 mr-2" />
                        Restaurant Dashboard
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Customer View
                      </>
                    )}
                  </button>
                )}
                {currentView === 'customer' && (
                  <button
                    onClick={onShowOrders}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium inline-flex items-center transition-colors"
                  >
                    <History className="w-4 h-4 mr-2" />
                    My Orders
                  </button>
                )}
                <button
                  onClick={handleShowProfile}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium inline-flex items-center transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  {profile?.data.user?.full_name || 'Profile'}
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium inline-flex items-center transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={onShowAuth}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
