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
        const category = this.category || 'food';
        this.image = `https://source.unsplash.com/600x400/?${category},${encodeURIComponent(this.name)}`;
    }
});

module.exports = mongoose.model('Food', foodSchema);
