require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vercel Serverless Function adapter for Express local testing
function adaptVercelHandler(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (err) {
            console.error('API Error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: err.message });
            }
        }
    };
}

// Mount all API endpoints matching Vercel Serverless function routing
app.all('/api/health', adaptVercelHandler(require('./api/health')));
app.all('/api/seed', adaptVercelHandler(require('./api/seed')));
app.all('/api/markets', adaptVercelHandler(require('./api/markets')));
app.all('/api/farmers', adaptVercelHandler(require('./api/farmers')));
app.all('/api/products', adaptVercelHandler(require('./api/products')));
app.all('/api/orders', adaptVercelHandler(require('./api/orders')));
app.all('/api/categories', adaptVercelHandler(require('./api/categories')));
app.all('/api/auth', adaptVercelHandler(require('./api/auth')));
app.all('/api/reviews', adaptVercelHandler(require('./api/reviews')));
app.all('/api/favorites', adaptVercelHandler(require('./api/favorites')));
app.all('/api/slots', adaptVercelHandler(require('./api/slots')));
app.all('/api/customers', adaptVercelHandler(require('./api/customers')));
app.all('/api/stats', adaptVercelHandler(require('./api/stats')));
app.all('/api/contact', adaptVercelHandler(require('./api/contact')));

// Serve static frontend files (HTML, CSS, JS, Assets)
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌿 MarketLink – eGreen Basket`);
    console.log(`🚀 Web Application & Vercel API running at:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: MongoDB Atlas (Configured via MONGODB_URI)`);
    console.log(`======================================================\n`);
});
