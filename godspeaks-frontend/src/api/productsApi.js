// --- CONFIGURATION ---// If we are on localhost, use localhost:5000. Otherwise use the live URL.
const isLocal = window.location.hostname === 'localhost';
const API_BASE_URL = isLocal ? 'http://localhost:5000' : 'https://godspeaks.onrender.com';

const PRODUCTS_URL = `${API_BASE_URL}/api/products`;

// --- HELPER: Unified Response Handler ---
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return await response.json();
};

// --- HELPER: Token Retriever ---
const getAuthToken = () => {
  const userInfo = localStorage.getItem("userInfo");
  const adminInfo = localStorage.getItem("godspeaks_admin");
  const parsed = adminInfo ? JSON.parse(adminInfo) : (userInfo ? JSON.parse(userInfo) : null);
  return parsed ? parsed.token : null;
};

/**
 * Fetch All Products
 */
export const fetchAllProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append("keyword", filters.search);
    if (filters.category && filters.category.length > 0)
      queryParams.append("category", filters.category.join(","));
    if (filters.size && filters.size.length > 0)
      queryParams.append("size", filters.size.join(","));
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    if (filters.sort) queryParams.append("sort", filters.sort);
    if (filters.page) queryParams.append("pageNumber", filters.page);

    const url = `${PRODUCTS_URL}?${queryParams.toString()}`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * NEW: Delete Product (Admin Only)
 */
export const deleteProductApi = async (id) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${PRODUCTS_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Delete failed for product ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch Product By ID
 */
export const fetchProductById = async (id) => {
  try {
    const url = `${PRODUCTS_URL}/${id}`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching product ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch Related Products
 */
export const fetchRelatedProducts = async (id) => {
  try {
    const url = `${PRODUCTS_URL}/${id}/related`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    return []; 
  }
};

/**
 * Add Product Review
 */
export const addProductReviewApi = async (productId, reviewData) => {
  try {
    const token = getAuthToken();
    const url = `${PRODUCTS_URL}/${productId}/reviews`;
    const headers = { "Authorization": `Bearer ${token}` };

    if (!(reviewData instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: reviewData instanceof FormData ? reviewData : JSON.stringify(reviewData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Review failed for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Join Waitlist
 */
export const joinWaitlistApi = async (id, email) => {
  try {
    const url = `${PRODUCTS_URL}/${id}/waitlist`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await handleResponse(response);
  } catch (error) {
    throw error;
  }
};