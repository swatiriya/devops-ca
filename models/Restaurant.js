const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cuisine: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    deliveryTime: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '🍕'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);

