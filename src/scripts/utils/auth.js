import CONFIG from "../config";
import api from "../data/api";

// Authentication Functions
export const isLoggedIn = () => {
  return !!localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
};

export const logout = () => {
  localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
  localStorage.removeItem("user_name");
};

export const loginUser = async (email, password) => {
  const response = await api.login(email, password);
  if (response.error) throw new Error(response.message);

  saveAuthData(response.loginResult.token, response.loginResult.name);
  return response;
};

export const registerUser = async (userData) => {
  const response = await api.register(userData);
  if (response.error) throw new Error(response.message);
  return response;
};

// Helper Functions
export const getUsername = () => {
  return localStorage.getItem("user_name") || "Pengguna";
};

export const saveAuthData = (token, name) => {
  localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
  localStorage.setItem("user_name", name);
};
