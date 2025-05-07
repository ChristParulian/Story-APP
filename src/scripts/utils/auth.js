import CONFIG from '../config';

export const isLoggedIn = () => {
  return !!localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
};

export const logout = () => {
  localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
};

export const getToken = () => {
  return localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
};