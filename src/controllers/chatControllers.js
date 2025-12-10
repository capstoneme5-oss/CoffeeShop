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

            // Get menu items for context
            const menuItems = await db.Menu.findAll();
            
            // Generate bot response
            const botResponse = await chatbotService.getContextualResponse(userMessage, menuItems);
            
            // Save bot response
            const savedMessage = await db.Message.create({
                content: botResponse,
                sender: 'bot',
            });

            res.json({
                response: botResponse,
                message: savedMessage
            });
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
            const menuItems = await db.Menu.findAll({
                where: { available: true },
            });
            res.json(menuItems);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBestsellers(req, res) {
        try {
            const limit = req.query.limit || 6;
            const bestsellers = await db.Menu.findAll({
                where: { 
                    available: true,
                    isBestseller: true 
                },
                order: [['salesCount', 'DESC']],
                limit: parseInt(limit),
            });
            res.json(bestsellers);
        } catch (error) {
            res.status(500).json({ error: error.message });
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