import axios from 'axios';

// --- CONFIGURATION ---
// Use the environment variable we set up earlier
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const PRODUCT_URL = `${API_BASE_URL}/api/products`;
const ANALYTICS_URL = `${API_BASE_URL}/api/analytics`;

// --- HELPER: Get Auth Header ---
const getAuthHeaders = () => {
  // --- FIX: Look for 'godspeaks_admin', NOT 'userInfo' ---
  const adminInfo = localStorage.getItem('godspeaks_admin');
  const token = adminInfo ? JSON.parse(adminInfo).token : null;
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      // Note: We do NOT set 'Content-Type' manually here because 
      // when sending FormData (for image uploads), axios sets it automatically.
    },
  };
};

// --- PRODUCT API FUNCTIONS ---

// 1. Create Product (Expects FormData)
export const createProductApi = async (productData) => {
  const { data } = await axios.post(PRODUCT_URL, productData, getAuthHeaders());
  return data;
};

// 2. Update Product (Expects FormData)
export const updateProductApi = async (id, productData) => {
  const { data } = await axios.put(`${PRODUCT_URL}/${id}`, productData, getAuthHeaders());
  return data;
};

// 3. Delete Product
export const deleteProductApi = async (id) => {
  const { data } = await axios.delete(`${PRODUCT_URL}/${id}`, getAuthHeaders());
  return data;
};

// 4. Fetch All Products (Admin View)
export const fetchAllProductsAdmin = async () => {
  const { data } = await axios.get(PRODUCT_URL); 
  return data.products || data;
};

// --- ANALYTICS API FUNCTIONS ---

// 5. Fetch Admin Dashboard Stats
export const fetchDashboardStatsApi = async () => {
  const { data } = await axios.get(ANALYTICS_URL, getAuthHeaders());
  return data;
};