const Favorite = require('../models/Favorite');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Add a restaurant or food to favorites
 * @route   POST /api/favorites
 * @access  Private
 */
const addToFavorites = async (req, res) => {
    try {
        const { restaurantId, foodId, type } = req.body;
        const userId = req.user._id;

        if (!type || !['restaurant', 'food'].includes(type)) {
            return sendError(res, 400, 'Invalid type. Must be restaurant or food');
        }

        if (type === 'restaurant' && !restaurantId) {
            return sendError(res, 400, 'Restaurant ID is required');
        }

        if (type === 'food' && !foodId) {
            return sendError(res, 400, 'Food ID is required');
        }

        // Check if already in favorites
        const existingFavorite = await Favorite.findOne({
            userId,
            ...(type === 'restaurant' ? { restaurantId } : { foodId })
        });

        if (existingFavorite) {
            return sendError(res, 400, `This ${type} is already in your favorites`);
        }

        const favorite = await Favorite.create({
            userId,
            type,
            ...(type === 'restaurant' ? { restaurantId } : { foodId })
        });

        return sendResponse(res, 201, 'Added to favorites successfully', favorite);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get user's favorites
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const favorites = await Favorite.find({ userId })
            .populate('restaurantId', 'name image address rating')
            .populate('foodId', 'name image price description rating');

        return sendResponse(res, 200, 'Favorites fetched successfully', favorites);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Remove from favorites
 * @route   DELETE /api/favorites/:id
 * @access  Private
 */
const removeFromFavorites = async (req, res) => {
    try {
        const favorite = await Favorite.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!favorite) {
            return sendError(res, 404, 'Favorite not found');
        }

        return sendResponse(res, 200, 'Removed from favorites successfully');
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    addToFavorites,
    getFavorites,
    removeFromFavorites
};
