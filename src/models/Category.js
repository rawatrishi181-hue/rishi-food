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
        default: 'https://source.unsplash.com/600x400/?food,category'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
