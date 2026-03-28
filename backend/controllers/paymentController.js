const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Create Dummy Payment Transaction
 * @route   POST /api/payments/create
 * @access  Private
 */
const createDummyPayment = async (req, res) => {
    try {
        const { orderId, amount, paymentMethod } = req.body;
        const userId = req.user._id;

        // Verify order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        // Generate random transactionId (TXN + timestamp + random string)
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

        // Randomly assign status (80% SUCCESS, 20% FAILED)
        const status = Math.random() < 0.8 ? 'SUCCESS' : 'FAILED';

        // Save transaction in DB
        const transaction = await Transaction.create({
            userId,
            orderId,
            amount,
            paymentMethod,
            status,
            transactionId
        });

        // Update Order status based on payment result
        if (status === 'SUCCESS') {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'paid',
                status: 'preparing'
            });
        } else {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'failed'
            });
        }

        return sendResponse(res, 201, `Payment ${status}`, transaction);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get All Transactions (Admin)
 * @route   GET /api/admin/transactions
 * @access  Private/Admin
 */
const getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } }
            ];
        }

        if (status && status !== 'ALL') {
            query.status = status;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: [
                { path: 'userId', select: 'name email' },
                { path: 'orderId', select: 'totalAmount status' }
            ]
        };

        // Manual pagination since we are not using mongoose-paginate-v2
        const skip = (options.page - 1) * options.limit;
        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .populate(options.populate)
            .sort(options.sort)
            .skip(skip)
            .limit(options.limit);

        return sendResponse(res, 200, 'Transactions fetched successfully', {
            transactions,
            pagination: {
                total,
                page: options.page,
                limit: options.limit,
                pages: Math.ceil(total / options.limit)
            }
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get User Transactions
 * @route   GET /api/payments/user/:userId
 * @access  Private
 */
const getUserTransactions = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user is accessing their own transactions or is an admin
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return sendError(res, 403, 'Not authorized to view these transactions');
        }

        const transactions = await Transaction.find({ userId })
            .populate('orderId', 'totalAmount status createdAt')
            .sort('-createdAt');

        return sendResponse(res, 200, 'User transactions fetched successfully', transactions);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    createDummyPayment,
    getAllTransactions,
    getUserTransactions
};
