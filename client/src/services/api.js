import axios from 'axios';

// Use environment variable for API base URL
const API = axios.create({
  baseURL: 'http://server:5000/api',  // 'server' = name of backend service in docker-compose.yml
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
