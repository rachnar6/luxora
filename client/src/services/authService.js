// client/src/services/authService.js
// Authentication service functions

import API from './api';

const login = async (email, password) => {
  const { data } = await API.post('/auth/login', { email, password });
  localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
};

const register = async (name, email, password) => {
  const { data } = await API.post('/auth/register', { name, email, password });
  localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
};

const logout = () => {
  localStorage.removeItem('userInfo');
};

const updateProfile = async (userData) => {
    const { data } = await API.put('/auth/profile', userData);
    // Update localStorage with the new user info (which includes a new token)
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
};

const deleteProfile = async () => {
    const { data } = await API.delete('/users/profile');
    return data;
};

const forgotPassword = async (email) => {
    const { data } = await API.post('/auth/forgotpassword', { email });
    return data;
};

// 👇 ADD THIS
const resetPassword = async (token, password) => {
    const { data } = await API.post(`/auth/resetpassword/${token}`, { password });
    return data;
};

export { login, register, logout, updateProfile, deleteProfile, forgotPassword, resetPassword };
