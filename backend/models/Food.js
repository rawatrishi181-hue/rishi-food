const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a food name'],
        trim: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be greater than or equal to 0']
    },
    image: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        // Flexible categories for production
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Set default image if not provided based on category
foodSchema.pre('save', function() {
    if (!this.image || this.image === '' || this.image === 'no-food-image.jpg') {
        this.image = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80`;
    }
});

// Add indexes for faster queries
foodSchema.index({ restaurantId: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ name: 'text', description: 'text' });
foodSchema.index({ isAvailable: 1 });
foodSchema.index({ restaurantId: 1, isAvailable: 1 });

module.exports = mongoose.model('Food', foodSchema);
