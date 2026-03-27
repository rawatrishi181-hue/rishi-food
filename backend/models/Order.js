const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: [true, 'Please add a delivery address']
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'ONLINE'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'placed'
    },
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    commissionAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add indexes for faster queries
orderSchema.index({ userId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ riderId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
