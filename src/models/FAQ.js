const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Please add a question'],
        trim: true
    },
    answer: {
        type: String,
        required: [true, 'Please add an answer'],
        trim: true
    },
    category: {
        type: String,
        default: 'General'
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FAQ', faqSchema);
