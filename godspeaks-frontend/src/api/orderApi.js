import axios from 'axios';

// Adjust if your backend port is different
const API_URL = 'http://localhost:5000/api/orders';

// Helper to get token
const getAuthHeaders = () => {
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

// --- MISSING ADMIN FUNCTIONS ---

export const getAllOrdersApi = async () => {
    const { data } = await axios.get(API_URL, getAuthHeaders());
    return data;
};

export const updateOrderStatusApi = async (id, status) => {
    const { data } = await axios.put(`${API_URL}/${id}/status`, { status }, getAuthHeaders());
    return data;
};