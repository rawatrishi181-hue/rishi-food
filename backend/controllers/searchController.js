const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Global search for food and restaurants
 * @route   GET /api/search
 * @access  Public
 */
const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return sendError(res, 400, 'Search query is required');
        }

        const restaurants = await Restaurant.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { cuisine: { $regex: q, $options: 'i' } }
            ]
        }).limit(5);

        const foods = await Food.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        }).limit(5);

        return sendResponse(res, 200, 'Search results fetched', { restaurants, foods });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Search for restaurants only
 * @route   GET /api/search/restaurants
 * @access  Public
 */
const searchRestaurants = async (req, res) => {
    try {
        const { q } = req.query;
        const restaurants = await Restaurant.find({
            $or: [
                { name: { $regex: q || '', $options: 'i' } },
                { cuisine: { $regex: q || '', $options: 'i' } }
            ]
        });
        return sendResponse(res, 200, 'Restaurants fetched successfully', restaurants);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Search for foods only
 * @route   GET /api/search/foods
 * @access  Public
 */
const searchFoods = async (req, res) => {
    try {
        const { q } = req.query;
        const foods = await Food.find({
            $or: [
                { name: { $regex: q || '', $options: 'i' } },
                { description: { $regex: q || '', $options: 'i' } }
            ]
        }).populate('restaurantId', 'name');
        return sendResponse(res, 200, 'Foods fetched successfully', foods);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    globalSearch,
    searchRestaurants,
    searchFoods
};
