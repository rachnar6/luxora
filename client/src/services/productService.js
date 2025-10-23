import axios from 'axios';
import API from './api'; // Assuming 'api.js' sets up your base URL and interceptors

// Fetches products with various filters
export const getProducts = async (filters = {}) => {
    // Destructure all potential filters
    const { category, brand, minPrice, maxPrice, searchTerm, rating } = filters;

    const params = new URLSearchParams(); // Creates URL parameters handler

    // Append parameters ONLY if they exist and have a value
    if (category) params.append('category', category);
    if (brand) params.append('brand', brand);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (searchTerm) params.append('keyword', searchTerm); // Use 'keyword' to match backend
    if (rating) params.append('rating', rating);

    // Make the API call using the configured API instance (handles base URL)
    const { data } = await API.get(`/products?${params.toString()}`);
    return data;
};

// Fetches a list of unique category names
export const getUniqueCategories = async () => {
    const { data } = await API.get('/products/categories');
    return data;
};

// Fetches products marked as deals
export const getDeals = async () => {
    const { data } = await API.get('/products/deals');
    return data;
};

// Fetches the top-selling products
export const getTopSellingProducts = async () => {
    const { data } = await API.get('/products/top-selling');
    return data;
};

// Fetches the most recently added products
export const getLatestProducts = async () => {
    const { data } = await API.get('/products/latest');
    return data;
};

// Submits a new product review (using FormData for potential media)
export const createProductReview = async (productId, reviewData) => {
    const formData = new FormData();
    formData.append('rating', reviewData.rating);
    formData.append('comment', reviewData.comment);

    // Append media files if they exist
    if (reviewData.media && reviewData.media.length > 0) {
        for (let i = 0; i < reviewData.media.length; i++) {
            formData.append('media', reviewData.media[i]);
        }
    }

    // The API instance (from api.js) should handle the token via interceptors
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
        },
    };

    const { data } = await API.post(`/products/${productId}/reviews`, formData, config);
    return data;
};

// Fetches details for a single product
// Using axios directly here - consider switching to API instance for consistency
export const getProductDetails = async (productId) => {
    // It's often better to use API.get for consistency if '/api' is your base path
    const { data } = await axios.get(`/api/products/${productId}`);
    return data;
};

// Fetches products related to a specific product
// Using axios directly - consider switching to API instance
export const getRelatedProducts = async (productId) => {
    const { data } = await axios.get(`/api/products/${productId}/related`);
    return data;
};


// Fetches all products listed by a specific seller ID
// Using axios directly - consider switching to API instance
export const getProductsBySeller = async (sellerId) => {
    const { data } = await axios.get(`/api/products/seller/${sellerId}`);
    return data;
};

// Fetches all unique category names (Duplicate of getUniqueCategories, consider removing one)
// Using axios directly - consider switching to API instance
export const getCategories = async () => {
    const { data } = await axios.get('/api/products/categories');
    return data;
};

// Fetches unique brand names, optionally filtered by category
// Using axios directly - consider switching to API instance
export const getBrands = async (category = '') => {
    const { data } = await axios.get(`/api/products/brands?category=${encodeURIComponent(category)}`); // Ensure category is encoded
    return data;
};

// --- Functions requiring Authentication (Token likely handled by API instance interceptor) ---

// Fetches products created by the currently logged-in seller
export const getMyProducts = async () => {
    // Assumes API instance handles the token
    const { data } = await API.get('/products/myproducts');
    return data;
};

// Creates a new product
export const createProduct = async (productData) => {
    // Assumes API instance handles the token and sets Content-Type
    const { data } = await API.post('/products', productData);
    return data;
};

// Deletes a product by ID
export const deleteProduct = async (productId) => {
    // Assumes API instance handles the token
    await API.delete(`/products/${productId}`);
    // Typically, DELETE doesn't return significant data, maybe just a success message
};

// Updates an existing product
export const updateProduct = async (productId, productData) => {
    // Assumes API instance handles the token and sets Content-Type
    const { data } = await API.put(`/products/${productId}`, productData);
    return data;
};