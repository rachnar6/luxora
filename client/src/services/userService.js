import API from './api'; // We only need our API instance

// No 'token' needed in parameters, the interceptor handles it.

export const applyToBeSeller = async () => {
    const { data } = await API.post('/users/apply-seller', {});
    return data;
};

export const searchUsers = async (keyword) => {
    const { data } = await API.get(`/users/search?keyword=${keyword}`);
    return data;
};

export const getSellerProfile = async () => {
    const { data } = await API.get('/users/seller/profile');
    return data;
};

export const updateSellerProfile = async (profileData) => {
    const { data } = await API.put('/users/seller/profile', profileData);
    return data;
};

export const getUserAddresses = async () => {
    // This was one of your 404 errors
    const { data } = await API.get('/users/addresses');
    return data;
};

export const addShippingAddress = async (address) => {
    const { data } = await API.post('/users/addresses', address);
    return data;
};