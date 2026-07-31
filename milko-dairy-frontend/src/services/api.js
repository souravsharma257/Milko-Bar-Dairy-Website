import axios from 'axios';

// Base URL
const API_URL = process.env.REACT_APP_API_URL || 'https://milko-bar-dairy-website.onrender.com/api';

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
    // Check if this is a vendor route
    if (config.url && config.url.startsWith('/vendors')) {
      const vendorToken = localStorage.getItem('vendorToken');
      if (vendorToken) {
        config.headers.Authorization = `Bearer ${vendorToken}`;
      }
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== AUTH APIs ==========

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ========== PRODUCTS APIs ==========

export const productsAPI = {
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

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  updatePrice: async (id, price) => {
    const response = await api.patch(`/products/${id}/price`, { price });
    return response.data;
  },
};

// ========== ORDERS APIs ==========

export const ordersAPI = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  updatePayment: async (id, paymentStatus) => {
    const response = await api.put(`/orders/${id}/payment`, { paymentStatus });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

// ========== VENDOR APIs ==========

export const vendorAPI = {
  register: async (vendorData) => {
    const response = await api.post('/vendors/register', vendorData);
    if (response.data.token) {
      localStorage.setItem('vendorToken', response.data.token);
      localStorage.setItem('vendor', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/vendors/login', credentials);
    if (response.data.token) {
      localStorage.setItem('vendorToken', response.data.token);
      localStorage.setItem('vendor', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendor');
  },

  getStoredVendor: () => {
    const vendor = localStorage.getItem('vendor');
    return vendor ? JSON.parse(vendor) : null;
  },

  getAllVendors: async () => {
    const adminToken = localStorage.getItem('token');
    const response = await api.get('/vendors', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  },

  getNearbyVendors: async (lat, lng) => {
    const url = lat && lng ? `/vendors/nearby?lat=${lat}&lng=${lng}` : '/vendors/nearby';
    const response = await api.get(url);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/vendors/profile');
    return response.data;
  },

  updateVendorStatus: async (id, status) => {
    const adminToken = localStorage.getItem('token');
    const response = await api.put(`/vendors/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get('/vendors/products');
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/vendors/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/vendors/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/vendors/products/${id}`);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/vendors/orders');
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/vendors/orders/${id}/status`, { status });
    return response.data;
  },

  getEarnings: async () => {
    const response = await api.get('/vendors/earnings');
    return response.data;
  },
};

export default api;