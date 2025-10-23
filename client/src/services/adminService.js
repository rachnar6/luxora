import axios from 'axios';
import API from './api'; // ** MUST import API from './api', NOT axios **

// --- USER FUNCTIONS ---
export const getUsers = async () => {
    const { data } = await API.get('/admin/users');
    return data;
};

export const deleteUser = async (id) => {
    const { data } = await API.delete(`/admin/users/${id}`);
    return data;
};

export const getUserDetails = async (id) => {
    const { data } = await API.get(`/admin/users/${id}`);
    return data;
};

export const updateUser = async (id, userData) => {
    const { data } = await API.put(`/admin/users/${id}`, userData);
    return data;
};

// --- PRODUCT FUNCTIONS ---
export const getProducts = async () => {
    const { data } = await API.get('/admin/products');
    return data;
};

export const deleteProduct = async (id) => {
    const { data } = await API.delete(`/admin/products/${id}`);
    return data;
};

export const createProduct = async () => {
    const { data } = await API.post('/admin/products', {});
    return data;
};

export const getProductDetails = async (id) => {
    const { data } = await API.get(`/products/${id}`);
    return data;
};

export const updateProduct = async (id, productData) => {
    const { data } = await API.put(`/admin/products/${id}`, productData);
    return data;
};

export const uploadProductImage = async (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const { data } = await API.post('/upload', formData, config);
    return data;
};

// --- ORDER FUNCTIONS ---
export const getOrders = async () => {
    const { data } = await API.get('/admin/orders');
    return data;
};

export const deliverOrder = async (id) => {
    const { data } = await API.put(`/admin/orders/${id}/deliver`, {});
    return data;
};

export const getSellerApplications = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.get('/api/admin/seller-applications', config);
  return data;
};

// Approve a seller application
export const approveSellerApplication = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.put(`/api/admin/seller-applications/${userId}/approve`, {}, config);
  return data;
};

// Reject a seller application
export const rejectSellerApplication = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.put(`/api/admin/seller-applications/${userId}/reject`, {}, config);
  return data;
};

export const getSellers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // This calls the specific backend route for sellers
  const { data } = await axios.get('/api/admin/sellers', config);
  return data;
};

export const updateOrderStatus = async (orderId, status, token) => {
    const config = { 
        headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
        } 
    };
    const { data } = await axios.put(`/api/orders/${orderId}/status`, { status }, config);
    return data;
};
