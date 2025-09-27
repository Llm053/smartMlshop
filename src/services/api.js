import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Configuration de base d'axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
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

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.code === 'ECONNABORTED') {
      console.error('Timeout de la requête');
    } else if (!error.response) {
      console.error('Erreur de réseau - serveur inaccessible');
    }
    
    return Promise.reject(error);
  }
);

// Services pour l'authentification
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Services pour les utilisateurs
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Services pour les catégories
export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Services publics (sans authentification)
export const publicService = {
  getCategories: () => api.get('/public/categories'),
  getProducts: () => api.get('/public/products'),
  getAdmin: () => api.get('/public/admin'),
};

// Services pour les produits
export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getLowStock: (threshold = 10) => api.get(`/products/low-stock?threshold=${threshold}`),
  getStats: () => api.get('/products/stats'),
};

// Services pour les mouvements de stock
export const stockService = {
  getAll: () => api.get('/stock'),
  getById: (id) => api.get(`/stock/${id}`),
  create: (movementData) => api.post('/stock', movementData),
  getByProduct: (productId) => api.get(`/stock/product/${productId}`),
  getRecent: (limit = 10) => api.get(`/stock/recent?limit=${limit}`),
  getByType: (type) => api.get(`/stock/type/${type}`),
  getByDateRange: (startDate, endDate) => 
    api.get(`/stock/date-range?startDate=${startDate}&endDate=${endDate}`),
  getStats: () => api.get('/stock/stats'),
  getDailyStats: (days = 7) => api.get(`/stock/daily-stats?days=${days}`),
};

// Services pour les ventes
export const salesService = {
  createSale: (data) => api.post('/sales', data),
  getAll: () => api.get('/sales'),
  getById: (id) => api.get(`/sales/${id}`),
  cancel: (id) => api.put(`/sales/${id}/cancel`)
};

// Services pour les clients fidèles
export const loyalCustomerService = {
  getAll: () => api.get('/loyal-customers'),
  getById: (id) => api.get(`/loyal-customers/${id}`),
  create: (customerData) => api.post('/loyal-customers', customerData),
  update: (id, customerData) => api.put(`/loyal-customers/${id}`, customerData),
  delete: (id) => api.delete(`/loyal-customers/${id}`),
  search: (query) => api.get(`/loyal-customers/search?q=${encodeURIComponent(query)}`)
};

// Services pour les commandes en ligne
export const orderService = {
  // Routes publiques
  create: (orderData) => api.post('/orders/create', orderData),
  getStatus: (id) => api.get(`/orders/status/${id}`),
  
  // Routes admin
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  validate: (id) => api.put(`/orders/${id}/validate`),
  cancel: (id) => api.put(`/orders/${id}/cancel`)
};

export default api;
