const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all food items for a specific restaurant
 * @route   GET /restaurants/:restaurantId/menu
 * @access  Public
 */
const getRestaurantMenu = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { category } = req.query;

        const filter = { restaurantId, isAvailable: true };
        if (category) {
            filter.category = category;
        }

        const menu = await Food.find(filter).lean().select('name price image category description');

        return sendResponse(res, 200, 'Food items fetched successfully', menu);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get single food item details
 * @route   GET /foods/:id
 * @access  Public
 */
const getFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id)
            .populate('restaurantId', 'name city')
            .lean();

        if (!food) {
            return sendError(res, 404, `Food item not found with id of ${req.params.id}`);
        }

        return sendResponse(res, 200, 'Food item details fetched successfully', food);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Create new food item
 * @route   POST /foods
 * @access  Private (Admin or Restaurant Owner)
 */
const createFood = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        const { restaurantId } = req.body;

        // Check if restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return sendError(res, 404, `Restaurant not found with id of ${restaurantId}`);
        }

        // Ownership check: Only admin or the owner of this restaurant can add food
        if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
            return sendError(res, 403, 'Not authorized to add food to this restaurant');
        }

        const food = await Food.create(req.body);

        return sendResponse(res, 201, 'Food item created successfully', food);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Update food item details
 * @route   PUT /foods/:id
 * @access  Private (Admin or Restaurant Owner)
 */
const updateFood = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        let food = await Food.findById(req.params.id);
        if (!food) {
            return sendError(res, 404, `Food item not found with id of ${req.params.id}`);
        }

        const restaurantId = food.restaurantId;
        const restaurant = await Restaurant.findById(restaurantId);

        // Ownership check
        if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
            return sendError(res, 403, 'Not authorized to update this food item');
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            food[key] = req.body[key];
        });

        await food.save();

        return sendResponse(res, 200, 'Food item updated successfully', food);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Delete food item
 * @route   DELETE /foods/:id
 * @access  Private (Admin or Restaurant Owner)
 */
const deleteFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return sendError(res, 404, `Food item not found with id of ${req.params.id}`);
        }

        const restaurant = await Restaurant.findById(food.restaurantId);

        // Ownership check
        if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
            return sendError(res, 403, 'Not authorized to delete this food item');
        }

        await food.deleteOne();

        return sendResponse(res, 200, 'Food item deleted successfully', {});
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get all food items (optional filtering by category)
 * @route   GET /foods
 * @access  Public
 */
const getAllFoods = async (req, res) => {
    try {
        const { category } = req.query;
        let filter = {};

        if (category) {
            // Case-insensitive regex search for category
            filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        const foods = await Food.find(filter).populate('restaurantId', 'name city image');

        return sendResponse(res, 200, 'Food items fetched successfully', foods);
    } catch (error) {
        console.error('Error in getAllFoods:', error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get AI Food Recommendations for a user
 * @route   GET /foods/recommendations
 * @access  Private
 */
const getRecommendations = async (req, res) => {
    try {
        const Order = require('../models/Order');
        const userId = req.user?._id;

        // If guest or no user found, return trending items
        if (!userId) {
            const trending = await Food.find({ isAvailable: true }).sort('-rating').limit(6);
            return sendResponse(res, 200, 'Trending items for guest', trending);
        }

        // 1. Fetch user's past orders
        const pastOrders = await Order.find({ userId, status: 'delivered' }).populate('items.foodId');

        if (pastOrders.length === 0) {
            // Fallback: Get trending/popular items
            const trending = await Food.find({ isAvailable: true }).sort('-rating').limit(6);
            return sendResponse(res, 200, 'Trending items (fallback)', trending);
        }

        // 2. Frequency-based logic: Find most ordered categories
        const categoryFreq = {};
        pastOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.foodId && item.foodId.category) {
                    categoryFreq[item.foodId.category] = (categoryFreq[item.foodId.category] || 0) + 1;
                }
            });
        });

        const topCategories = Object.keys(categoryFreq).sort((a, b) => categoryFreq[b] - categoryFreq[a]).slice(0, 2);

        // 3. Recommend items from these categories that the user hasn't tried much, or top rated ones
        const recommended = await Food.find({
            category: { $in: topCategories },
            isAvailable: true
        }).sort('-rating').limit(6);

        return sendResponse(res, 200, 'AI Recommendations fetched', recommended);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Recommendation engine error');
    }
};

module.exports = {
    getAllFoods,
    getRestaurantMenu,
    getFood,
    createFood,
    updateFood,
    deleteFood,
    getRecommendations
};
