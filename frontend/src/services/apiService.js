import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
};

export const restaurantService = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  getMenu: (id) => api.get(`/restaurants/${id}/menu`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

export const foodService = {
  create: (data) => api.post('/foods', data),
  update: (id, data) => api.put(`/foods/${id}`, data),
  delete: (id) => api.delete(`/foods/${id}`),
  getRecommendations: () => api.get('/foods/recommendations'),
};

export const cartService = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateQuantity: (id, data) => api.put(`/cart/update/${id}`, data),
  removeItem: (id) => api.delete(`/cart/remove/${id}`),
  clear: () => api.delete('/cart/clear'),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getFoods: (id) => api.get(`/categories/${id}/foods`),
};

export const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getSalesData: () => api.get('/admin/sales'),
  getOrdersDistribution: () => api.get('/admin/orders-distribution'),
  getTopRestaurants: () => api.get('/admin/top-restaurants'),
  getTopFoods: () => api.get('/admin/top-foods'),
  getOrdersAnalytics: () => api.get('/admin/orders-analytics'),
  getRecentOrders: () => api.get('/admin/recent-orders'),
  getAnalytics: () => api.get('/admin/analytics'),
};

export const notificationService = {
  get: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const searchService = {
  global: (q) => api.get('/search', { params: { q } }),
  restaurants: (q) => api.get('/search/restaurants', { params: { q } }),
  foods: (q) => api.get('/search/foods', { params: { q } }),
};

export const addressService = {
  getAll: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
};

export const favoriteService = {
  getAll: () => api.get('/favorites'),
  toggle: (restaurantId) => api.post('/favorites/toggle', { restaurantId }),
  check: (restaurantId) => api.get(`/favorites/check/${restaurantId}`),
};

export const commonService = {
  subscribeNewsletter: (email) => api.post('/subscribe', { email }),
};

export const deliveryPartnerService = {
  getAll: (params) => api.get('/delivery-partners', { params }),
  create: (data) => api.post('/delivery-partners', data),
  update: (id, data) => api.put(`/delivery-partners/${id}`, data),
  assignOrder: (data) => api.post('/delivery-partners/assign', data),
  updateLocation: (data) => api.post('/delivery/location', data),
};

export const supportService = {
  getFAQs: () => api.get('/support/faqs'),
  createTicket: (data) => api.post('/support/tickets', data),
  getMyTickets: () => api.get('/support/tickets/my'),
  getAllTickets: () => api.get('/support/tickets'),
  updateTicket: (id, data) => api.put(`/support/tickets/${id}`, data),
  createFAQ: (data) => api.post('/support/faqs', data),
  deleteFAQ: (id) => api.delete(`/support/faqs/${id}`),
};

export const couponService = {
  getAll: () => api.get('/coupons'),
  apply: (code, orderAmount) => api.post('/coupons/apply', { code, orderAmount }),
};

export const reviewService = {
  getByRestaurant: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
};

export const chatService = {
  getHistory: (orderId) => api.get(`/chat/${orderId}`),
  send: (data) => api.post('/chat', data),
};
