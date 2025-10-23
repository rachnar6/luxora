import axios from 'axios';
import API from './api'; 


const API_URL = '/api/users';

/**
 * This function sends a request for the current user to apply to be a seller.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} - The updated user object.
 */
export const applyToBeSeller = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const { data } = await axios.post(`${API_URL}/apply-seller`, {}, config);
  return data;
};

/**
 * Searches for users by a keyword (name or email).
 * @param {string} keyword - The search term.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Array>} - An array of user objects matching the search.
 */
export const searchUsers = async (keyword, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get(`${API_URL}/search?keyword=${keyword}`, config);
    return data;
};

export const getSellerProfile = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // This matches the backend route we created: GET /api/users/seller/profile
    const { data } = await API.get('/users/seller/profile', config);
    return data;
};

// --- ADD THIS FUNCTION ---
export const updateSellerProfile = async (profileData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // This matches the backend route we created: PUT /api/users/seller/profile
    const { data } = await API.put('/users/seller/profile', profileData, config);
    return data;
};

/**
 * Fetches the logged-in user's saved shipping addresses from the database.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Array>} - An array of saved address objects.
 */
export const getUserAddresses = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get(`${API_URL}/addresses`, config);
    return data;
};

/**
 * Adds a new shipping address to the logged-in user's profile in the database.
 * @param {object} address - The address object to save.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Array>} - The updated list of all saved addresses for the user.
 */
export const addShippingAddress = async (address, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(`${API_URL}/addresses`, address, config);
    return data;
};

