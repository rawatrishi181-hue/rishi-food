const User = require('../models/User');
const generateToken = require('../utils/token');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/mail.service');
const welcomeTemplate = require('../templates/emails/welcome.template');

/**
 * @desc    Register a new user
 * @route   POST /auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        const { name, email, password, phone, role, address } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return sendError(res, 400, 'User already exists');
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role,
            address
        });

        if (user) {
            // Send Welcome Email (Non-blocking)
            try {
                const html = welcomeTemplate(user.name);
                sendEmail(user.email, 'Welcome to Rishi Food!', html);
            } catch (error) {
                console.error('Welcome email failed:', error);
            }

            return sendResponse(res, 201, 'User registered successfully', {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                token: generateToken(user._id),
                createdAt: user.createdAt
            });
        } else {
            return sendError(res, 400, 'Invalid user data');
        }
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Login user
 * @route   POST /auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            return sendResponse(res, 200, 'Login successful', {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            return sendError(res, 401, 'Invalid email or password');
        }
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get user profile
 * @route   GET /auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            return sendResponse(res, 200, 'User profile fetched successfully', {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                createdAt: user.createdAt
            });
        } else {
            return sendError(res, 404, 'User not found');
        }
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

module.exports = {
    register,
    login,
    getProfile
};
