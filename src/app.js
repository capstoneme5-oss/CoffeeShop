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

try {
  app.use('/api', chatRoutes());
} catch (error) {
  console.warn('Chat routes initialization skipped:', error.message);
  // Chat routes will fail gracefully if database is not available
}

module.exports = app;