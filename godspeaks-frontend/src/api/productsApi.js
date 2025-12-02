// --- CONFIGURATION ---
// Adjust the URL if your backend runs on a different port
const API_BASE_URL = 'http://localhost:5000/api/products';

// --- HELPER: Handle API Response ---
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// --- API FUNCTIONS ---

/**
 * Fetches all products with optional filters (Search, Category, Price, Size, Sort).
 * @param {Object} filters 
 * @returns {Promise<Array>}
 */
export const fetchAllProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Search Keyword
    if (filters.search) queryParams.append('keyword', filters.search);
    
    // Category (Array)
    if (filters.category && filters.category.length > 0) {
        queryParams.append('category', filters.category.join(','));
    }
    
    // Size (Array - POD Feature)
    if (filters.size && filters.size.length > 0) {
        queryParams.append('size', filters.size.join(','));
    }

    // Price Range
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    
    // Sorting
    if (filters.sort) queryParams.append('sort', filters.sort);

    const url = `${API_BASE_URL}?${queryParams.toString()}`;
    const response = await fetch(url);
    const data = await handleResponse(response);
    
    return data.products || data; 
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; 
  }
};

/**
 * Fetches a single product by its ID.
 */
export const fetchProductById = async (id) => {
  try {
    const url = `${API_BASE_URL}/${id}`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

/**
 * Adds a review to a product (Supports Image Upload via FormData).
 * @param {string} productId 
 * @param {FormData} reviewData - Must be FormData object containing rating, comment, and optionally image
 */
export const addProductReviewApi = async (productId, reviewData) => {
  try {
    // We check both storages just in case, but usually it's one auth token
    const userInfo = JSON.parse(localStorage.getItem('godspeaks_admin')); 
    const token = userInfo?.token;
    
    const url = `${API_BASE_URL}/${productId}/reviews`;
    
    // CRITICAL: When using FormData, let the browser set the Content-Type 
    // (it needs to set the boundary automatically). Only set Auth header.
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: reviewData, 
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error adding review for product ${productId}:`, error);
    throw error;
  }
};