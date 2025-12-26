const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items with optional filters
router.get('/', async (req, res) => {
    try {
        const { category, search, restaurant, popular } = req.query;
        const query = { isAvailable: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (restaurant) {
            query.restaurant = restaurant;
        }

        if (popular === 'true') {
            query.isPopular = true;
        }

        let menuItems = await MenuItem.find(query)
            .populate('restaurant', 'name cuisine')
            .sort({ isPopular: -1, createdAt: -1 });

        // Search filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            menuItems = menuItems.filter(item => 
                item.name.match(searchRegex) || 
                item.description.match(searchRegex)
            );
        }

        res.json({ success: true, data: menuItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single menu item
router.get('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id)
            .populate('restaurant', 'name cuisine');
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }
        res.json({ success: true, data: menuItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create menu item (Admin only - add auth middleware in production)
router.post('/', async (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        await menuItem.save();
        res.status(201).json({ success: true, data: menuItem });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update menu item
router.put('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }
        res.json({ success: true, data: menuItem });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { isAvailable: false },
            { new: true }
        );
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }
        res.json({ success: true, message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

