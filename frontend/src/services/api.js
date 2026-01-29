import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add token to requests
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

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    search: (query) => api.get('/products/search', { params: { q: query } }),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart', data),
    update: (data) => api.put('/cart', data),
    remove: (productId) => api.delete(`/cart/${productId}`),
    clear: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
    create: () => api.post('/orders'),
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
};

// Chat API
export const chatAPI = {
    getConversation: () => api.get('/chat/conversation'),
    getAdminConversations: () => api.get('/chat/admin/conversations'),
    getMessages: (conversationId) => api.get(`/chat/${conversationId}/messages`),
    sendMessage: (conversationId, data) => api.post(`/chat/${conversationId}/messages`, data),
    markAsRead: (conversationId) => api.patch(`/chat/${conversationId}/read`),
    getUnreadCount: () => api.get('/chat/admin/unread-count'),
    upload: (formData) => api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Settings API
export const settingsAPI = {
    updateTheme: (newTheme) => api.put('/settings', { activeTheme: newTheme }),
};

// Coupons API
export const couponAPI = {
    getAll: () => api.get('/coupons'),
    create: (data) => api.post('/coupons', data),
    delete: (id) => api.delete(`/coupons/${id}`),
};

export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

// Reviews API
export const reviewsAPI = {
    getReviews: (productId, params) => api.get(`/reviews/${productId}`, { params }),
    canReview: (productId) => api.get(`/reviews/${productId}/can-review`),
    createReview: (productId, data) => api.post(`/reviews/${productId}`, data),
    updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
    deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Admin API
export const adminAPI = {
    getAllOrders: () => api.get('/admin/orders'),
    updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}`, data),
    getStats: () => api.get('/admin/stats'),
    getRevenue: (params) => api.get('/admin/revenue', { params }),
    getInventory: () => api.get('/admin/inventory'),
};

export default api;
