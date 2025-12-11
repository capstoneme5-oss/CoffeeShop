const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const chatRoutes = require('./routes/chatRoutes');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// Serve static files with error handling
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Routes
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../public/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.json({ message: 'Welcome to CoffeeShop API', health: 'ok' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Debug endpoint to check environment (remove in production)
app.get('/debug-env', (req, res) => {
    const useFirebase = process.env.USE_FIREBASE === 'true';
    const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT;
    const projectId = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? (() => {
            try {
                const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                return sa.project_id;
            } catch (e) {
                return 'ERROR_PARSING_JSON';
            }
        })()
        : 'NOT_SET';
    res.json({
        USE_FIREBASE: useFirebase,
        FIREBASE_SERVICE_ACCOUNT_SET: hasServiceAccount,
        PROJECT_ID: projectId,
        NETLIFY: !!process.env.NETLIFY,
    });
});

try {
  app.use('/api', chatRoutes());
} catch (error) {
  console.warn('Chat routes initialization skipped:', error.message);
  // Chat routes will fail gracefully if database is not available
}

module.exports = app;