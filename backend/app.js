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
const path = require('path');

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
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/delivery-partners', deliveryPartnerRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/chat', chatRoutes);

// Base route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to Food Ordering API' });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to Food Ordering API' });
    });
}

// Error handling for 404
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return sendError(res, 404, 'Route not found');
    }
    next();
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    sendError(res, err.statusCode || 500, err.message || 'Internal Server Error');
});

module.exports = app;
