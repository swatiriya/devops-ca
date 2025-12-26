const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 2.99
    },
    tax: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    deliveryInfo: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        instructions: {
            type: String,
            default: ''
        }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['card', 'cash', 'paypal']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

