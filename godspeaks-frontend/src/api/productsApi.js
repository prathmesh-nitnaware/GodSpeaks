// --- CONFIGURATION ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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

/**
 * Fetch All Products
 * Supports Search, Category Filters, and Pagination.
 */
export const fetchAllProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Standard Filters
    if (filters.search) queryParams.append("keyword", filters.search);
    if (filters.category && filters.category.length > 0)
      queryParams.append("category", filters.category.join(","));
    if (filters.size && filters.size.length > 0)
      queryParams.append("size", filters.size.join(","));
    
    // Price and Sorting
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    if (filters.sort) queryParams.append("sort", filters.sort);

    // CRITICAL: Pagination Support
    if (filters.page) queryParams.append("pageNumber", filters.page);

    const url = `${PRODUCTS_URL}?${queryParams.toString()}`;
    const response = await fetch(url);
    return await handleResponse(response);
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
    console.error(`Error fetching product ID ${id}:`, error);
    throw error;
  }
};

export const fetchRelatedProducts = async (id) => {
  try {
    const url = `${PRODUCTS_URL}/${id}/related`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    return []; // Return empty array to prevent UI crashes if related items fail
  }
};

/**
 * Add Product Review
 * Updated: Unified token support for authenticated reviews.
 */
export const addProductReviewApi = async (productId, reviewData) => {
  try {
    const userInfo = localStorage.getItem("userInfo");
    const adminInfo = localStorage.getItem("godspeaks_admin");
    const token = adminInfo ? JSON.parse(adminInfo).token : (userInfo ? JSON.parse(userInfo).token : null);

    const url = `${PRODUCTS_URL}/${productId}/reviews`;
    const headers = {
        "Authorization": `Bearer ${token}`
    };

    // If sending standard JSON (most common)
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