const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    vehicleType: {
        type: String,
        enum: ['Scooter', 'Bike', 'Cycle'],
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Offline', 'Busy'],
        default: 'Offline'
    },
    totalDeliveries: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4.5
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
