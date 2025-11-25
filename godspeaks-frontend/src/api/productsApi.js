// --- CONFIGURATION ---
// In production, this should come from an environment variable like process.env.REACT_APP_API_URL
const API_BASE_URL = 'http://localhost:5000/api/products';

// --- MOCK PRODUCT DATABASE (FOR DEMO) ---
// This contains only the single requested product for presentation purposes.
const MOCK_PRODUCTS = [
  {
    _id: '1',
    name: 'SON OF DAVID',
    description: 'Wear your faith with this bold and modern "Son of David" tee.',
    verse: 'Matthew 1:1',
    price: 35000, // 350 RS * 100 = 35000 (stored in paisa)
    images: ['/Son_of_David.png'], // Image located in /public folder
    rating: 5,
    category: 'Scripture',
    numReviews: 0,
    reviews: [],
    stock: [
        { size: 'S', count: 10 },
        { size: 'M', count: 15 },
        { size: 'L', count: 5 },
        { size: 'XL', count: 20 },
        { size: 'XXL', count: 8 }
    ]
  }
];

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
 * Fetches all products.
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} A promise that resolves to an array of product objects.
 */
export const fetchAllProducts = async (filters = {}) => {
  // --- MOCK IMPLEMENTATION FOR DEMO ---
  console.log("API CALL: fetchAllProducts() (MOCK)");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_PRODUCTS);
    }, 300);
  });

  /* --- REAL API IMPLEMENTATION (COMMENTED OUT FOR DEMO) ---
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('keyword', filters.search);
    if (filters.category && filters.category.length > 0) queryParams.append('category', filters.category.join(','));
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

    const url = `${API_BASE_URL}?${queryParams.toString()}`;
    const response = await fetch(url);
    const data = await handleResponse(response);
    return data.products || data; 
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; 
  }
  */
};

/**
 * Fetches a single product by its ID.
 * @param {string} id - The ID of the product to fetch.
 * @returns {Promise<object>} A promise that resolves to a single product object.
 */
export const fetchProductById = async (id) => {
  // --- MOCK IMPLEMENTATION FOR DEMO ---
  console.log(`API CALL: fetchProductById(${id}) (MOCK)`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = MOCK_PRODUCTS.find(p => p._id === id);
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found'));
      }
    }, 100);
  });

  /* --- REAL API IMPLEMENTATION (COMMENTED OUT FOR DEMO) ---
  try {
    const url = `${API_BASE_URL}/${id}`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
  */
};

/**
 * Adds a review to a product.
 * @param {string} productId 
 * @param {object} reviewData { rating, comment, name }
 * @returns {Promise<object>} The updated product or success message
 */
export const addProductReviewApi = async (productId, reviewData) => {
  // --- MOCK IMPLEMENTATION FOR DEMO ---
  console.log(`API CALL: addProductReviewApi(${productId}) (MOCK)`, reviewData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const productIndex = MOCK_PRODUCTS.findIndex(p => p._id === productId);
      if (productIndex !== -1) {
        const newReview = {
          _id: `r${Date.now()}`,
          ...reviewData,
          createdAt: new Date().toISOString()
        };
        
        if (!MOCK_PRODUCTS[productIndex].reviews) {
             MOCK_PRODUCTS[productIndex].reviews = [];
        }
        MOCK_PRODUCTS[productIndex].reviews.push(newReview);
        MOCK_PRODUCTS[productIndex].numReviews = MOCK_PRODUCTS[productIndex].reviews.length;
        
        const totalRating = MOCK_PRODUCTS[productIndex].reviews.reduce((acc, item) => item.rating + acc, 0);
        MOCK_PRODUCTS[productIndex].rating = totalRating / MOCK_PRODUCTS[productIndex].reviews.length;

        resolve({ message: 'Review added successfully' });
      } else {
        reject(new Error('Product not found'));
      }
    }, 500);
  });

  /* --- REAL API IMPLEMENTATION (COMMENTED OUT FOR DEMO) ---
  try {
    const userInfo = JSON.parse(localStorage.getItem('godspeaks_admin'));
    const token = userInfo?.token;
    const url = `${API_BASE_URL}/${productId}/reviews`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(reviewData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error adding review for product ${productId}:`, error);
    throw error;
  }
  */
};