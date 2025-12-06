const API_URL = "http://foodie-back.test/api"; // 🔑 عدّل لو الـ domain مختلف

// Import token utilities
import { getToken } from '../utils/authUtils.js';

export async function apiFetch(
  endpoint,
  options = {}
) {
  // Get token using utility function
  const token = getToken();
  console.log('API Fetch - Token from utils:', token);

  // Don't set Content-Type for FormData (browser sets it automatically with boundary)
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // Only set Content-Type if not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('API Fetch - Adding Authorization header');
  }

  console.log('API Fetch - Request:', `${API_URL}${endpoint}`, options);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log('API Fetch - Response status:', res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('API Fetch - Error response:', errorData);
      throw new Error(errorData.message || `HTTP Error ${res.status}`);
    }

    const data = await res.json();
    console.log('API Fetch - Success response:', data);
    return data;
  } catch (error) {
    console.error('API Fetch - Network/Parse error:', error);
    throw error;
  }
}

// Payment API functions
export async function getPaymentMethods() {
  return apiFetch('/payment-methods');
}

export async function simulatePayment(paymentData) {
  return apiFetch('/payments/simulate', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
}
