const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    vehicleType: { type: String, enum: ['Cycle', 'Bike', 'Scooter'], required: true },
    documents: {
        license: { type: String }, // URL to image
        rc: { type: String }      // URL to image
    },
    isVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Offline', 'Busy'], default: 'Offline' },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    earnings: {
        total: { type: Number, default: 0 },
        weekly: { type: Number, default: 0 }
    },
    rating: { type: Number, default: 4.5 },
    totalDeliveries: { type: Number, default: 0 },
    otp: {
        code: String,
        expiresAt: Date
    }
}, { timestamps: true });

// Add indexes for faster queries
// Note: email and phone have unique: true which creates indexes automatically
deliveryPartnerSchema.index({ city: 1 });
deliveryPartnerSchema.index({ status: 1 });
deliveryPartnerSchema.index({ city: 1, isOnline: 1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
