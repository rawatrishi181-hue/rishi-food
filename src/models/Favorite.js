const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    },
    type: {
        type: String,
        enum: ['restaurant', 'food'],
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can only favorite a specific restaurant/food once
favoriteSchema.index({ userId: 1, restaurantId: 1 }, { unique: true, partialFilterExpression: { restaurantId: { $exists: true } } });
favoriteSchema.index({ userId: 1, foodId: 1 }, { unique: true, partialFilterExpression: { foodId: { $exists: true } } });

module.exports = mongoose.model('Favorite', favoriteSchema);
