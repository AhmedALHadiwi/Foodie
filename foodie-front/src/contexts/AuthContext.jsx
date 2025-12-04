import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { getToken, setToken, removeToken } from '../utils/authUtils';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on first render IF token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiFetch('/user');
      setUser(userData);
      await loadProfile();
    } catch (error) {
      console.error('Error loading user:', error);
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const profileData = await apiFetch('/profile');
      console.log('Profile data:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // -----------------------------
  // SIGN UP (WITHOUT loadUser)
  // -----------------------------
  const signUp = async (formData) => {
    try {
      const response = await apiFetch('/register', {
        method: 'POST',
        body: formData, // FormData object for file upload
      });

      console.log('Signup response:', response);

      if (response.data && response.data.token) {
        // Save token using utility function ONLY
        setToken(response.data.token);

        // Save user if provided
        if (response.data.user) setUser(response.data.user);

        // Do NOT call loadUser here
      }

      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // -----------------------------
  // SIGN IN (WITHOUT loadUser)
  // -----------------------------
  const signIn = async (email, password) => {
    try {
      const response = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response:', response);

      if (response.data && response.data.token) {
        // Save token using utility function ONLY
        setToken(response.data.token);
        console.log('Token saved after login:', response.data.token);

        // Save user if provided
        if (response.data.user) {
          setUser(response.data.user);
          console.log('User saved after login:', response.data.user);
        }

        // Return the data part for redirect handling
        return response.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // -----------------------------
  // SIGN OUT
  // -----------------------------
  const signOut = async () => {
    removeToken();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

    await apiFetch('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    await loadProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-export hasToken for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { hasToken } from '../utils/authUtils';
