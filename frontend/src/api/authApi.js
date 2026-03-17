import axios from 'axios';

// --- CONFIGURATION ---
// If we are on localhost, use localhost:5000. Otherwise use the live URL.
const isLocal = window.location.hostname === 'localhost';
const API_BASE_URL = isLocal ? 'http://localhost:5000' : (process.env.REACT_APP_API_URL || 'https://godspeaks.onrender.com');

const AUTH_URL = `${API_BASE_URL}/api/auth`;

// --- AUTH API FUNCTIONS ---

/**
 * Login User (Admin or Customer)
 */
export const loginApi = async (email, password) => {
  try {
    const { data } = await axios.post(`${AUTH_URL}/login`, { email, password });
    return data;
  } catch (error) {
    console.error("Login API Error:", error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Register User (Customer)
 */
export const registerApi = async (userData) => {
  try {
    const { data } = await axios.post(`${AUTH_URL}/register`, userData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * Forgot Password
 */
export const forgotPasswordApi = async (email) => {
  try {
    const { data } = await axios.post(`${AUTH_URL}/forgot-password`, { email });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Request failed');
  }
};

/**
 * Reset Password
 */
export const resetPasswordApi = async (token, password) => {
  try {
    const { data } = await axios.post(`${AUTH_URL}/reset-password/${token}`, { password });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Reset failed');
  }
};

/**
 * Google Login
 */
export const googleLoginApi = async (idToken) => {
  try {
    const { data } = await axios.post(`${AUTH_URL}/google`, { idToken });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Google login failed');
  }
};