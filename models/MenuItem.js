const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['pizza', 'burger', 'pasta', 'sushi', 'dessert', 'drinks', 'other']
    },
    image: {
        type: String,
        default: '🍕'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        default: null
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isPopular: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

