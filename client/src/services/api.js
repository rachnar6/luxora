import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// This interceptor runs before every request is sent.
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  
  if (userInfo) {
    try {
      const token = JSON.parse(userInfo).token;
      if (token) {
        // Attach the token to the Authorization header
        req.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to parse userInfo or get token from localStorage", error);
    }
  }
  
  return req;
});

export default API;