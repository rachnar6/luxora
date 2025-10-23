import API from './api'; // Assuming API is your configured axios instance

const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    return data;
};

const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', { name, email, password });
    return data;
};

const logout = () => {
    // AuthContext handles removing from localStorage
};

// --- THIS IS THE NEW FUNCTION ---
const getProfile = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // This endpoint gets the freshest user data from the database
    const { data } = await API.get('/auth/profile', config);
    return data;
};
// -----------------------------

const updateProfile = async (formData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const { data } = await API.put('/users/profile', formData, config);
    return data;
};

const deleteProfile = async (token) => {
     const config = {
         headers: { Authorization: `Bearer ${token}` }
     };
    const { data } = await API.delete('/users/profile', config);
    return data;
};

const forgotPassword = async (email) => {
    const { data } = await API.post('/auth/forgotpassword', { email });
    return data;
};

const resetPassword = async (token, password) => {
    const { data } = await API.post(`/auth/resetpassword/${token}`, { password });
    return data;
};

export {
    login,
    register,
    logout,
    updateProfile,
    deleteProfile,
    forgotPassword,
    resetPassword,
    getProfile // <-- Make sure to export the new function
};