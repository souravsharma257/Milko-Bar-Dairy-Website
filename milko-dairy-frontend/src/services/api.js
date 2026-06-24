import axios from 'axios';

// Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== AUTH APIs ==========

export const authAPI = {
  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ========== PRODUCTS APIs ==========

export const productsAPI = {
  // Get all products with filters
  getAll: async (filters = {}) => {
    const { category, search, minPrice, maxPrice, sort } = filters;
    
    let url = '/products?';
    if (category && category !== 'All') url += `category=${category}&`;
    if (search) url += `search=${search}&`;
    if (minPrice) url += `minPrice=${minPrice}&`;
    if (maxPrice) url += `maxPrice=${maxPrice}&`;
    if (sort) url += `sort=${sort}&`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single product
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

// ========== ORDERS APIs ==========

export const ordersAPI = {
  // Create order
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get my orders
  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  // Get all orders (Admin)
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Update order status (Admin)
  updateStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

// ========== REVIEWS APIs ==========

export const reviewsAPI = {
  // Create review
  create: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get product reviews
  getProductReviews: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  // Get my reviews
  getMyReviews: async () => {
    const response = await api.get('/reviews/myreviews');
    return response.data;
  },

  // Check if can review
  canReview: async (productId) => {
    const response = await api.get(`/reviews/can-review/${productId}`);
    return response.data;
  },

  // Update review
  update: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete review
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Vote review
  vote: async (reviewId, voteType) => {
    const response = await api.put(`/reviews/${reviewId}/vote`, { voteType });
    return response.data;
  },
};

export default api;