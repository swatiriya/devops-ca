# FoodieExpress - Food Ordering Delivery System

A full-stack food ordering and delivery system with MongoDB backend and modern frontend.

## Features

- 🍕 Browse restaurants and menu items
- 🛒 Shopping cart with quantity management
- 💳 Multiple payment methods (Card, Cash, PayPal)
- 📦 Order tracking and management
- 🔍 Search and filter functionality
- 📱 Fully responsive design
- 🔐 User authentication (JWT)

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design with modern UI

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and update the MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/foodieexpress
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodieexpress
   
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   If using local MongoDB, make sure MongoDB is running:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

5. **Seed the database (optional)**
   
   Populate the database with sample data:
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:3000`

## Project Structure

```
.
├── models/              # MongoDB models
│   ├── MenuItem.js
│   ├── Order.js
│   ├── Restaurant.js
│   └── User.js
├── routes/              # API routes
│   ├── auth.js
│   ├── menu.js
│   ├── orders.js
│   └── restaurants.js
├── scripts/             # Utility scripts
│   └── seedDatabase.js
├── index.html           # Home page
├── menu.html            # Menu page
├── cart.html            # Shopping cart
├── checkout.html        # Checkout page
├── styles.css           # Stylesheet
├── script.js            # Frontend JavaScript
├── server.js            # Express server
├── package.json         # Dependencies
└── README.md           # This file
```

## API Endpoints

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get single restaurant
- `POST /api/restaurants` - Create restaurant (Admin)
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Menu Items
- `GET /api/menu` - Get all menu items (supports query params: category, search, popular)
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders (supports userId query param)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

## Usage

1. **Browse Menu**: Navigate to the menu page to see all available items
2. **Add to Cart**: Click "Add" button on any menu item
3. **View Cart**: Click the cart icon in navigation
4. **Checkout**: Fill in delivery information and payment details
5. **Place Order**: Submit the order to complete the purchase

## Development

### Adding New Menu Items

You can add menu items through the API or directly in MongoDB:

```javascript
POST /api/menu
{
  "name": "New Item",
  "description": "Description here",
  "price": 9.99,
  "category": "pizza",
  "image": "🍕",
  "isPopular": true
}
```

### Database Seeding

The seed script populates the database with sample restaurants and menu items. Run it with:

```bash
npm run seed
```

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Change the `PORT` in `.env` file
- Or stop the process using port 3000

### CORS Issues
- CORS is enabled for all origins in development
- For production, configure CORS properly in `server.js`

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!

