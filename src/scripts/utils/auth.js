import CONFIG from '../config';

export const isLoggedIn = () => {
  return !!localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
};

export const logout = () => {
  localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
  localStorage.removeItem('user_name');
};

export const getToken = () => {
  return localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
};

export const saveUserData = (loginResult) => {
  localStorage.setItem('user_name', loginResult.name);
};

export const getUserName = () => {
  return localStorage.getItem('user_name') || 'Pengguna';
};