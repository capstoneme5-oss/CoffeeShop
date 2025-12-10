const db = require('../models');
const ChatbotService = require('../services/chatbot');

const chatbotService = new ChatbotService(db);

class CoffeeshopController {
    // Chat message operations
    async sendMessage(req, res) {
        try {
            const { content, sender } = req.body;
            const message = await db.Message.create({
                content,
                sender,
            });
            res.json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMessages(req, res) {
        try {
            const messages = await db.Message.findAll();
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBotResponse(req, res) {
        try {
            const { userMessage } = req.body;
            
            if (!userMessage) {
                return res.status(400).json({ error: 'userMessage is required' });
            }

            // Attempt to get menu items for context, but continue if DB access fails
            let menuItems = [];
            try {
                if (db && db.Menu && typeof db.Menu.findAll === 'function') {
                    menuItems = await db.Menu.findAll();
                }
            } catch (menuErr) {
                console.warn('Could not fetch menu for bot context:', menuErr && menuErr.message ? menuErr.message : menuErr);
                menuItems = [];
            }

            // Generate bot response (will use internal knowledgeBase if menu empty)
            const botResponse = await chatbotService.getContextualResponse(userMessage, menuItems);

            // Try to persist bot response, but do not fail if DB is unavailable
            let savedMessage = null;
            try {
                if (db && db.Message && typeof db.Message.create === 'function') {
                    savedMessage = await db.Message.create({ content: botResponse, sender: 'bot' });
                }
            } catch (persistErr) {
                console.warn('Failed to persist bot message:', persistErr && persistErr.message ? persistErr.message : persistErr);
                savedMessage = null;
            }

            res.json({ response: botResponse, message: savedMessage });
        } catch (error) {
            console.error('getBotResponse error:', error && error.message ? error.message : error);

            // Attempt to return a friendly fallback response so the frontend always shows something.
            const fallback = "Sorry, I'm having trouble answering right now. Please try again soon or check our menu above.";

            try {
                // Try to persist fallback message if DB is available
                if (db && db.Message && typeof db.Message.create === 'function') {
                    await db.Message.create({ content: fallback, sender: 'bot' });
                }
            } catch (persistErr) {
                console.warn('Failed to persist fallback bot message:', persistErr && persistErr.message ? persistErr.message : persistErr);
            }

            res.json({ response: fallback, message: null });
        }
    }

    // Menu operations
    async getMenu(req, res) {
        try {
            // If running on Netlify (serverless), force using bundled sample data
            if (process.env.NETLIFY) {
                try {
                    const data = require('../data/menu.json');
                    return res.json(Array.isArray(data) ? data.filter(i => i.available) : []);
                } catch (e) {
                    console.warn('Failed to load bundled sample menu on Netlify:', e && e.message ? e.message : e);
                }
            }
            const menuItems = await db.Menu.findAll({
                where: { available: true },
            });
            // If DB returned empty, use internal static fallback bundled with the function
            if (!menuItems || (Array.isArray(menuItems) && menuItems.length === 0)) {
                try {
                    const data = require('../data/menu.json');
                    return res.json(Array.isArray(data) ? data.filter(i => i.available) : []);
                } catch (fallbackErr) {
                    console.warn('Failed to load internal fallback menu:', fallbackErr && fallbackErr.message ? fallbackErr.message : fallbackErr);
                }
            }
            res.json(menuItems);
        } catch (error) {
            console.error('getMenu error:', error && error.message ? error.message : error);
            // Return empty list so frontend doesn't break when DB is unavailable
            res.json([]);
        }
    }

    async getBestsellers(req, res) {
        try {
            // If running on Netlify (serverless), force using bundled sample data
            if (process.env.NETLIFY) {
                try {
                    const data = require('../data/menu.json');
                    const limit = req.query.limit || 6;
                    if (Array.isArray(data)) {
                        const sellers = data.filter(i => i.available && i.isBestseller).sort((a,b) => (b.salesCount||0)-(a.salesCount||0)).slice(0, parseInt(limit));
                        return res.json(sellers);
                    }
                    return res.json([]);
                } catch (e) {
                    console.warn('Failed to load bundled sample bestsellers on Netlify:', e && e.message ? e.message : e);
                }
            }
            const limit = req.query.limit || 6;
            const bestsellers = await db.Menu.findAll({
                where: { 
                    available: true,
                    isBestseller: true 
                },
                order: [['salesCount', 'DESC']],
                limit: parseInt(limit),
            });
            // If DB returned empty, use internal static fallback bundled with the function
            if (!bestsellers || (Array.isArray(bestsellers) && bestsellers.length === 0)) {
                try {
                    const data = require('../data/menu.json');
                    if (Array.isArray(data)) {
                        const sellers = data.filter(i => i.available && i.isBestseller).sort((a,b) => (b.salesCount||0)-(a.salesCount||0)).slice(0, parseInt(limit));
                        return res.json(sellers);
                    }
                } catch (fallbackErr) {
                    console.warn('Failed to load internal fallback bestsellers:', fallbackErr && fallbackErr.message ? fallbackErr.message : fallbackErr);
                }
            }
            res.json(bestsellers);
        } catch (error) {
            console.error('getBestsellers error:', error && error.message ? error.message : error);
            // Return empty list on error to keep UI usable
            res.json([]);
        }
    }

    async addMenuItem(req, res) {
        try {
            const { name, description, category, price, available } = req.body;
            const menuItem = await db.Menu.create({
                name,
                description,
                category,
                price,
                available: available !== false,
            });
            res.status(201).json(menuItem);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateMenuItem(req, res) {
        try {
            const { id } = req.params;
            const { name, description, category, price, available } = req.body;
            const menuItem = await db.Menu.findByPk(id);
            if (!menuItem) {
                return res.status(404).json({ error: 'Menu item not found' });
            }
            await menuItem.update({
                name,
                description,
                category,
                price,
                available,
            });
            res.json(menuItem);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Order operations
    async createOrder(req, res) {
        try {
            const { customerName, items, notes } = req.body;
            
            // Calculate total price
            let totalPrice = 0;
            for (const item of items) {
                const menuItem = await db.Menu.findByPk(item.menuItemId);
                if (!menuItem) {
                    return res.status(404).json({ error: `Menu item ${item.menuItemId} not found` });
                }
                totalPrice += menuItem.price * item.quantity;
            }

            const order = await db.Order.create({
                customerName,
                items,
                totalPrice,
                notes,
                status: 'Pending',
            });
            
            // Save order confirmation message
            const orderMessage = `Order placed for ${customerName}. Order ID: ${order.id}. Total: ₱${parseFloat(order.totalPrice).toFixed(2)}`;
            await db.Message.create({
                content: orderMessage,
                sender: 'bot',
            });

            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getOrders(req, res) {
        try {
            const orders = await db.Order.findAll({
                order: [['createdAt', 'DESC']],
            });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await db.Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await db.Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            await order.update({ status });
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CoffeeshopController;