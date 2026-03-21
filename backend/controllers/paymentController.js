const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Initialize a payment (Mock)
 * @route   POST /api/payments/create
 * @access  Private
 */
const createPayment = async (req, res) => {
    try {
        const { orderId, amount, paymentGateway = 'Razorpay' } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(orderId);
        if (!order) {
            return sendError(res, 404, 'Order not found');
        }

        // Mock Transaction ID
        const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const payment = await Payment.create({
            userId,
            orderId,
            transactionId,
            amount,
            paymentGateway,
            status: 'pending'
        });

        // In a real scenario, you'd call Razorpay/Stripe API here to get a session/order ID
        return sendResponse(res, 201, 'Payment initialized successfully', {
            paymentId: payment._id,
            transactionId,
            amount,
            currency: 'INR',
            orderId
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Verify a payment (Mock)
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
    try {
        const { transactionId, status, gatewayResponse } = req.body;

        const payment = await Payment.findOne({ transactionId });
        if (!payment) {
            return sendError(res, 404, 'Payment transaction not found');
        }

        payment.status = status === 'success' ? 'completed' : 'failed';
        payment.gatewayResponse = gatewayResponse;
        await payment.save();

        // Update Order Status if payment success
        if (payment.status === 'completed') {
            await Order.findByIdAndUpdate(payment.orderId, {
                paymentStatus: 'paid',
                status: 'preparing' // Automatically move to preparing after payment
            });
        }

        return sendResponse(res, 200, `Payment ${payment.status}`, payment);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
        const payments = await Payment.find(query)
            .populate('orderId', 'totalAmount items createdAt')
            .sort('-createdAt');

        return sendResponse(res, 200, 'Payment history fetched successfully', payments);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    createPayment,
    verifyPayment,
    getPaymentHistory
};
