const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isActive: true })
            .sort({ rating: -1, createdAt: -1 });
        res.json({ success: true, data: restaurants });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single restaurant
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        res.json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create restaurant (Admin only - add auth middleware in production)
router.post('/', async (req, res) => {
    try {
        const restaurant = new Restaurant(req.body);
        await restaurant.save();
        res.status(201).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update restaurant
router.put('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        res.json({ success: true, data: restaurant });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete restaurant
router.delete('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        res.json({ success: true, message: 'Restaurant deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

