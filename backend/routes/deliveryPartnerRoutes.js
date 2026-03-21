const express = require('express');
const router = express.Router();
const { 
    sendOTP, 
    verifyOTP, 
    getDashboard, 
    updateProfile, 
    acceptOrder, 
    completeDelivery 
} = require('../controllers/deliveryPartnerController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes (require partner login)
router.get('/dashboard', protect, getDashboard);
router.put('/profile', protect, updateProfile);
router.post('/orders/accept', protect, acceptOrder);
router.post('/orders/complete', protect, completeDelivery);

module.exports = router;
