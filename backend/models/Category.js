const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
