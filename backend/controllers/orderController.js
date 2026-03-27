const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');
const { sendInternalNotification } = require('./notificationController');
const { sendEmail } = require('../utils/mail.service');
const { emitOrderStatusUpdate, emitNewOrder, emitCommissionUpdate } = require('../socket/socket');

// Import Email Templates
const orderPlacedTemplate = require('../templates/emails/orderPlaced.template');
const orderAcceptedTemplate = require('../templates/emails/orderAccepted.template');
const orderPreparingTemplate = require('../templates/emails/orderPreparing.template');
const orderOutForDeliveryTemplate = require('../templates/emails/orderOutForDelivery.template');
const orderDeliveredTemplate = require('../templates/emails/orderDelivered.template');
const orderCancelledTemplate = require('../templates/emails/orderCancelled.template');

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /orders/all
 * @access  Private (Admin)
 */
const getAllOrders = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return sendError(res, 403, 'Not authorized');
        }

        const { page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;

        const total = await Order.countDocuments();

        const orders = await Order.find()
            .populate('userId', 'name email')
            .populate('restaurantId', 'name city')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(limitNum)
            .lean();

        return sendResponse(res, 200, 'All orders fetched successfully', {
            count: orders.length,
            total,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            },
            data: orders
        });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Create an order from user's cart
 * @route   POST /orders
 * @access  Private
 */
const createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        const { address, paymentMethod } = req.body;
        const userId = req.user._id;

        // 1. Fetch user's cart and populate food to get restaurantIds
        const cart = await Cart.findOne({ userId }).populate('items.foodId');

        if (!cart || !cart.items || cart.items.length === 0) {
            return sendError(res, 400, 'Your cart is empty');
        }

        // Filter invalid cart items (missing food or missing restaurant)
        const validItems = cart.items.filter(item => {
            const food = item.foodId;
            return food && food.restaurantId;
        });

        if (validItems.length === 0) {
            return sendError(res, 400, 'Your cart has no valid items');
        }

        // Fetch user details for email
        const user = await User.findById(userId);

        // Group items by restaurantId
        const itemsByRestaurant = {};
        for (const item of validItems) {
            const restId = item.foodId.restaurantId.toString();
            if (!itemsByRestaurant[restId]) {
                itemsByRestaurant[restId] = {
                    items: [],
                    totalAmount: 0
                };
            }
            itemsByRestaurant[restId].items.push({
                foodId: item.foodId._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            });
            itemsByRestaurant[restId].totalAmount += item.price * item.quantity;
        }

        const createdOrders = [];

        // OPTIMIZATION: Fetch all restaurants at once (avoid N+1 queries)
        const restaurantIds = Object.keys(itemsByRestaurant);
        const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }).lean();
        const restaurantMap = {};
        restaurants.forEach(r => {
            restaurantMap[r._id.toString()] = r;
        });

        // 2. Create orders for each restaurant
        for (const restId in itemsByRestaurant) {
            const group = itemsByRestaurant[restId];
            
            const order = await Order.create({
                userId,
                restaurantId: restId,
                items: group.items,
                totalAmount: group.totalAmount,
                address,
                paymentMethod
            });

            createdOrders.push(order);

            const restaurant = restaurantMap[restId];

            // 3. Send Notification & Email for each order (async, non-blocking)
            sendInternalNotification(
                userId,
                'Order Placed!',
                `Your order from ${restaurant.name} of ₹${order.totalAmount} has been placed successfully.`
            ).catch(err => console.error('Notification error:', err));

            // Send Email (async, non-blocking)
            try {
                const html = orderPlacedTemplate(user.name, order._id, restaurant.name, order.totalAmount);
                sendEmail(user.email, `Order Placed Successfully - ${restaurant.name}`, html)
                    .catch(err => console.error('Email send error:', err));
            } catch (mailError) {
                console.error('Email template error:', mailError);
            }

            // Emit Socket Event for Real-Time Tracking
            emitOrderStatusUpdate(order.userId, {
                orderId: order._id,
                status: order.status
            });

            // Emit New Order to Admin
            emitNewOrder(order);
        }

        // 4. Clear the cart
        cart.items = [];
        cart.restaurantId = undefined;
        cart.totalAmount = 0;
        await cart.save();

        return sendResponse(res, 201, 'Order(s) placed successfully', createdOrders.length === 1 ? createdOrders[0] : createdOrders);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get all orders for the logged-in user
 * @route   GET /orders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate('restaurantId', 'name city')
            .sort('-createdAt');

        return sendResponse(res, 200, 'Orders fetched successfully', orders);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get all orders for the restaurant vendor
 * @route   GET /orders/vendor
 * @access  Private (Restaurant Owner, Admin)
 */
const getVendorOrders = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const orders = await Order.find().populate('restaurantId', 'name city').populate('userId', 'name email').sort('-createdAt');
            return sendResponse(res, 200, 'Vendor orders fetched successfully', orders);
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
        if (!restaurant) {
            return sendError(res, 404, 'Restaurant not found for this vendor');
        }

        const orders = await Order.find({ restaurantId: restaurant._id })
            .populate('restaurantId', 'name city')
            .populate('userId', 'name email')
            .sort('-createdAt');

        return sendResponse(res, 200, 'Vendor orders fetched successfully', orders);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get order details by order ID
 * @route   GET /orders/:id
 * @access  Private
 */
const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('restaurantId', 'name city address phone')
            .populate('userId', 'name email phone');

        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        // Check ownership (only user, admin or restaurant owner can see)
        const restaurant = await Restaurant.findById(order.restaurantId);
        const isOwner = restaurant.ownerId.toString() === req.user._id.toString();
        const isUser = order.userId.toString() === req.user._id.toString();

        if (req.user.role !== 'admin' && !isOwner && !isUser) {
            return sendError(res, 403, 'Not authorized to view this order');
        }

        return sendResponse(res, 200, 'Order details fetched successfully', order);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Update order status
 * @route   PUT /orders/:id/status
 * @access  Private (Admin or Restaurant Owner)
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatus = ['accepted', 'preparing', 'out_for_delivery', 'delivered'];

        if (!allowedStatus.includes(status)) {
            return sendError(res, 400, 'Invalid status update');
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        // Check if user is authorized (admin or restaurant owner)
        const restaurant = await Restaurant.findById(order.restaurantId);
        if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user._id.toString()) {
            return sendError(res, 403, 'Not authorized to update this order status');
        }

        // Validate status transitions (simple forward flow)
        const statusOrder = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
        const currentIdx = statusOrder.indexOf(order.status);
        const nextIdx = statusOrder.indexOf(status);

        if (nextIdx <= currentIdx) {
            return sendError(res, 400, `Cannot move status from ${order.status} to ${status}`);
        }

        order.status = status;

        // Calculate commission when order is delivered
        if (status === 'delivered') {
            const commissionRate = restaurant.commissionPercentage || 10; // Default 10%
            order.commissionAmount = (order.totalAmount * commissionRate) / 100;
            // Emit commission update to vendor
            emitCommissionUpdate(restaurant.ownerId, {
                orderId: order._id,
                commissionAmount: order.commissionAmount,
                totalAmount: order.totalAmount,
                commissionRate
            });
        }

        await order.save();

        // Fetch User and Restaurant for email
        const user = await User.findById(order.userId);
        const restaurantDetails = await Restaurant.findById(order.restaurantId);

        // Send Status Notification
        const statusMessages = {
            accepted: 'Your order has been accepted by the restaurant.',
            preparing: 'The restaurant is preparing your food.',
            out_for_delivery: 'Your order is out for delivery!',
            delivered: 'Your order has been delivered. Enjoy your meal!'
        };

        await sendInternalNotification(
            order.userId,
            `Order ${status.replace(/_/g, ' ')}`,
            statusMessages[status]
        );

        // Emit Socket Event for Real-Time Tracking
        emitOrderStatusUpdate(order.userId, {
            orderId: order._id,
            status: status
        });

        // Send Email based on status
        try {
            let html;
            let subject;

            switch (status) {
                case 'accepted':
                    html = orderAcceptedTemplate(user.name, order._id, restaurantDetails.name, order.totalAmount);
                    subject = 'Order Accepted - Rishi Food';
                    break;
                case 'preparing':
                    html = orderPreparingTemplate(user.name, order._id, restaurantDetails.name, order.totalAmount);
                    subject = 'Order Preparing - Rishi Food';
                    break;
                case 'out_for_delivery':
                    html = orderOutForDeliveryTemplate(user.name, order._id, restaurantDetails.name, order.totalAmount);
                    subject = 'Order Out for Delivery - Rishi Food';
                    break;
                case 'delivered':
                    html = orderDeliveredTemplate(user.name, order._id, restaurantDetails.name, order.totalAmount);
                    subject = 'Order Delivered - Rishi Food';
                    break;
            }

            if (html) {
                await sendEmail(user.email, subject, html);
            }
        } catch (mailError) {
            console.error(`Email failed to send for status ${status}:`, mailError);
        }

        return sendResponse(res, 200, 'Order status updated successfully', order);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Cancel order
 * @route   PUT /orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        // Check ownership
        if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendError(res, 403, 'Not authorized to cancel this order');
        }

        // Check if order can be cancelled
        if (order.status !== 'placed' && order.status !== 'accepted') {
            return sendError(res, 400, `Cannot cancel order after it is ${order.status}`);
        }

        order.status = 'cancelled';
        await order.save();

        // Fetch User and Restaurant for email
        const user = await User.findById(order.userId);
        const restaurantDetails = await Restaurant.findById(order.restaurantId);

        // Send Cancellation Notification
        await sendInternalNotification(
            order.userId,
            'Order Cancelled',
            'Your order has been cancelled successfully.'
        );

        // Send Cancellation Email
        try {
            const html = orderCancelledTemplate(user.name, order._id, restaurantDetails.name, order.totalAmount);
            await sendEmail(user.email, 'Order Cancelled - Rishi Food', html);
        } catch (mailError) {
            console.error('Email failed to send for cancellation:', mailError);
        }

        return sendResponse(res, 200, 'Order cancelled successfully', order);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getVendorOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder
};
