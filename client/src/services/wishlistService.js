import axios from 'axios';

const API_URL = '/api/wishlist';

// --- CORE WISHLIST FUNCTIONS ---

export const getMyWishlists = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get(API_URL, config);
  return data;
};

export const createWishlist = async (name, validUntil, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const body = { name, validUntil: validUntil || null };
  const { data } = await axios.post(API_URL, body, config);
  return data;
};

export const addItemToWishlist = async (wishlistId, productId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.post(`${API_URL}/${wishlistId}/items`, { productId }, config);
  return data;
};

export const removeItemFromWishlist = async (wishlistId, itemId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  await axios.delete(`${API_URL}/${wishlistId}/items/${itemId}`, config);
};

export const deleteWishlist = async (wishlistId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(`${API_URL}/${wishlistId}`, config);
};


// --- SHARING & VIEWING FUNCTIONS ---

export const getWishlistById = async (wishlistId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get(`${API_URL}/${wishlistId}`, config);
    return data;
};

export const updateShareList = async (wishlistId, sharedWithIds, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.put(`${API_URL}/${wishlistId}/share`, { sharedWith: sharedWithIds }, config);
    return data;
};

export const getSharedWithMe = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get(`${API_URL}/shared-with-me`, config);
    return data;
};


// --- INTERACTIVE FUNCTIONS ---

export const rateWishlistItem = async (wishlistId, itemId, voteType, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.post(`${API_URL}/${wishlistId}/items/${itemId}/rate`, { voteType }, config);
  return data;
};

export const addNote = async (wishlistId, itemId, note, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.put(`${API_URL}/${wishlistId}/items/${itemId}/note`, { note }, config);
    return data;
};

export const addChatMessage = async (wishlistId, text, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(`${API_URL}/${wishlistId}/chat`, { text }, config);
    return data;
};


// --- PUBLIC SHARING FUNCTIONS ---

export const generateShareLink = async (wishlistId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(`${API_URL}/${wishlistId}/generate-share-link`, {}, config);
    return data;
};

export const getSharedWishlist = async (shareToken) => {
    const { data } = await axios.get(`${API_URL}/shared/${shareToken}`);
    return data;
};

export const addComment = async (token, wishlistToken, productId, text) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(`${API_URL}/shared/${wishlistToken}/comment`, { productId, text }, config);
    return data;
};

// ✅ RESTORED: This function was missing and is now added back.
export const voteOnItem = async (token, wishlistToken, productId) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(`${API_URL}/shared/${wishlistToken}/vote`, { productId }, config);
    return data;
};