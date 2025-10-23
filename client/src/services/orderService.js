import axios from 'axios';
// Assuming API is your configured axios instance with a baseURL
// If not, you may need to add auth headers to each function.
import API from './api'; 

const addOrderItems = async (orderData, token) => {
    const config = { 
        headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
        } 
    };
    const { data } = await axios.post('/api/orders', orderData, config);
    return data;
};

const getMyOrders = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get('/api/orders/myorders', config);
    return data;
};

const getOrderDetails = async (id, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get(`/api/orders/${id}`, config);
    return data;
};

const getPaypalClientId = async () => {
    const { data } = await API.get('/orders/config/paypal');
    return data;
};

const updateOrderToPaid = async (orderId, paymentResult, token) => {
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    const { data } = await axios.put(`/api/orders/${orderId}/pay`, paymentResult, config);
    return data;
};

const getMySales = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get('/api/orders/mysales', config);
    return data;
};

// ✅ ADDED: Function to get Razorpay Key ID
const getRazorpayKeyId = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get('/api/orders/config/razorpay', config);
    return data.keyId;
};

// ✅ ADDED: Function to create the Razorpay order on the backend
const createRazorpayOrder = async (order, token) => {
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    const { data } = await axios.post('/api/orders/create-razorpay-order', order, config);
    return data;
};

const updateOrderStatus = async (orderId, status, token) => {
    const config = { 
        headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
        } 
    };
    const { data } = await axios.put(`/api/orders/${orderId}/status`, { status }, config);
    return data;
};

const requestReturn = async (orderId, itemId, reason /*, token - Handled by API? */) => {
    const requestBody = { reason: reason }; // Send reason in the body
    // PUT /api/orders/:orderId/items/:itemId/return
    const { data } = await API.put(`/orders/${orderId}/items/${itemId}/return`, requestBody);
    return data; // Return updated order
};

export { 
    addOrderItems, 
    getMyOrders, 
    getOrderDetails, 
    getPaypalClientId, 
    updateOrderToPaid, 
    getMySales,
    getRazorpayKeyId,
    createRazorpayOrder,
    updateOrderStatus,
    requestReturn
};