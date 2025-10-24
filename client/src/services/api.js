import axios from 'axios';

// Use environment variable for API base URL
const API = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`, // <-- THIS IS THE FIX
});

// Attach token before each request
API.interceptors.request.use((req) => {
    const userInfo = localStorage.getItem('userInfo'); 
   
    if (userInfo) {
      try {
        const token = JSON.parse(userInfo).token;
        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to parse userInfo or get token from localStorage", error);
      }
    }
   
    return req;
});

export default API;