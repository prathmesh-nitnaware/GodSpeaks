import axios from 'axios';

// --- FIXED: Use Environment Variable ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/orders`;

// Helper to get token
const getAuthHeaders = () => {
    // Ensure we look for the correct token key (Standardize on 'userInfo' for customers)
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo).token : null;
    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
};

export const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const createOrderApi = async (orderData) => {
    const { data } = await axios.post(`${API_URL}/create`, orderData, getAuthHeaders());
    return data;
};

export const verifyPaymentApi = async (paymentData) => {
    const { data } = await axios.post(`${API_URL}/verify-payment`, paymentData, getAuthHeaders());
    return data;
};

export const fetchMyOrdersApi = async () => {
    const { data } = await axios.get(`${API_URL}/myorders`, getAuthHeaders());
    return data;
};

// --- ADMIN FUNCTIONS ---
export const getAllOrdersApi = async () => {
    // Admin routes might require a different token key if your Admin Login saves to 'godspeaks_admin'
    // For now, we reuse getAuthHeaders(), but ensure the logged-in user has admin privileges
    const { data } = await axios.get(API_URL, getAuthHeaders());
    return data;
};

export const updateOrderStatusApi = async (id, status) => {
    const { data } = await axios.put(`${API_URL}/${id}/status`, { status }, getAuthHeaders());
    return data;
};