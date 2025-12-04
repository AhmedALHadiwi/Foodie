// Token management utilities
export const TOKEN_KEY = 'authToken';

export const getToken = () => {
//   console.log('Getting token from localStorage:', localStorage.getItem(TOKEN_KEY));
  return localStorage.getItem(TOKEN_KEY ||'authToken');
};

export const setToken = (token) => {
  console.log('Setting token in localStorage:', token);
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  console.log('Removing token from localStorage');
  localStorage.removeItem(TOKEN_KEY);
};

export const hasToken = () => !!getToken();
