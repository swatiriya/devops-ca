// API Configuration
// Use a fixed backend URL so the frontend works even if you open the HTML files directly.
// Change this if your server runs on a different host/port.
const API_BASE_URL = 'http://localhost:3000/api';

// Global data storage
let restaurants = [];
let menuItems = [];

// Mapping for restaurant names to image filenames
const restaurantImageMap = {
    'burger king': 'Burger_King_2020.svg.png',
    'mcdonald': 'images.png', // Update this if you have a specific McDonald's image file
    'mcdonalds': 'images.png',
    'mcdonald\'s': 'images.png',
    'domino': 'Dominos_pizza_logo.svg.png',
    'dominos': 'Dominos_pizza_logo.svg.png',
    'domino\'s': 'Dominos_pizza_logo.svg.png',
    'dominos pizza': 'Dominos_pizza_logo.svg.png'
};

// Mapping for food item names to image filenames
const foodImageMap = {
    'french fries': 'French-Fries.png',
    'french-fries': 'French-Fries.png',
    'coke': 'coke.png',
    'coca cola': 'coke.png',
    'coca-cola': 'coke.png',
    'pizza': 'pizza.png',
    'burger': 'burger.png',
    'hamburger': 'burger.png',
    'cheeseburger': 'burger.png',
    'classic burger': 'burger.png'
};

// Helper function to get image path from name
function getImagePath(name, type = 'food') {
    if (!name) return null;
    
    const normalizedName = name.toLowerCase().trim();
    
    if (type === 'restaurant') {
        // Check exact matches first
        if (restaurantImageMap[normalizedName]) {
            return `images/${restaurantImageMap[normalizedName]}`;
        }
        // Check partial matches
        for (const [key, filename] of Object.entries(restaurantImageMap)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                return `images/${filename}`;
            }
        }
    } else {
        // Check exact matches first
        if (foodImageMap[normalizedName]) {
            return `images/${foodImageMap[normalizedName]}`;
        }
        // Check partial matches
        for (const [key, filename] of Object.entries(foodImageMap)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                return `images/${filename}`;
            }
        }
    }
    
    // Fallback: try to generate path from name
    const imageName = normalizedName
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    return `images/${imageName}.png`;
}

// Helper function to create image element with fallback
function createImageElement(imagePath, fallback, alt) {
    if (imagePath) {
        return `<img src="${imagePath}" alt="${alt}" onerror="this.onerror=null; this.style.display='none'; const fallback = this.nextElementSibling; if(fallback) fallback.style.display='flex';">
                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">${fallback}</div>`;
    }
    return `<div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">${fallback}</div>`;
}

// Cart management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize page based on current URL
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    updateCartCount();
    
    if (currentPage === 'index.html' || currentPage === '') {
        initHomePage();
    } else if (currentPage === 'menu.html') {
        initMenuPage();
    } else if (currentPage === 'cart.html') {
        initCartPage();
    } else if (currentPage === 'checkout.html') {
        initCheckoutPage();
    }
    
    initNavigation();
});

// Navigation toggle for mobile
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// API Helper Functions
async function fetchRestaurants() {
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants`);
        const result = await response.json();
        if (result.success) {
            restaurants = result.data;
            return restaurants;
        }
        throw new Error(result.message || 'Failed to fetch restaurants');
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        showNotification('Failed to load restaurants');
        return [];
    }
}

async function fetchMenuItems(category = 'all', search = '') {
    try {
        let url = `${API_BASE_URL}/menu?`;
        if (category && category !== 'all') url += `category=${category}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (!category && !search) url += `popular=true&`;
        
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
            menuItems = result.data;
            return menuItems;
        }
        throw new Error(result.message || 'Failed to fetch menu items');
    } catch (error) {
        console.error('Error fetching menu items:', error);
        showNotification('Failed to load menu items');
        return [];
    }
}

async function createOrder(orderData) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        throw new Error(result.message || 'Failed to create order');
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// Home page initialization
async function initHomePage() {
    await Promise.all([
        fetchRestaurants().then(() => displayRestaurants()),
        fetchMenuItems('all', '', true).then(() => displayPopularDishes())
    ]);
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location.href = `menu.html?search=${encodeURIComponent(searchInput.value)}`;
            }
        });
    }
}

// Display restaurants on home page
function displayRestaurants() {
    const restaurantGrid = document.getElementById('restaurantGrid');
    if (!restaurantGrid) return;
    
    if (restaurants.length === 0) {
        restaurantGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">Loading restaurants...</p>';
        return;
    }
    
    // Show only top 3 restaurants
    const topRestaurants = restaurants.slice(0, 3);
    
    restaurantGrid.innerHTML = topRestaurants.map(restaurant => {
        const imagePath = restaurant.image && restaurant.image.startsWith('http') 
            ? restaurant.image 
            : getImagePath(restaurant.name, 'restaurant');
        return `
        <div class="restaurant-card" onclick="window.location.href='menu.html'">
            <div class="restaurant-image">
                ${createImageElement(imagePath, '🍕', `${restaurant.name} restaurant image`)}
            </div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <p>${restaurant.cuisine} • ${restaurant.deliveryTime}</p>
                <div class="restaurant-rating">
                    <i class="fas fa-star"></i>
                    <span>${restaurant.rating || 0}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Display popular dishes on home page
function displayPopularDishes() {
    const dishGrid = document.getElementById('dishGrid');
    if (!dishGrid) return;
    
    if (menuItems.length === 0) {
        dishGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">Loading dishes...</p>';
        return;
    }
    
    // Show only top 4 popular dishes
    const popularDishes = menuItems.slice(0, 4);
    dishGrid.innerHTML = popularDishes.map(dish => {
        // Increase price by 2.5x
        const increasedPrice = (dish.price * 2.5).toFixed(0);
        const imagePath = dish.image && dish.image.startsWith('http') 
            ? dish.image 
            : getImagePath(dish.name, 'food');
        return `
        <div class="dish-card">
            <div class="dish-image">
                ${createImageElement(imagePath, '🍕', `${dish.name} image`)}
            </div>
            <div class="dish-info">
                <h3>${dish.name}</h3>
                <p>${dish.description}</p>
                <div class="dish-footer">
                    <span class="dish-price">₹${increasedPrice}</span>
                    <button class="add-to-cart-btn" onclick="addToCart('${dish._id}')">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Menu page initialization
async function initMenuPage() {
    // Check for search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';
    const menuSearch = document.getElementById('menuSearch');
    if (menuSearch && searchQuery) {
        menuSearch.value = searchQuery;
    }
    
    await fetchMenuItems('all', searchQuery);
    displayMenuItems();
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            const search = menuSearch?.value || '';
            await fetchMenuItems(category, search);
            displayMenuItems();
        });
    });
    
    // Search functionality
    if (menuSearch) {
        let searchTimeout;
        menuSearch.addEventListener('input', async (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const category = document.querySelector('.filter-btn.active')?.getAttribute('data-category') || 'all';
                await fetchMenuItems(category, e.target.value);
                displayMenuItems();
            }, 300);
        });
    }
}

// Display menu items
function displayMenuItems(items = menuItems) {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No items found.</p>';
        return;
    }

    // Show only 4 items to keep the menu focused
    const limitedItems = items.slice(0, 4);
    
    menuGrid.innerHTML = limitedItems.map(item => {
        // Increase price by 2.5x
        const increasedPrice = (item.price * 2.5).toFixed(0);
        const imagePath = item.image && item.image.startsWith('http') 
            ? item.image 
            : getImagePath(item.name, 'food');
        return `
        <div class="menu-item">
            <div class="menu-item-image">
                ${createImageElement(imagePath, '🍕', `${item.name} image`)}
            </div>
            <div class="menu-item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">₹${increasedPrice}</span>
                    <button class="add-to-cart-btn" onclick="addToCart('${item._id}')">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Add item to cart
async function addToCart(itemId) {
    // Find item in current menuItems or fetch it
    let item = menuItems.find(i => i._id === itemId);
    
    if (!item) {
        // Fetch single item if not in current list
        try {
            const response = await fetch(`${API_BASE_URL}/menu/${itemId}`);
            const result = await response.json();
            if (result.success) {
                item = result.data;
            } else {
                showNotification('Item not found');
                return;
            }
        } catch (error) {
            showNotification('Failed to add item to cart');
            return;
        }
    }
    
    const existingItem = cart.find(i => i._id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Increase price by 2.5x when adding to cart
        const increasedPrice = item.price * 2.5;
        const imagePath = item.image && item.image.startsWith('http') 
            ? item.image 
            : getImagePath(item.name, 'food');
        cart.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            price: increasedPrice,
            image: imagePath,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show notification
    showNotification(`${item.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item._id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    initCartPage();
}

// Update item quantity in cart
function updateQuantity(itemId, change) {
    const item = cart.find(i => i._id === itemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        initCartPage();
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(el => {
        if (el) {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    });
}

// Cart page initialization
function initCartPage() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    // Display cart items
    if (cartItems) {
        cartItems.innerHTML = cart.map(item => {
            const imagePath = item.image && item.image.startsWith('http') 
                ? item.image 
                : (item.image || getImagePath(item.name, 'food'));
            return `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${createImageElement(imagePath, '🍕', `${item.name} image`)}
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description || ''}</p>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateQuantity('${item._id}', -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity('${item._id}', 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart('${item._id}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
                <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(0)}</div>
            </div>
        `;
        }).join('');
    }
    
    // Update summary
    updateCartSummary();
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.onclick = () => {
            window.location.href = 'checkout.html';
        };
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;
    
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(0)}`;
    if (taxEl) taxEl.textContent = `₹${tax.toFixed(0)}`;
    if (totalEl) totalEl.textContent = `₹${total.toFixed(0)}`;
}

// Checkout page initialization
function initCheckoutPage() {
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    displayCheckoutItems();
    updateCheckoutSummary();
    
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('cardDetails');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', () => {
            if (method.value === 'card') {
                if (cardDetails) cardDetails.style.display = 'block';
            } else {
                if (cardDetails) cardDetails.style.display = 'none';
            }
        });
    });
    
    // Form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
    
    // Format card inputs
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    
    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    if (expiryDate) {
        expiryDate.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cvv) {
        cvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// Display checkout items
function displayCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    if (!checkoutItems) return;
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.name} x${item.quantity}</span>
            <span class="order-item-price">₹${(item.price * item.quantity).toFixed(0)}</span>
        </div>
    `).join('');
}

// Update checkout summary
function updateCheckoutSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;
    
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const taxEl = document.getElementById('checkoutTax');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(0)}`;
    if (taxEl) taxEl.textContent = `₹${tax.toFixed(0)}`;
    if (totalEl) totalEl.textContent = `₹${total.toFixed(0)}`;
}

// Handle checkout form submission
async function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const paymentMethod = formData.get('paymentMethod');
    
    // Validate card details if card payment
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        
        if (cardNumber.length < 16 || expiryDate.length < 5 || cvv.length < 3) {
            alert('Please fill in all card details');
            return;
        }
    }
    
    // Prepare order data
    const orderData = {
        items: cart.map(item => ({
            menuItemId: item._id,
            quantity: item.quantity
        })),
        deliveryInfo: {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode'),
            instructions: formData.get('deliveryInstructions') || ''
        },
        paymentMethod: paymentMethod,
        userId: localStorage.getItem('userId') || null
    };
    
    // Disable submit button
    const submitBtn = document.getElementById('placeOrderBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Placing Order...';
    }
    
    try {
        const order = await createOrder(orderData);
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show success modal
        const modal = document.getElementById('successModal');
        const orderIdEl = document.getElementById('orderId');
        
        if (orderIdEl) orderIdEl.textContent = order.orderId;
        if (modal) {
            modal.classList.add('active');
        }
    } catch (error) {
        alert('Failed to place order. Please try again.');
        console.error('Order error:', error);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

