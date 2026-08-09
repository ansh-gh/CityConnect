import axios from 'axios';
import { toast } from 'react-toastify';

// Create central Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (401 redirect, network errors)
axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful, return the data directly or wrap it
    return response;
  },
  (error) => {
    // Handle Auto Logout on 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Notify user of session expiry
      toast.error('Session expired. Redirecting to login...');
      
      // Redirect to login page
      setTimeout(() => {
       window.location.href = '/login';
      }, 1500);
    } else {
      // Toast notifications for other errors
      const errorMessage = error.response?.data?.message || error.message || 'A network error occurred. Please try again.';
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
