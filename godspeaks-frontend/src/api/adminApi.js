import axios from 'axios';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api/products';
const ANALYTICS_URL = 'http://localhost:5000/api/analytics';

// --- HELPER: Get Auth Header ---
// Retrieves the token from local storage and formats it for the Authorization header
const getAuthHeaders = () => {
  const userInfo = localStorage.getItem('userInfo'); // Or 'godspeaks_admin' depending on what you used in AuthContext
  const token = userInfo ? JSON.parse(userInfo).token : null;
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
  const { data } = await axios.post(API_BASE_URL, productData, getAuthHeaders());
  return data;
};

// 2. Update Product (Expects FormData)
export const updateProductApi = async (id, productData) => {
  const { data } = await axios.put(`${API_BASE_URL}/${id}`, productData, getAuthHeaders());
  return data;
};

// 3. Delete Product
export const deleteProductApi = async (id) => {
  const { data } = await axios.delete(`${API_BASE_URL}/${id}`, getAuthHeaders());
  return data;
};

// 4. Fetch All Products (Admin View)
// This might be the same as the public view, but we define it here for clarity
// in case you add admin-specific fields later (like hidden products).
export const fetchAllProductsAdmin = async () => {
  const { data } = await axios.get(API_BASE_URL); 
  // Handle case where backend returns { products: [...] } or just [...]
  return data.products || data;
};

// --- ANALYTICS API FUNCTIONS ---

// 5. Fetch Admin Dashboard Stats
export const fetchDashboardStatsApi = async () => {
  const { data } = await axios.get(ANALYTICS_URL, getAuthHeaders());
  return data;
};