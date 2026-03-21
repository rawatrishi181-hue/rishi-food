const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String, // Link to a restaurant, food item, or external URL
    },
    type: {
        type: String,
        enum: ['restaurant', 'food', 'external'],
        default: 'external'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
