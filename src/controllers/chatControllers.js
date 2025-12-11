const db = require('../models');
const firebaseClient = require('../services/firebaseClient');
const ChatbotService = require('../services/chatbot');
const fallbackMenuData = require('../data/fallbackMenu');

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

            // Attempt to get menu items for context, prefer Firebase when enabled
            let menuItems = [];
            try {
                if (process.env.USE_FIREBASE === 'true') {
                    menuItems = await firebaseClient.getMenuItems();
                } else if (db && db.Menu && typeof db.Menu.findAll === 'function') {
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
                if (process.env.USE_FIREBASE === 'true') {
                    savedMessage = await firebaseClient.createMessage({ content: botResponse, sender: 'bot' });
                } else if (db && db.Message && typeof db.Message.create === 'function') {
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
            // If Firebase is enabled, try it first
            if (process.env.USE_FIREBASE === 'true') {
                try {
                    const fbItems = await firebaseClient.getMenuItems();
                    if (fbItems && fbItems.length > 0) {
                        console.log('Served', fbItems.length, 'menu items from Firestore');
                        return res.json(fbItems);
                    }
                } catch (fbErr) {
                    console.warn('Firebase menu retrieval failed:', fbErr.message);
                }
            }

            // Try MySQL database
            if (db && db.Menu && typeof db.Menu.findAll === 'function') {
                try {
                    const menuItems = await db.Menu.findAll({
                        where: { available: true },
                    });
                    if (menuItems && menuItems.length > 0) {
                        console.log('Served', menuItems.length, 'menu items from MySQL');
                        return res.json(menuItems);
                    }
                } catch (dbErr) {
                    console.warn('MySQL menu query failed:', dbErr.message);
                }
            }

            // Fallback to hardcoded fallback menu data
            const filtered = fallbackMenuData.filter(i => i.available !== false);
            console.log('Serving', filtered.length, 'menu items from fallback data');
            res.json(filtered);
        } catch (error) {
            console.error('getMenu error:', error && error.message ? error.message : error);
            // Last resort: return the fallback data directly
            res.json(fallbackMenuData.filter(i => i.available !== false));
        }
    }

    async getBestsellers(req, res) {
        try {
            const limit = req.query.limit || 6;

            // If Firebase is enabled, try it first
            if (process.env.USE_FIREBASE === 'true') {
                try {
                    const fbSellers = await firebaseClient.getBestsellers(limit);
                    if (fbSellers && fbSellers.length > 0) {
                        console.log('Served', fbSellers.length, 'bestsellers from Firestore');
                        return res.json(fbSellers);
                    }
                } catch (fbErr) {
                    console.warn('Firebase bestsellers retrieval failed:', fbErr.message);
                }
            }

            // Try MySQL database
            if (db && db.Menu && typeof db.Menu.findAll === 'function') {
                try {
                    const bestsellers = await db.Menu.findAll({
                        where: { 
                            available: true,
                            isBestseller: true 
                        },
                        order: [['salesCount', 'DESC']],
                        limit: parseInt(limit),
                    });
                    if (bestsellers && bestsellers.length > 0) {
                        console.log('Served', bestsellers.length, 'bestsellers from MySQL');
                        return res.json(bestsellers);
                    }
                } catch (dbErr) {
                    console.warn('MySQL bestsellers query failed:', dbErr.message);
                }
            }

            // Fallback to hardcoded fallback menu data
            const sellers = fallbackMenuData
                .filter(i => i.available !== false && i.isBestseller)
                .sort((a,b) => (b.salesCount||0)-(a.salesCount||0))
                .slice(0, parseInt(limit));
            console.log('Serving', sellers.length, 'bestsellers from fallback data');
            res.json(sellers);
        } catch (error) {
            console.error('getBestsellers error:', error && error.message ? error.message : error);
            // Last resort: return bestsellers from fallback data
            const sellers = fallbackMenuData
                .filter(i => i.available !== false && i.isBestseller)
                .sort((a,b) => (b.salesCount||0)-(a.salesCount||0))
                .slice(0, 6);
            res.json(sellers);
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
            
            // Validate input
            if (!customerName || !items || items.length === 0) {
                return res.status(400).json({ error: 'Customer name and items are required' });
            }

            // Calculate total price
            let totalPrice = 0;
            for (const item of items) {
                totalPrice += (item.price || 0) * item.quantity;
            }

            let order = null;

            // Try to save to MySQL first (if available)
            if (db && db.Order && typeof db.Order.create === 'function') {
                try {
                    order = await db.Order.create({
                        customerName,
                        items,
                        totalPrice,
                        notes,
                        status: 'Pending',
                    });
                    console.log('Order saved to MySQL:', order.id);
                } catch (dbErr) {
                    console.warn('Failed to save order to MySQL:', dbErr && dbErr.message ? dbErr.message : dbErr);
                    // Continue to try Firestore
                }
            }

            // Try to save to Firestore if enabled and MySQL failed
            if (!order && process.env.USE_FIREBASE === 'true') {
                try {
                    const orderRef = await firebaseClient.createOrder({
                        customerName,
                        items,
                        totalPrice,
                        notes,
                        status: 'Pending',
                        createdAt: new Date().toISOString(),
                    });
                    order = {
                        id: orderRef.id || 'firebase-order',
                        customerName,
                        items,
                        totalPrice,
                        notes,
                        status: 'Pending',
                    };
                    console.log('Order saved to Firestore:', orderRef.id);
                } catch (firebaseErr) {
                    console.warn('Failed to save order to Firestore:', firebaseErr && firebaseErr.message ? firebaseErr.message : firebaseErr);
                }
            }

            // If order was created, return it
            if (order) {
                // Try to save order confirmation message (optional, don't fail if it doesn't work)
                try {
                    const orderMessage = `Order placed for ${customerName}. Order ID: ${order.id}. Total: ₱${parseFloat(order.totalPrice).toFixed(2)}`;
                    if (process.env.USE_FIREBASE === 'true') {
                        await firebaseClient.createMessage({ content: orderMessage, sender: 'bot' });
                    } else if (db && db.Message && typeof db.Message.create === 'function') {
                        await db.Message.create({ content: orderMessage, sender: 'bot' });
                    }
                } catch (msgErr) {
                    console.warn('Failed to save order message:', msgErr && msgErr.message ? msgErr.message : msgErr);
                    // Don't fail the order if message save fails
                }

                return res.status(201).json(order);
            }

            // If we get here, order creation failed on both backends
            return res.status(500).json({ error: 'Failed to create order. Please try again later.' });
        } catch (error) {
            console.error('createOrder error:', error && error.message ? error.message : error);
            res.status(500).json({ error: error.message || 'Error creating order' });
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