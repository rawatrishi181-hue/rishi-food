import axios from 'axios';

// Dynamically set baseURL for deployment and local dev
const defaultLocalURL = 'http://localhost:5000/api';
const envURL = import.meta.env.VITE_API_URL;
const baseURL = envURL || defaultLocalURL;

// Log helpful error if backend cannot be reached
console.info('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 15000, // 15s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor includes auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor handles errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      // Network or CORS error
      console.error('Network error: could not reach API at', baseURL, error.message);
      return Promise.reject(new Error('Network error: Please check backend server and API URL')); 
    }

    const message = error.response.data?.message || error.message || 'Something went wrong';
    if (error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
