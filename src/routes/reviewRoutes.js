const express = require('express');
const { createReview, getRestaurantReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:restaurantId', getRestaurantReviews);
router.post('/', protect, createReview);

module.exports = router;
