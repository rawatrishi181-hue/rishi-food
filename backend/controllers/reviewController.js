const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const { sendResponse, sendError } = require('../utils/responseHandler');

exports.createReview = async (req, res) => {
    try {
        const { restaurantId, rating, comment } = req.body;
        
        const review = await Review.create({
            userId: req.user._id,
            userName: req.user.name,
            restaurantId,
            rating,
            comment
        });

        // Update restaurant average rating
        const reviews = await Review.find({ restaurantId });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        
        await Restaurant.findByIdAndUpdate(restaurantId, {
            rating: avgRating.toFixed(1)
        });

        return sendResponse(res, 201, 'Review added successfully', review);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

exports.getRestaurantReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ restaurantId: req.params.restaurantId }).sort('-createdAt');
        return sendResponse(res, 200, 'Reviews fetched successfully', reviews);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};
