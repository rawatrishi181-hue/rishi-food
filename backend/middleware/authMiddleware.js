const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeliveryPartner = require('../models/DeliveryPartner');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return sendError(res, 401, 'Not authorized to access this route');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check both User and DeliveryPartner models
        let person = await User.findById(decoded.id);
        if (!person) {
            person = await DeliveryPartner.findById(decoded.id);
        }

        if (!person) {
            return sendError(res, 401, 'User not found');
        }

        req.user = person;
        next();
    } catch (error) {
        console.error(error);
        return sendError(res, 401, 'Not authorized, token failed');
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                403,
                `User role ${req.user.role} is not authorized to access this route`
            );
        }
        next();
    };
};

const optionalProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        // If token fails, just proceed as guest
        next();
    }
};

module.exports = { protect, authorize, optionalProtect };
