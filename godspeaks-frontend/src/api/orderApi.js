import axios from 'axios';

// --- CONFIGURATION ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/orders`;

/**
 * Helper: Centralized Authorization Headers
 * Ensures the most recent token is pulled from storage before every request.
 */
const getAuthHeaders = () => {
    const userInfo = localStorage.getItem('userInfo');
    const adminInfo = localStorage.getItem('godspeaks_admin');
    
    // Prioritize admin token for fulfillment tasks, fallback to customer token
    const token = adminInfo ? JSON.parse(adminInfo).token : (userInfo ? JSON.parse(userInfo).token : null);
    
    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // If token is null, backend returns 401
        },
    };
};

// --- RAZORPAY SDK LOADER ---
export const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// --- CUSTOMER ORDER FUNCTIONS ---
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

// --- ADMIN DASHBOARD FUNCTIONS ---
/**
 * Support for Paginated Orders with Auth Headers
 */
export const getAllOrdersApi = async (page = 1) => {
    const { data } = await axios.get(`${API_URL}?pageNumber=${page}`, getAuthHeaders());
    return data;
};

export const updateOrderStatusApi = async (id, status) => {
    const { data } = await axios.put(`${API_URL}/${id}/status`, { status }, getAuthHeaders());
    return data;
};