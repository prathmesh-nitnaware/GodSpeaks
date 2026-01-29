import axios from 'axios';

// --- CONFIGURATION ---
// If we are on localhost, use localhost:5000. Otherwise use the live URL.
const isLocal = window.location.hostname === 'localhost';
const API_BASE_URL = isLocal ? 'http://localhost:5000' : (process.env.REACT_APP_API_URL || 'https://godspeaks.onrender.com');

const PRODUCT_URL = `${API_BASE_URL}/api/products`;
const ANALYTICS_URL = `${API_BASE_URL}/api/analytics`;

/**
 * Helper: Centralized Authorization Headers
 */
const getAuthHeaders = (isFormData = false, manualToken = null) => {
    const adminInfo = localStorage.getItem('godspeaks_admin');
    const token = manualToken || (adminInfo ? JSON.parse(adminInfo).token : null);
    
    const headers = {
        Authorization: `Bearer ${token}`, 
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return { headers };
};

// --- PRODUCT API FUNCTIONS ---

export const createProductApi = async (productData, token) => {
    const { data } = await axios.post(PRODUCT_URL, productData, getAuthHeaders(true, token));
    return data;
};

export const updateProductApi = async (id, productData, token) => {
    const { data } = await axios.put(`${PRODUCT_URL}/${id}`, productData, getAuthHeaders(true, token));
    return data;
};

export const deleteProductApi = async (id, token) => {
    const { data } = await axios.delete(`${PRODUCT_URL}/${id}`, getAuthHeaders(false, token));
    return data;
};

export const fetchAllProductsAdmin = async (pageNumber = 1) => {
    const { data } = await axios.get(`${PRODUCT_URL}?pageNumber=${pageNumber}`); 
    return data; 
};

// --- ANALYTICS API FUNCTIONS ---

export const fetchDashboardStatsApi = async (token) => {
    const { data } = await axios.get(ANALYTICS_URL, getAuthHeaders(false, token));
    return data;
};