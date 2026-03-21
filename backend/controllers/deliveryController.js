const Order = require('../models/Order');
const User = require('../models/User');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { emitOrderStatusUpdate } = require('../socket/socket');

/**
 * @desc    Update delivery boy location
 * @route   POST /delivery/location
 * @access  Rider
 */
const updateLocation = async (req, res) => {
    try {
        const { orderId, lat, lng } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        // Send location update via socket to the customer
        const { getIO } = require('../socket/socket');
        const io = getIO();
        if (io) {
            io.to(order.userId.toString()).emit('location_update', {
                orderId,
                lat,
                lng,
                timestamp: new Date()
            });
        }

        return sendResponse(res, 200, 'Location updated and emitted');
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Register current user as a rider
 * @route   POST /api/delivery/register
 * @access  Private
 */
const registerAsRider = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role === 'rider') {
            return sendError(res, 400, 'User is already a rider');
        }

        user.role = 'rider';
        await user.save();

        return sendResponse(res, 200, 'Successfully registered as a rider', user);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get available orders for delivery (preparing or ready)
 * @route   GET /api/delivery/orders
 * @access  Rider
 */
const getAvailableOrders = async (req, res) => {
    try {
        // Orders that are preparing or ready and don't have a rider assigned yet
        const orders = await Order.find({
            status: { $in: ['preparing', 'ready'] },
            riderId: { $exists: false }
        }).populate('restaurantId', 'name address location')
          .populate('userId', 'name phone address');

        return sendResponse(res, 200, 'Available orders fetched successfully', orders);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Accept an order for delivery
 * @route   PUT /api/delivery/order/:id/accept
 * @access  Rider
 */
const acceptOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        if (order.riderId) {
            return sendError(res, 400, 'Order already assigned to another rider');
        }

        order.riderId = req.user._id;
        order.status = 'out_for_delivery';
        await order.save();

        return sendResponse(res, 200, 'Order accepted and status updated to out for delivery', order);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Mark order as delivered
 * @route   PUT /api/delivery/order/:id/complete
 * @access  Rider
 */
const completeDelivery = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, riderId: req.user._id });
        if (!order) {
            return sendError(res, 404, 'Order not found or not assigned to you');
        }

        order.status = 'delivered';
        order.paymentStatus = 'paid'; // Assuming it's paid if delivered
        await order.save();

        return sendResponse(res, 200, 'Order delivered successfully', order);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    registerAsRider,
    getAvailableOrders,
    acceptOrder,
    completeDelivery,
    updateLocation
};
