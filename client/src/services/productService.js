import axios from 'axios';
import API from './api';

// Fetches products with various filters
export const getProducts = async (filters = {}) => {
    // Correctly handles the new 'rating' filter
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

    // The api.js interceptor handles the token automatically
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    const { data } = await API.post(`/products/${productId}/reviews`, formData, config);
    return data;
};

export const getProductsBySeller = async (sellerId) => {
    const { data } = await axios.get(`/api/products/seller/${sellerId}`);
    return data;
};

export const getCategories = async () => {
    const { data } = await axios.get('/api/products/categories');
    return data;
};

// Pass a category to get specific brands, or leave it empty to get all brands
export const getBrands = async (category = '') => {
    const { data } = await axios.get(`/api/products/brands?category=${category}`);
    return data;
};

export const getMyProducts = async (token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const { data } = await axios.get('/api/products/myproducts', config);
    return data;
};

export const createProduct = async (productData, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    const { data } = await axios.post('/api/products', productData, config);
    return data;
};

export const deleteProduct = async (productId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    await axios.delete(`/api/products/${productId}`, config);
};

export const getProductDetails = async (productId) => {
    const { data } = await axios.get(`/api/products/${productId}`);
    return data;
};

export const updateProduct = async (productId, productData, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    const { data } = await axios.put(`/api/products/${productId}`, productData, config);
    return data;
};


export const getRelatedProducts = async (productId) => {
  const { data } = await axios.get(`/api/products/${productId}/related`);
  return data;
};