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
    } else if (config.url && config.url.startsWith('/delivery')) {
      // Delivery routes: most need a delivery-boy token, but the shared
      // /delivery/track/:orderId route can also be called by a logged-in
      // customer - so prefer deliveryToken, fall back to the customer token.
      const deliveryToken = localStorage.getItem('deliveryToken');
      const customerToken = localStorage.getItem('token');
      const tokenToUse = deliveryToken || customerToken;
      if (tokenToUse) {
        config.headers.Authorization = `Bearer ${tokenToUse}`;
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

// ========== DELIVERY BOY APIs ==========

export const deliveryAPI = {
  register: async (deliveryData) => {
    const response = await api.post('/delivery/register', deliveryData);
    if (response.data.token) {
      localStorage.setItem('deliveryToken', response.data.token);
      localStorage.setItem('deliveryBoy', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/delivery/login', credentials);
    if (response.data.token) {
      localStorage.setItem('deliveryToken', response.data.token);
      localStorage.setItem('deliveryBoy', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('deliveryToken');
    localStorage.removeItem('deliveryBoy');
  },

  getStoredDeliveryBoy: () => {
    const deliveryBoy = localStorage.getItem('deliveryBoy');
    return deliveryBoy ? JSON.parse(deliveryBoy) : null;
  },

  getProfile: async () => {
    const response = await api.get('/delivery/profile');
    return response.data;
  },

  // "Go Online" / "Go Offline" toggle
  toggleOnline: async () => {
    const response = await api.put('/delivery/toggle-online');
    return response.data;
  },

  // Send live GPS location (call this periodically, e.g. every 10-15s while online)
  updateLocation: async (latitude, longitude) => {
    const response = await api.put('/delivery/location', { latitude, longitude });
    return response.data;
  },

  // Nearby unassigned orders the delivery boy can accept
  getAvailableOrders: async () => {
    const response = await api.get('/delivery/available-orders');
    return response.data;
  },

  acceptOrder: async (orderId) => {
    const response = await api.put(`/delivery/orders/${orderId}/accept`);
    return response.data;
  },

  getMyDeliveries: async () => {
    const response = await api.get('/delivery/my-deliveries');
    return response.data;
  },

  updateDeliveryStatus: async (orderId, status) => {
    const response = await api.put(`/delivery/orders/${orderId}/status`, { status });
    return response.data;
  },

  getEarnings: async () => {
    const response = await api.get('/delivery/earnings');
    return response.data;
  },

  // Live tracking - pickup point, drop point, delivery boy's current location.
  // Callable by either the customer who owns the order, or the assigned delivery boy.
  trackOrder: async (orderId) => {
    const response = await api.get(`/delivery/track/${orderId}`);
    return response.data;
  },

  // ---- Admin ----
  getAllDeliveryBoys: async () => {
    const adminToken = localStorage.getItem('token');
    const response = await api.get('/delivery', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  },

  updateDeliveryBoyStatus: async (id, status) => {
    const adminToken = localStorage.getItem('token');
    const response = await api.put(`/delivery/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  },
};

// ========== REVIEW APIs ==========

export const reviewsAPI = {
  getProductReviews: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  create: async (productId, reviewData) => {
    const response = await api.post(`/reviews/${productId}`, reviewData);
    return response.data;
  },

  getMyReviews: async () => {
    const response = await api.get('/reviews/myreviews');
    return response.data;
  },

  update: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default api;