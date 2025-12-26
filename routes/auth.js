const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = new User({ name, email, password, phone });
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                token
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                token
            },
            message: 'Login successful'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get current user (protected route - add middleware in production)
router.get('/me', async (req, res) => {
    try {
        // In production, extract token from headers and verify
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

module.exports = router;

