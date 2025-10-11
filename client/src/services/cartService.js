import API from './api';

// Get the user's cart
export const getCart = async () => {
    const { data } = await API.get('/cart');
    return data;
};

// Add an item to the cart
export const addToCart = async (productId, qty) => {
    const { data } = await API.post('/cart', { productId, qty });
    return data;
};

// Update an item's quantity in the cart
export const updateCartItem = async (productId, qty) => {
    const { data } = await API.put(`/cart/${productId}`, { qty });
    return data;
};

// Remove an item from the cart
export const removeFromCart = async (productId) => {
    const { data } = await API.delete(`/cart/${productId}`);
    return data;
};