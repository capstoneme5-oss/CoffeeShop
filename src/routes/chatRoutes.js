const express = require('express');
const CoffeeshopController = require('../controllers/chatControllers');

module.exports = () => {
    const router = express.Router();
    const controller = new CoffeeshopController();

    // Chat routes
    router.post('/message', controller.sendMessage.bind(controller));
    router.get('/messages', controller.getMessages.bind(controller));
    router.post('/bot-response', controller.getBotResponse.bind(controller));

    // Menu routes
    router.get('/menu', controller.getMenu.bind(controller));
    router.get('/bestsellers', controller.getBestsellers.bind(controller));
    // Debug route to inspect env vars at runtime (temporary)
    router.get('/debug-env', (req, res) => {
        const useFirebase = process.env.USE_FIREBASE === 'true';
        const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT || null;
        let project_id = null;
        let saValid = false;
        if (saRaw) {
            try {
                const sa = JSON.parse(saRaw);
                project_id = sa.project_id || null;
                saValid = true;
            } catch (e) {
                project_id = 'INVALID_JSON';
            }
        }
        res.json({
            USE_FIREBASE: useFirebase,
            FIREBASE_SERVICE_ACCOUNT_SET: !!saRaw,
            FIREBASE_SERVICE_ACCOUNT_VALID_JSON: saValid,
            PROJECT_ID: project_id,
            NETLIFY: !!process.env.NETLIFY,
        });
    });
    router.post('/menu', controller.addMenuItem.bind(controller));
    router.put('/menu/:id', controller.updateMenuItem.bind(controller));

    // Order routes
    router.post('/orders', controller.createOrder.bind(controller));
    router.get('/orders', controller.getOrders.bind(controller));
    router.get('/orders/:id', controller.getOrderById.bind(controller));
    router.put('/orders/:id', controller.updateOrderStatus.bind(controller));

    return router;
};