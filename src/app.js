const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const foodRoutes = require('./routes/foodRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const addressRoutes = require('./routes/addressRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const searchRoutes = require('./routes/searchRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const deliveryPartnerRoutes = require('./routes/deliveryPartnerRoutes');
const supportRoutes = require('./routes/supportRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { sendError } = require('./utils/responseHandler');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/auth', authRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/foods', foodRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/addresses', addressRoutes);
app.use('/payments', paymentRoutes);
app.use('/coupons', couponRoutes);
app.use('/search', searchRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/banners', bannerRoutes);
app.use('/delivery-partners', deliveryPartnerRoutes);
app.use('/support', supportRoutes);
app.use('/chat', chatRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Food Ordering API' });
});

// Error handling for 404
app.use((req, res, next) => {
    sendError(res, 404, 'Route not found');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    sendError(res, err.statusCode || 500, err.message || 'Internal Server Error');
});

module.exports = app;
