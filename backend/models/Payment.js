const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    paymentGateway: {
        type: String,
        enum: ['Razorpay', 'Stripe', 'Paypal', 'Wallet'],
        default: 'Razorpay'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String, // card, upi, netbanking
    },
    gatewayResponse: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
