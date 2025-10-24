import axios from 'axios';

// 1. Create the axios instance with the Base URL from Render
const API = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`
});

// 2. This "interceptor" automatically adds the auth token
API.interceptors.request.use((req) => {
    // Make sure 'userInfo' matches what you use in localStorage
    const userInfo = localStorage.getItem('userInfo'); 
    
    if (userInfo) {
        try {
            const token = JSON.parse(userInfo).token;
            if (token) {
                req.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Failed to parse userInfo or get token", error);
        }
    }
    return req;
});

export default API;