const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Get all orders (with optional user filter)
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const query = userId ? { user: userId } : {};
        
        const orders = await Order.find(query)
            .populate('items.menuItem', 'name image')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.menuItem', 'name description image')
            .populate('user', 'name email phone');
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const { items, deliveryInfo, paymentMethod, userId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must have at least one item' });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);
            if (!menuItem) {
                return res.status(400).json({ success: false, message: `Menu item ${item.menuItemId} not found` });
            }

            const itemTotal = menuItem.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                quantity: item.quantity,
                price: menuItem.price
            });
        }

        const deliveryFee = 2.99;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + deliveryFee + tax;

        // Generate unique order ID
        const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const order = new Order({
            orderId,
            user: userId || null,
            items: orderItems,
            subtotal,
            deliveryFee,
            tax,
            total,
            deliveryInfo,
            paymentMethod,
            paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
            orderStatus: 'pending'
        });

        await order.save();
        
        const populatedOrder = await Order.findById(order._id)
            .populate('items.menuItem', 'name image');

        res.status(201).json({ 
            success: true, 
            data: populatedOrder,
            message: 'Order placed successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const update = {};

        if (orderStatus) {
            update.orderStatus = orderStatus;
        }
        if (paymentStatus) {
            update.paymentStatus = paymentStatus;
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: 'cancelled' },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: order, message: 'Order cancelled' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;

