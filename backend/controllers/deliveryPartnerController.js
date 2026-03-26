const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const { sendResponse, sendError } = require('../utils/responseHandler');
const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Send OTP (Mock)
exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        const otp = "123456"; // Static for testing
        
        let partner = await DeliveryPartner.findOne({ phone });
        if (!partner) {
            // New partner will be created during verification
        } else {
            partner.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
            await partner.save();
        }

        return sendResponse(res, 200, 'OTP sent successfully (123456)');
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// Verify OTP & Login/Register
exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp, name, email, city, vehicleType } = req.body;

        if (otp !== "123456") {
            return sendError(res, 400, 'Invalid OTP');
        }

        let partner = await DeliveryPartner.findOne({ phone });

        if (!partner) {
            if (!name || !email || !city || !vehicleType) {
                return sendError(res, 400, 'Please provide all details for registration');
            }
            partner = await DeliveryPartner.create({
                name, email, phone, city, vehicleType, isVerified: true
            });
        }

        const token = generateToken(partner._id);

        return sendResponse(res, 200, 'Login successful', {
            partner,
            token
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// Get Dashboard Stats
exports.getDashboard = async (req, res) => {
    try {
        const partner = await DeliveryPartner.findById(req.user._id);
        const availableOrders = await Order.find({ status: 'preparing' }).populate('restaurantId');
        const activeOrders = await Order.find({ assignedTo: partner._id, status: { $in: ['accepted', 'out-for-delivery'] } }).populate('restaurantId');
        const completedOrders = await Order.find({ assignedTo: partner._id, status: 'delivered' }).limit(5);

        return sendResponse(res, 200, 'Dashboard data fetched', {
            partner,
            availableOrders,
            activeOrders,
            completedOrders
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.user._id,
            req.body,
            { new: true }
        );
        return sendResponse(res, 200, 'Profile updated', partner);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// Admin: Get all partners
exports.getAllPartners = async (req, res) => {
    try {
        const { status, search } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const partners = await DeliveryPartner.find(query).sort({ createdAt: -1 });
        return sendResponse(res, 200, 'Partners fetched', partners);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// Admin: Create partner
exports.createPartner = async (req, res) => {
    try {
        const { name, email, phone, city, vehicleType, licenseNumber } = req.body;

        if (!name || !email || !phone || !city || !vehicleType || !licenseNumber) {
            return sendError(res, 400, 'Please provide all details');
        }

        const existingPartner = await DeliveryPartner.findOne({ $or: [{ phone }, { email }] });
        if (existingPartner) {
            return sendError(res, 400, 'Delivery partner already exists');
        }

        const partner = await DeliveryPartner.create({
            name,
            email,
            phone,
            city,
            vehicleType,
            documents: { license: licenseNumber },
            isVerified: true,
            status: 'Active'
        });

        return sendResponse(res, 201, 'Partner created', partner);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// Admin: Update partner by ID
exports.updatePartner = async (req, res) => {
    try {
        const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!partner) {
            return sendError(res, 404, 'Delivery partner not found');
        }
        return sendResponse(res, 200, 'Partner updated', partner);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// Accept Order
exports.acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);

        if (!order || order.status !== 'preparing') {
            return sendError(res, 400, 'Order not available');
        }

        order.assignedTo = req.user._id;
        order.status = 'accepted';
        await order.save();

        // Notify through Socket.io using the existing helper
        const { getIO } = require('../socket/socket');
        try {
            const io = getIO();
            io.to(`partner_${req.user._id}`).emit('order_update', {
                message: 'Order accepted successfully',
                order
            });
        } catch (socketErr) {
            console.log('Socket not initialized, skipping real-time notification');
        }

        return sendResponse(res, 200, 'Order accepted', order);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// Complete Delivery
exports.completeDelivery = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);

        if (!order || order.assignedTo.toString() !== req.user._id.toString()) {
            return sendError(res, 403, 'Unauthorized');
        }

        order.status = 'delivered';
        await order.save();

        // Update Partner Earnings
        const partner = await DeliveryPartner.findById(req.user._id);
        const deliveryFee = 40; // Fixed mock fee
        partner.earnings.total += deliveryFee;
        partner.earnings.weekly += deliveryFee;
        partner.totalDeliveries += 1;
        await partner.save();

        return sendResponse(res, 200, 'Delivery completed', { order, partner });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};
