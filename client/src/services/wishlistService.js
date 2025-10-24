import API from './api'; // We only need our API instance

// --- CORE WISHLIST FUNCTIONS ---

export const getMyWishlists = async () => {
    // API instance handles token and base URL
    const { data } = await API.get('/wishlist');
    return data;
};

export const createWishlist = async (name, validUntil) => {
    const body = { name, validUntil: validUntil || null };
    const { data } = await API.post('/wishlist', body);
    return data;
};

export const addItemToWishlist = async (wishlistId, productId) => {
    const { data } = await API.post(`/wishlist/${wishlistId}/items`, { productId });
    return data;
};

export const removeItemFromWishlist = async (wishlistId, itemId) => {
    await API.delete(`/wishlist/${wishlistId}/items/${itemId}`);
};

export const deleteWishlist = async (wishlistId) => {
    await API.delete(`/wishlist/${wishlistId}`);
};

// --- SHARING & VIEWING FUNCTIONS ---

export const getWishlistById = async (wishlistId) => {
    const { data } = await API.get(`/wishlist/${wishlistId}`);
    return data;
};

export const updateShareList = async (wishlistId, sharedWithIds) => {
    const { data } = await API.put(`/wishlist/${wishlistId}/share`, { sharedWith: sharedWithIds });
    return data;
};

export const getSharedWithMe = async () => {
    const { data } = await API.get('/wishlist/shared-with-me');
    return data;
};

// --- INTERACTIVE FUNCTIONS ---

export const rateWishlistItem = async (wishlistId, itemId, voteType) => {
    const { data } = await API.post(`/wishlist/${wishlistId}/items/${itemId}/rate`, { voteType });
    return data;
};

export const addNote = async (wishlistId, itemId, note) => {
    const { data } = await API.put(`/wishlist/${wishlistId}/items/${itemId}/note`, { note });
    return data;
};

export const addChatMessage = async (wishlistId, text) => {
    const { data } = await API.post(`/wishlist/${wishlistId}/chat`, { text });
    return data;
};

// --- PUBLIC SHARING FUNCTIONS ---

export const generateShareLink = async (wishlistId) => {
    const { data } = await API.post(`/wishlist/${wishlistId}/generate-share-link`, {});
    return data;
};

export const getSharedWishlist = async (shareToken) => {
    // This is a public route, so API interceptor won't add a token (which is correct)
    const { data } = await API.get(`/wishlist/shared/${shareToken}`);
    return data;
};

export const addComment = async (wishlistToken, productId, text) => {
    // API interceptor will add token if user is logged in
    const { data } = await API.post(`/wishlist/shared/${wishlistToken}/comment`, { productId, text });
    return data;
};

export const voteOnItem = async (wishlistToken, productId) => {
    // API interceptor will add token if user is logged in
    const { data } = await API.post(`/wishlist/shared/${wishlistToken}/vote`, { productId });
    return data;
};