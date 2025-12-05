import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// eslint-disable-next-line no-unused-vars
import { User, Building2, Camera, X } from 'lucide-react';

export function SignupForm({ onSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  
  // Restaurant fields
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantLogo, setRestaurantLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoInputType, setLogoInputType] = useState('file'); // 'file' or 'url'
  const [restaurantLogoUrl, setRestaurantLogoUrl] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestaurantLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlChange = (e) => {
    const url = e.target.value;
    setRestaurantLogoUrl(url);
    setLogoPreview(url);
    setRestaurantLogo(null); // Clear any selected file
  };

  const removeLogo = () => {
    setRestaurantLogo(null);
    setLogoPreview(null);
  };

  const switchInputType = (type) => {
    setLogoInputType(type);
    if (type === 'file') {
      setLogoPreview(null);
      setRestaurantLogo(null);
    } else {
      setLogoPreview(null);
      setRestaurantLogo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', passwordConfirm);
      formData.append('phone', phone);
      formData.append('is_restaurant_owner', isOwner ? '1' : '0');

      if (isOwner) {
        formData.append('restaurant_name', restaurantName);
        formData.append('restaurant_phone', restaurantPhone);
        formData.append('restaurant_address', restaurantAddress);
        if (logoInputType === 'file' && restaurantLogo) {
          formData.append('restaurant_logo', restaurantLogo);
        } else if (logoInputType === 'url' && restaurantLogoUrl) {
          formData.append('restaurant_logo_url', restaurantLogoUrl);
        }
      }

      const response = await signUp(formData);
      console.log('Signup successful, response:', response);
      
      onSuccess?.();
      
      // Use redirect_to from API response or fallback
      const redirectTo = response?.redirect_to || (isOwner ? '/restaurant/dashboard' : '/customer');
      console.log('Redirecting to:', redirectTo);
      
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            pattern="01[0125][0-9]{8}"
            title="Phone must match Egyptian format 01XXXXXXXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center">
          <input
            id="isOwner"
            type="checkbox"
            checked={isOwner}
            onChange={(e) => setIsOwner(e.target.checked)}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="isOwner" className="ml-2 text-sm text-gray-700">
            I am a restaurant owner
          </label>
        </div>

        {isOwner && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div className="flex items-center mb-4">
              <Building2 className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Restaurant Information</h3>
            </div>

            <div>
              <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name *
              </label>
              <input
                id="restaurantName"
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required={isOwner}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="My Restaurant"
              />
            </div>

            <div>
              <label htmlFor="restaurantPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Phone *
              </label>
              <input
                id="restaurantPhone"
                type="tel"
                value={restaurantPhone}
                onChange={(e) => setRestaurantPhone(e.target.value)}
                required={isOwner}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label htmlFor="restaurantAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Address *
              </label>
              <textarea
                id="restaurantAddress"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                required={isOwner}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="123 Main St, City, Country"
              />
            </div>

            <div>
              <label htmlFor="restaurantLogo" className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Logo
              </label>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Restaurant logo preview"
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  {/* Input type selector */}
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => switchInputType('file')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        logoInputType === 'file'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => switchInputType('url')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        logoInputType === 'url'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Use URL
                    </button>
                  </div>

                  {/* File input */}
                  {logoInputType === 'file' && (
                    <div>
                      <input
                        id="restaurantLogo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload restaurant logo (optional). Max size: 2MB.
                      </p>
                    </div>
                  )}

                  {/* URL input */}
                  {logoInputType === 'url' && (
                    <div>
                      <input
                        type="url"
                        value={restaurantLogoUrl}
                        onChange={handleLogoUrlChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter a direct link to your restaurant logo image (optional).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
