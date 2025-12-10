// Global state
let menuItems = [];
let cart = [];
let currentFilter = 'all';

// Use relative API base so requests work both locally and on Netlify
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadBestsellers();
    loadMenu();
    loadChatHistory();
});

// ===== CHAT MODAL FUNCTIONS =====

function toggleChatModal() {
    const chatSection = document.getElementById('chatSection');
    chatSection.classList.toggle('active');
    if (chatSection.classList.contains('active')) {
        document.getElementById('messageInput').focus();
    }
}

// ===== MENU FUNCTIONS =====

// Format currency as Philippine Peso
function formatCurrency(amount) {
    const n = Number(amount) || 0;
    return `₱${n.toFixed(2)}`;
}

async function loadBestsellers() {
    try {
        const response = await fetch(`${API_BASE}/bestsellers?limit=6`);
        if (!response.ok) {
            console.error('Bestsellers fetch failed', response.status, response.statusText);
            document.getElementById('bestsellersGrid').innerHTML = `<p>Error loading bestsellers (${response.status})</p>`;
            return;
        }
        const bestsellers = await response.json();
        renderBestsellers(bestsellers);
    } catch (error) {
        console.error('Error loading bestsellers:', error);
        document.getElementById('bestsellersGrid').innerHTML = '<p>Error loading bestsellers.</p>';
    }
}

function renderBestsellers(items) {
    const bestsellersGrid = document.getElementById('bestsellersGrid');
    
    if (items.length === 0) {
        bestsellersGrid.innerHTML = '<p>No bestsellers available</p>';
        return;
    }

    bestsellersGrid.innerHTML = items.map(item => `
        <div class="bestseller-item" data-id="${item.id}" data-price="${item.price}">
            <div class="bestseller-badge">🌟 Best Seller</div>
            <div class="bestseller-name">${item.name}</div>
            <div class="bestseller-rating">⭐ ${parseFloat(item.rating).toFixed(1)} (${item.salesCount} sold)</div>
            <div class="bestseller-price">${formatCurrency(item.price)}</div>
            <button class="bestseller-add-btn" onclick="addBestsellerToCart(event, ${item.id}, '${item.name}', ${item.price})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

function addBestsellerToCart(event, itemId, itemName, itemPrice) {
    event.preventDefault();
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
    }

    updateCart();
    showNotification(`Added ${itemName} to cart!`);
}

async function loadMenu() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        if (!response.ok) {
            console.error('Menu fetch failed', response.status, response.statusText);
            document.getElementById('menuGrid').innerHTML = `<p>Error loading menu (${response.status})</p>`;
            return;
        }
        menuItems = await response.json();
        renderMenu(menuItems);
    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('menuGrid').innerHTML = '<p>Error loading menu. Please try again.</p>';
    }
}

function renderMenu(items) {
    const menuGrid = document.getElementById('menuGrid');
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<p>No items available</p>';
        return;
    }

    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item" data-id="${item.id}" data-price="${item.price}">
            <div class="menu-item-category">${item.category}</div>
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-description">${item.description || ''}</div>
            <div class="menu-item-price">${formatCurrency(item.price)}</div>
            <div class="quantity-selector">
                <button class="qty-btn" onclick="decreaseQty(event)">-</button>
                <input type="number" class="qty-input" value="1" min="1" max="10">
                <button class="qty-btn" onclick="increaseQty(event)">+</button>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(event, ${item.id}, '${item.name}', ${item.price})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

function filterMenu(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter and render
    if (category === 'all') {
        renderMenu(menuItems);
    } else {
        const filtered = menuItems.filter(item => item.category === category);
        renderMenu(filtered);
    }
}

function increaseQty(event) {
    event.preventDefault();
    const input = event.target.nextElementSibling;
    input.value = Math.min(10, parseInt(input.value) + 1);
}

function decreaseQty(event) {
    event.preventDefault();
    const input = event.target.parentElement.querySelector('.qty-input');
    input.value = Math.max(1, parseInt(input.value) - 1);
}

function addToCart(event, itemId, itemName, itemPrice) {
    event.preventDefault();
    const qtyInput = event.target.previousElementSibling.querySelector('.qty-input');
    const quantity = parseInt(qtyInput.value);

    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            quantity: quantity
        });
    }

    qtyInput.value = 1;
    updateCart();
    showNotification(`Added ${itemName} to cart!`);
}

function updateCart() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    const cartItemsDiv = document.getElementById('cartItems');
    const totalPriceDiv = document.getElementById('totalPrice');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalPriceDiv.textContent = formatCurrency(0);
        return;
    }

    let totalPrice = 0;
    cartItemsDiv.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>Qty: ${item.quantity}</p>
                </div>
                <div>
                    <div class="cart-item-price">${formatCurrency(itemTotal)}</div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    totalPriceDiv.textContent = formatCurrency(totalPrice);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
    showNotification('Item removed from cart');
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.style.display = cartSidebar.style.display === 'none' ? 'flex' : 'none';
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

async function submitOrder(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const orderNotes = document.getElementById('orderNotes').value;

    const items = cart.map(item => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }));

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerName,
                items,
                totalPrice,
                notes: orderNotes
            })
        });

        const order = await response.json();

        if (response.ok) {
            closeOrderModal();
            showOrderConfirmation(order);
            cart = [];
            updateCart();
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification('Error placing order. Please try again.');
    }
}

function showOrderConfirmation(order) {
    const confirmationMessage = document.getElementById('confirmationMessage');
    const orderDetailsMessage = document.getElementById('orderDetailsMessage');
    
    confirmationMessage.textContent = `Your order #${order.id} has been confirmed!`;
    
    const itemsList = order.items.map(item => 
        `${item.name} x${item.quantity}`
    ).join(', ');
    
    orderDetailsMessage.innerHTML = `
        <strong>Order Details:</strong><br>
        Items: ${itemsList}<br>
        Total: ${formatCurrency(order.totalPrice)}<br>
        Status: ${order.status}
    `;
    
    document.getElementById('confirmationModal').classList.add('active');
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').classList.remove('active');
    toggleCart();
}

// ===== CHAT FUNCTIONS =====

async function loadChatHistory() {
    try {
        const response = await fetch(`${API_BASE}/messages`);
        if (!response.ok) {
            console.error('Messages fetch failed', response.status, response.statusText);
            return;
        }
        const messages = await response.json();
        
        // Display bot's initial greeting if no messages
        if (messages.length === 0) return;

        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        messages.forEach(msg => {
            const isBot = msg.sender === 'bot';
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isBot ? 'bot-message' : 'user-message'}`;
            messageDiv.innerHTML = `<p>${escapeHtml(msg.content)}</p>`;
            chatMessages.appendChild(messageDiv);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();

    if (!content) return;

    // Add user message to chat
    addMessageToChat(content, 'user');

    // Send to server
    try {
        // Save user message
        await fetch(`${API_BASE}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                sender: 'user'
            })
        });

        messageInput.value = '';

        // Get enhanced bot response
        const botResponse = await fetch(`${API_BASE}/bot-response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userMessage: content
            })
        });

        if (botResponse.ok) {
            const data = await botResponse.json();
            setTimeout(() => {
                addMessageToChat(data.response, 'bot');
            }, 500);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message');
    }
}

function addMessageToChat(content, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender === 'bot' ? 'bot-message' : 'user-message'}`;
    messageDiv.innerHTML = `<p>${escapeHtml(content)}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== UTILITY FUNCTIONS =====

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    // You can enhance this with a toast notification library
    console.log(message);
}
