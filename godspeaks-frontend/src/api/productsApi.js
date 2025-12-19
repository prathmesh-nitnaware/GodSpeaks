// --- CONFIGURATION ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const PRODUCTS_URL = `${API_BASE_URL}/api/products`;

// --- HELPER: Handle API Response ---
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return await response.json();
};

// --- API FUNCTIONS ---

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
    if (filters.minRating) queryParams.append("minRating", filters.minRating);
    if (filters.page) queryParams.append("pageNumber", filters.page);
    if (filters.sort) queryParams.append("sort", filters.sort);

    const url = `${PRODUCTS_URL}?${queryParams.toString()}`;
    const response = await fetch(url);
    const data = await handleResponse(response);

    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const url = `${PRODUCTS_URL}/${id}`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
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
    console.error("Error fetching related products:", error);
    return []; 
  }
};

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
    console.error("Error joining waitlist:", error);
    throw error;
  }
};

export const addProductReviewApi = async (productId, reviewData) => {
  try {
    // --- FIX: Use 'userInfo' for customers, fall back to 'godspeaks_admin' if needed ---
    const customerInfo = JSON.parse(localStorage.getItem("userInfo"));
    const adminInfo = JSON.parse(localStorage.getItem("godspeaks_admin"));
    
    // Prefer customer token for reviews
    const token = customerInfo?.token || adminInfo?.token;

    const url = `${PRODUCTS_URL}/${productId}/reviews`;

    const headers = {};
    // If you are sending JSON data, ensure Content-Type is set. 
    // If reviewData is FormData (image upload), do NOT set Content-Type manually.
    if (!(reviewData instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }
    
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: reviewData,
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error adding review for product ${productId}:`, error);
    throw error;
  }
};