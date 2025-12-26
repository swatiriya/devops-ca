const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodieexpress';

const restaurants = [
    {
        name: "Burger King",
        cuisine: "American",
        rating: 4.6,
        deliveryTime: "20-25 min",
        image: "🍔",
        address: "456 Oak Ave",
        phone: "+1 234 567 8902"
    },
    {
        name: "McDonald's",
        cuisine: "American",
        rating: 4.7,
        deliveryTime: "15-20 min",
        image: "🍔",
        address: "789 Main St",
        phone: "+1 234 567 8903"
    },
    {
        name: "Domino's",
        cuisine: "Italian",
        rating: 4.8,
        deliveryTime: "25-30 min",
        image: "🍕",
        address: "123 Pizza Lane",
        phone: "+1 234 567 8901"
    }
];

const menuItems = [
    { name: "French Fries", description: "Crispy golden french fries", price: 4.99, category: "sides", image: "🍟", isPopular: true },
    { name: "Coke", description: "Refreshing cola drink", price: 2.99, category: "drinks", image: "🥤", isPopular: true },
    { name: "Pizza", description: "Delicious cheesy pizza", price: 12.99, category: "pizza", image: "🍕", isPopular: true },
    { name: "Burger", description: "Classic beef burger with all the fixings", price: 9.99, category: "burger", image: "🍔", isPopular: true }
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Restaurant.deleteMany({});
        await MenuItem.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert restaurants
        const insertedRestaurants = await Restaurant.insertMany(restaurants);
        console.log(`✅ Inserted ${insertedRestaurants.length} restaurants`);

        // Link menu items to restaurants and insert
        const restaurantIds = insertedRestaurants.map(r => r._id);
        const menuItemsWithRestaurants = menuItems.map((item, index) => ({
            ...item,
            restaurant: restaurantIds[index % restaurantIds.length]
        }));

        const insertedMenuItems = await MenuItem.insertMany(menuItemsWithRestaurants);
        console.log(`✅ Inserted ${insertedMenuItems.length} menu items`);

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();

