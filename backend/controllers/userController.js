const User = require('../models/User');
const Order = require('../models/Order');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all users
 * @route   GET /users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        return sendResponse(res, 200, 'Users fetched successfully', users);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get user by ID
 * @route   GET /users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return sendError(res, 404, 'User not found');
        }
        return sendResponse(res, 200, 'User fetched successfully', user);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Update user
 * @route   PUT /users/:id
 * @access  Private
 */
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        // Only user themselves or admin can update
        if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendError(res, 403, 'Not authorized to update this user');
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        return sendResponse(res, 200, 'User updated successfully', updatedUser);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        await user.deleteOne();
        return sendResponse(res, 200, 'User deleted successfully', {});
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get user orders
 * @route   GET /users/:id/orders
 * @access  Private
 */
const getUserOrders = async (req, res) => {
    try {
        // Only user themselves or admin can see orders
        if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendError(res, 403, 'Not authorized to view these orders');
        }

        const orders = await Order.find({ userId: req.params.id }).sort('-createdAt');
        return sendResponse(res, 200, 'User orders fetched successfully', orders);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Update user address
 * @route   PUT /users/:id/address
 * @access  Private
 */
const updateUserAddress = async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return sendError(res, 400, 'Address is required');
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendError(res, 403, 'Not authorized to update this user');
        }

        user.address = address;
        await user.save();

        return sendResponse(res, 200, 'User address updated successfully', user);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserOrders,
    updateUserAddress
};
