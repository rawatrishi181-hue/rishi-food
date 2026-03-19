const Coupon = require('../models/Coupon');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all active coupons
 * @route   GET /coupons
 * @access  Public
 */
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ 
            isActive: true, 
            expiryDate: { $gte: new Date() } 
        });
        return sendResponse(res, 200, 'Coupons fetched successfully', coupons);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Apply a coupon code
 * @route   POST /coupons/apply
 * @access  Private
 */
exports.applyCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(), 
            isActive: true,
            expiryDate: { $gte: new Date() }
        });

        if (!coupon) {
            return sendError(res, 404, 'Invalid or expired coupon code');
        }

        if (orderAmount < coupon.minOrderAmount) {
            return sendError(res, 400, `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`);
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        return sendResponse(res, 200, 'Coupon applied successfully', {
            code: coupon.code,
            discount,
            finalAmount: orderAmount - discount
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Create a new coupon
 * @route   POST /coupons
 * @access  Private/Admin
 */
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        return sendResponse(res, 201, 'Coupon created successfully', coupon);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};
