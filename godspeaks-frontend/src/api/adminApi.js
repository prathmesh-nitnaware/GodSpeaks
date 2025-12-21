import axios from 'axios';

// --- CONFIGURATION ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const PRODUCT_URL = `${API_BASE_URL}/api/products`;
const ANALYTICS_URL = `${API_BASE_URL}/api/analytics`;

/**
 * Helper: Centralized Authorization Headers
 * Accepts an explicit token to ensure high reliability during session transitions.
 */
const getAuthHeaders = (isFormData = false, manualToken = null) => {
    const adminInfo = localStorage.getItem('godspeaks_admin');
    const token = manualToken || (adminInfo ? JSON.parse(adminInfo).token : null);
    
    // DEBUG: Check your console. If this says 'Bearer null', your login is failing
    console.log("Sending Token:", token ? "Token Exists" : "TOKEN IS NULL");

    const headers = {
        Authorization: `Bearer ${token}`, 
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return { headers };
};

// --- PRODUCT API FUNCTIONS ---

/**
 * Create Product (Admin Only)
 * Now requires the token as an argument to bypass localStorage race conditions.
 */
export const createProductApi = async (productData, token) => {
    const { data } = await axios.post(PRODUCT_URL, productData, getAuthHeaders(true, token));
    return data;
};

/**
 * Update Product (Admin Only)
 */
export const updateProductApi = async (id, productData, token) => {
    const { data } = await axios.put(`${PRODUCT_URL}/${id}`, productData, getAuthHeaders(true, token));
    return data;
};

/**
 * Delete Product (Admin Only)
 */
export const deleteProductApi = async (id, token) => {
    const { data } = await axios.delete(`${PRODUCT_URL}/${id}`, getAuthHeaders(false, token));
    return data;
};

/**
 * Fetch All Products (Admin View)
 * Publicly accessible but returns full pagination metadata.
 */
export const fetchAllProductsAdmin = async (pageNumber = 1) => {
    const { data } = await axios.get(`${PRODUCT_URL}?pageNumber=${pageNumber}`); 
    return data; 
};

// --- ANALYTICS API FUNCTIONS ---

/**
 * Fetch Admin Dashboard Stats
 */
export const fetchDashboardStatsApi = async (token) => {
    const { data } = await axios.get(ANALYTICS_URL, getAuthHeaders(false, token));
    return data;
};