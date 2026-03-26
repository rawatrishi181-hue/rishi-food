const express = require('express');
const router = express.Router();
const { 
    sendOTP, 
    verifyOTP, 
    getDashboard, 
    updateProfile, 
    acceptOrder, 
    completeDelivery,
    getAllPartners,
    createPartner,
    updatePartner
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

// Admin management of partners
const { authorize } = require('../middleware/authMiddleware');
router.get('/', protect, authorize('admin'), getAllPartners);
router.post('/', protect, authorize('admin'), createPartner);
router.put('/:id', protect, authorize('admin'), updatePartner);

module.exports = router;
