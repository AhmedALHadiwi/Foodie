import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
// eslint-disable-next-line no-unused-vars
import { User, Building2, Phone, Mail, Camera, Save, X } from 'lucide-react';

export default function Profile() {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profile, setProfile] = useState({
    user: null,
    restaurant: null
  });

  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    phone: '',
    address: '',
    logo_url: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [newLogo, setNewLogo] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiFetch('/profile');
      const data = response.data; // Extract data from response
      
      setProfile(data);
      
      setUserForm({
        full_name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone || ''
      });

      if (data.restaurant) {
        setRestaurantForm({
          name: data.restaurant.name,
          phone: data.restaurant.phone,
          address: data.restaurant.address,
          logo_url: data.restaurant.logo_url
        });
        setLogoPreview(data.restaurant.logo_url);
      }
    } catch {
      setError('Failed to load profile');
    }
    setLoading(false);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch('/profile/update', {
        method: 'POST',
        body: JSON.stringify(userForm)
      });

      setUser(response.user);
      setSuccess('Profile updated successfully!');
    } catch {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', restaurantForm.name);
      formData.append('phone', restaurantForm.phone);
      formData.append('address', restaurantForm.address);
      
      if (newLogo) {
        formData.append('logo', newLogo);
      }

      const response = await apiFetch('/profile/update-restaurant', {
        method: 'POST',
        body: formData
      });

      setProfile(prev => ({ ...prev, restaurant: response.restaurant }));
      setSuccess('Restaurant updated successfully!');
      setNewLogo(null);
      
      if (response.restaurant.logo_url) {
        setLogoPreview(response.restaurant.logo_url);
        setRestaurantForm(prev => ({ ...prev, logo_url: response.restaurant.logo_url }));
      }
    } catch {
      setError('Failed to update restaurant');
    }
    setSaving(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setNewLogo(null);
    setLogoPreview(restaurantForm.logo_url || null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="px-6 py-4 bg-green-50 border-l-4 border-green-400">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* User Profile Section */}
          <div className="p-6">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Restaurant Section - Only for owners */}
          {profile.user?.role === 'owner' && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Building2 className="w-6 h-6 text-orange-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Restaurant Information</h2>
              </div>

              <form onSubmit={handleRestaurantSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Phone
                  </label>
                  <input
                    type="tel"
                    value={restaurantForm.phone}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Address
                  </label>
                  <textarea
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Logo
                  </label>
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Restaurant logo"
                            className="h-24 w-24 object-cover rounded-lg"
                          />
                          {newLogo && (
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Upload a new logo. Recommended size: 200x200px. Max size: 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
