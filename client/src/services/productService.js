import API from './api'; // Assuming 'api.js' is in the same 'services' folder

// Fetches products with various filters
export const getProducts = async (filters = {}) => {
    const { category, brand, minPrice, maxPrice, searchTerm, rating } = filters;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (brand) params.append('brand', brand);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (searchTerm) params.append('keyword', searchTerm);
    if (rating) params.append('rating', rating);

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

// Submits a new product review
export const createProductReview = async (productId, reviewData) => {
    const formData = new FormData();
    formData.append('rating', reviewData.rating);
    formData.append('comment', reviewData.comment);

    if (reviewData.media && reviewData.media.length > 0) {
        for (let i = 0; i < reviewData.media.length; i++) {
            formData.append('media', reviewData.media[i]);
        }
    }

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };
    // The API interceptor will add the token
    const { data } = await API.post(`/products/${productId}/reviews`, formData, config);
    return data;
};

// Fetches details for a single product
export const getProductDetails = async (productId) => {
    const { data } = await API.get(`/products/${productId}`);
    return data;
};

// Fetches products related to a specific product
export const getRelatedProducts = async (productId) => {
    const { data } = await API.get(`/products/${productId}/related`);
    return data;
};

// Fetches all products listed by a specific seller ID
export const getProductsBySeller = async (sellerId) => {
    const { data } = await API.get(`/products/seller/${sellerId}`);
    return data;
};

// Fetches all unique category names
export const getCategories = async () => {
    const { data } = await API.get('/products/categories');
    return data;
};

// Fetches unique brand names, optionally filtered by category
export const getBrands = async (category = '') => {
    const { data } = await API.get(`/products/brands?category=${encodeURIComponent(category)}`);
    return data;
};

// --- Functions requiring Authentication ---

// Fetches products created by the currently logged-in seller
export const getMyProducts = async () => {
    const { data } = await API.get('/products/myproducts');
    return data;
};

// Creates a new product
export const createProduct = async (productData) => {
    const { data } = await API.post('/products', productData);
    return data;
};

// Deletes a product by ID
export const deleteProduct = async (productId) => {
    await API.delete(`/products/${productId}`);
};

// Updates an existing product
export const updateProduct = async (productId, productData) => {
    const { data } = await API.put(`/products/${productId}`, productData);
    return data;
};