const Restaurant = require('../models/Restaurant');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all restaurants with search and filters
 * @route   GET /restaurants
 * @access  Public
 */
const getRestaurants = async (req, res) => {
    try {
        const { name, city, cuisine, rating, sort } = req.query;
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

        let restaurants = Restaurant.find(query);

        // Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            restaurants = restaurants.sort(sortBy);
        } else {
            restaurants = restaurants.sort('-createdAt');
        }

        const data = await restaurants;

        return sendResponse(res, 200, 'Restaurants fetched successfully', {
            count: data.length,
            data
        });
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
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return sendError(res, 404, `Restaurant not found with id of ${req.params.id}`);
        }

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

module.exports = {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};
