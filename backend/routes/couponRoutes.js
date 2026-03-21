const express = require('express');
const { getCoupons, applyCoupon, createCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCoupons);
router.post('/apply', protect, applyCoupon);
router.post('/', protect, authorize('admin'), createCoupon);

module.exports = router;
