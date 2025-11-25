// This file handles all authenticated API requests for the Admin dashboard.

const API_BASE_URL = 'http://localhost:5000/api/products'; // Or whatever your base is
const ORDER_API_BASE_URL = 'http://localhost:5000/api/orders'; // Separate base for orders

// --- HELPER FUNCTION: Get Auth Header ---
// This gets the admin's token from localStorage to send with API requests.
const getAuthHeader = () => {
  const adminInfo = JSON.parse(localStorage.getItem('godspeaks_admin'));
  if (adminInfo && adminInfo.token) {
    return {
      'Authorization': `Bearer ${adminInfo.token}`,
      // 'Content-Type': 'application/json' // FormData sets this automatically, but JSON requests need it
    };
  }
  return {};
};

// ===========================================
// PRODUCT API FUNCTIONS
// ===========================================

/**
 * Fetches all products (for the admin panel).
 * @returns {Promise<Array>} A promise that resolves to an array of product objects.
 */
export const fetchAllProductsAdmin = async () => {
  console.log("ADMIN API CALL: fetchAllProductsAdmin()");
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch products`);
    }

    // If backend returns { products: [...], count: ... }, adjust accordingly
    const data = await response.json();
    return data.products || data; 

  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * Creates a new product.
 * @param {FormData} productData - The form data (including text and images).
 * @returns {Promise<object>} - A promise that resolves to the new product.
 */
export const createProductApi = async (productData) => {
  console.log("ADMIN API CALL: createProductApi()");
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        // Content-Type is automatically set for FormData
        ...getAuthHeader()
      },
      body: productData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create product`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

/**
 * Updates an existing product.
 * @param {string} id - The ID of the product to update.
 * @param {FormData} productData - The form data (including text and images).
 * @returns {Promise<object>} - A promise that resolves to the updated product.
 */
export const updateProductApi = async (id, productData) => {
  console.log(`ADMIN API CALL: updateProductApi(${id})`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        // Content-Type is automatically set for FormData
        ...getAuthHeader()
      },
      body: productData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update product`);
    }

    return await response.json(); // Usually returns the updated product object
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

/**
 * Deletes a product.
 * @param {string} productId - The ID of the product to delete.
 * @returns {Promise<object>} - A promise that resolves to a success message.
 */
export const deleteProductApi = async (productId) => {
  console.log(`ADMIN API CALL: deleteProductApi(${productId})`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete product`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// ===========================================
// ORDER API FUNCTIONS
// ===========================================

/**
 * Fetches all orders for the admin panel.
 * @returns {Promise<Array>} A promise that resolves to an array of order objects.
 */
export const fetchAllOrdersAdmin = async () => {
  console.log("ADMIN API CALL: fetchAllOrdersAdmin()");
  
  try {
    const response = await fetch(ORDER_API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch orders`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Updates an order's status.
 * @param {string} orderId - The ID of the order to update.
 * @param {string} status - The new status (e.g., "Shipped").
 * @returns {Promise<object>} - A promise that resolves to the updated order.
 */
export const updateOrderStatusApi = async (orderId, status) => {
  console.log(`ADMIN API CALL: updateOrderStatusApi(${orderId}, ${status})`);
  
  try {
    const response = await fetch(`${ORDER_API_BASE_URL}/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update order status`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};