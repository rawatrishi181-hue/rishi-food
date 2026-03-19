const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a restaurant name'],
        trim: true
    },
    description: {
        type: String
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    city: {
        type: String,
        required: [true, 'Please add a city']
    },
    cuisine: {
        type: [String],
        required: [true, 'Please add at least one cuisine']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    deliveryTime: {
        type: Number,
        default: 30 // minutes
    },
    image: {
        type: String,
        default: ''
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Set default image if not provided
restaurantSchema.pre('save', function() {
    if (!this.image || this.image === '' || this.image === 'no-image.jpg') {
        this.image = `https://source.unsplash.com/600x400/?restaurant,${encodeURIComponent(this.name)}`;
    }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
