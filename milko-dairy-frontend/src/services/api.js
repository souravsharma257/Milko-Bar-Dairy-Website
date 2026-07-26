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

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
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

  // Create product with image (Admin)
  create: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product with image (Admin)
  update: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product (Admin)
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Update price (Admin)
  updatePrice: async (id, price) => {
    const response = await api.patch(`/products/${id}/price`, { price });
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

  // Get order by ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Admin)
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Update payment status (Admin)
  updatePayment: async (id, paymentStatus) => {
    const response = await api.put(`/orders/${id}/payment`, { paymentStatus });
    return response.data;
  },

  // Delete order (Admin)
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};
// ========== VENDOR APIs ==========

export const vendorAPI = {
  // Register Vendor
  register: async (vendorData) => {
    const response = await api.post('/vendors/register', vendorData);
    if (response.data.token) {
      localStorage.setItem('vendorToken', response.data.token);
      localStorage.setItem('vendor', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Login Vendor
  login: async (credentials) => {
    const response = await api.post('/vendors/login', credentials);
    if (response.data.token) {
      localStorage.setItem('vendorToken', response.data.token);
      localStorage.setItem('vendor', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Logout Vendor
  logout: () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendor');
  },

  // Stored Vendor
  getStoredVendor: () => {
    const vendor = localStorage.getItem('vendor');
    return vendor ? JSON.parse(vendor) : null;
  },

  // Get All Vendors
  getAllVendors: async () => {
    const response = await api.get('/vendors');
    return response.data;
  },

  // Get Vendor Profile
  getProfile: async () => {
    const response = await api.get('/vendors/profile');
    return response.data;
  },

  // Update Vendor Status
  updateVendorStatus: async (id, status) => {
    const response = await api.patch(`/vendors/${id}/status`, { status });
    return response.data;
  },

  // Vendor's own products
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

  // Vendor's own orders
  getOrders: async () => {
    const response = await api.get('/vendors/orders');
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/vendors/orders/${id}/status`, { status });
    return response.data;
  },

  // Vendor earnings
  getEarnings: async () => {
    const response = await api.get('/vendors/earnings');
    return response.data;
  },
};

export default api;