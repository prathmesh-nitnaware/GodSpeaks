const API_URL = "http://localhost:5000/api/orders";

// --- HELPER: Get Auth Header ---
// Retrieves the token from localStorage to authorize protected requests
const getAuthHeader = () => {
  const userInfo = JSON.parse(localStorage.getItem("godspeaks_admin"));
  return userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
};

/**
 * Loads the Razorpay checkout script dynamically.
 * @param {string} src - The URL of the script to load.
 */
export const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Calls backend to create a new order and get Razorpay Order ID.
 * @param {object} orderData - { shippingInfo, orderItems, totalPrice }
 */
export const createOrderApi = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If you want to link orders to logged-in users, you can add auth header here too
        // ...getAuthHeader()
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Order creation failed");
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * Calls backend to verify the Razorpay payment signature.
 * @param {object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }
 */
export const verifyPaymentApi = async (paymentData) => {
  try {
    const response = await fetch(`${API_URL}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Payment verification failed");
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * Fetches order history for the currently logged-in user.
 * Used in the Customer Dashboard.
 */
export const fetchMyOrdersApi = async () => {
  try {
    const response = await fetch(`${API_URL}/myorders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(), // MUST attach the token here
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch orders");
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Return empty array on error to prevent UI crash
  }
};
