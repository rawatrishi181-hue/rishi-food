const Restaurant = require('../models/Restaurant');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');
const { getCache, setCache, deleteCache, deleteCacheByPattern, CACHE_KEYS, CACHE_TTL } = require('../utils/cache');

/**
 * @desc    Get all restaurants with search and filters
 * @route   GET /restaurants
 * @access  Public
 */
const getRestaurants = async (req, res) => {
    try {
        const { name, city, cuisine, rating, sort, page = 1, limit = 6 } = req.query;
        
        // Check cache for default list (no filters)
        if (!name && !city && !cuisine && !rating && page === '1' && limit === '6' && !sort) {
            const cachedData = await getCache(CACHE_KEYS.RESTAURANTS);
            if (cachedData) {
                return sendResponse(res, 200, 'Restaurants fetched successfully', cachedData);
            }
        }

        let query = {};

        // Search by name (case-insensitive)
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        // Filter by city
        if (city) {
            query.city = city;
        }

        // Filter by cuisine
        if (cuisine) {
            query.cuisine = { $in: cuisine.split(',') };
        }

        // Filter by rating
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;

        // Use countDocuments only with filters, otherwise estimate
        let total;
        if (Object.keys(query).length === 0) {
            total = await Restaurant.estimatedDocumentCount();
        } else {
            total = await Restaurant.countDocuments(query);
        }

        let restaurants = Restaurant.find(query).lean();

        // Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            restaurants = restaurants.sort(sortBy);
        } else {
            restaurants = restaurants.sort('-createdAt');
        }

        restaurants = restaurants.skip(startIndex).limit(limitNum);

        const data = await restaurants;

        const responseData = {
            count: data.length,
            total,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            },
            data
        };

        // Cache default list
        if (!name && !city && !cuisine && !rating && pageNum === 1 && limitNum === 6 && !sort) {
            await setCache(CACHE_KEYS.RESTAURANTS, responseData, CACHE_TTL.RESTAURANTS);
        }

        return sendResponse(res, 200, 'Restaurants fetched successfully', responseData);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get single restaurant
 * @route   GET /restaurants/:id
 * @access  Public
 */
const getRestaurant = async (req, res) => {
    try {
        const cacheKey = CACHE_KEYS.RESTAURANT(req.params.id);
        
        // Check cache first
        const cachedRestaurant = await getCache(cacheKey);
        if (cachedRestaurant) {
            return sendResponse(res, 200, 'Restaurant details fetched successfully', cachedRestaurant);
        }

        const restaurant = await Restaurant.findById(req.params.id).lean();

        if (!restaurant) {
            return sendError(res, 404, `Restaurant not found with id of ${req.params.id}`);
        }

        // Cache the restaurant data
        await setCache(cacheKey, restaurant, CACHE_TTL.RESTAURANTS);

        return sendResponse(res, 200, 'Restaurant details fetched successfully', restaurant);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Create new restaurant
 * @route   POST /restaurants
 * @access  Private/Admin
 */
const createRestaurant = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        // Add user to req.body
        req.body.ownerId = req.user._id;

        const restaurant = await Restaurant.create(req.body);

        // Clear restaurant list cache
        await deleteCache(CACHE_KEYS.RESTAURANTS);

        return sendResponse(res, 201, 'Restaurant created successfully', restaurant);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Update restaurant
 * @route   PUT /restaurants/:id
 * @access  Private/Admin
 */
const updateRestaurant = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        let restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return sendError(res, 404, `Restaurant not found with id of ${req.params.id}`);
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            restaurant[key] = req.body[key];
        });

        await restaurant.save();

        return sendResponse(res, 200, 'Restaurant updated successfully', restaurant);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Delete restaurant
 * @route   DELETE /restaurants/:id
 * @access  Private/Admin
 */
const getMyRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            return sendError(res, 404, 'Restaurant profile not found for current vendor');
        }

        return sendResponse(res, 200, 'Vendor restaurant profile fetched successfully', restaurant);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return sendError(res, 404, `Restaurant not found with id of ${req.params.id}`);
        }

        await restaurant.deleteOne();

        return sendResponse(res, 200, 'Restaurant deleted successfully', {});
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Update restaurant commission
 * @route   PUT /restaurants/:id/commission
 * @access  Private/Admin
 */
const updateCommission = async (req, res) => {
    try {
        const { commissionPercentage } = req.body;

        if (commissionPercentage < 0 || commissionPercentage > 100) {
            return sendError(res, 400, 'Commission percentage must be between 0 and 100');
        }

        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return sendError(res, 404, `Restaurant not found with id of ${req.params.id}`);
        }

        restaurant.commissionPercentage = commissionPercentage;
        await restaurant.save();

        return sendResponse(res, 200, 'Commission updated successfully', restaurant);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

module.exports = {
    getRestaurants,
    getRestaurant,
    getMyRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    updateCommission
};
