// ====================================================================
// MarketLink – eGreen Basket: Full Project & Endpoint Verification
// Tests HTML pages, assets, scripts, schemas, and Vercel API endpoints
// ====================================================================

const http = require('http');
const path = require('path');
const express = require('express');

const PORT = 3001;

// Setup test app
const app = express();
app.use(express.json());

function adapt(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}

// Mount Vercel API endpoints
app.all('/api/health', adapt(require('../api/health')));
app.all('/api/markets', adapt(require('../api/markets')));
app.all('/api/farmers', adapt(require('../api/farmers')));
app.all('/api/products', adapt(require('../api/products')));
app.all('/api/orders', adapt(require('../api/orders')));
app.all('/api/categories', adapt(require('../api/categories')));
app.all('/api/auth', adapt(require('../api/auth')));
app.all('/api/reviews', adapt(require('../api/reviews')));
app.all('/api/favorites', adapt(require('../api/favorites')));
app.all('/api/slots', adapt(require('../api/slots')));
app.all('/api/customers', adapt(require('../api/customers')));
app.all('/api/stats', adapt(require('../api/stats')));
app.all('/api/contact', adapt(require('../api/contact')));
app.all('/api/seed', adapt(require('../api/seed')));

// Serve static frontend
app.use(express.static(path.join(__dirname, '..')));

const endpoints = [
    // Core HTML pages
    'index.html',
    'markets.html',
    'farmers.html',
    'farmer-profile.html',
    'products.html',
    'product-details.html',
    'cart.html',
    'checkout.html',
    'login.html',
    'register.html',
    'about.html',
    'contact.html',
    // Customer portal
    'customer/dashboard.html',
    'customer/orders.html',
    'customer/favorites.html',
    'customer/profile.html',
    // Farmer portal
    'farmer/dashboard.html',
    'farmer/products.html',
    'farmer/orders.html',
    'farmer/pickup-slots.html',
    'farmer/profile.html',
    // Admin portal
    'admin/dashboard.html',
    'admin/users.html',
    'admin/farmers.html',
    'admin/markets.html',
    'admin/products.html',
    'admin/reviews.html',
    'admin/reports.html',
    // CSS & JS assets
    'css/style.css',
    'js/config.js',
    'js/demo-data.js',
    'js/db.js',
    'js/supabase.js',
    'js/auth.js',
    'js/app.js',
    'js/cart.js',
    'js/checkout.js',
    'js/chatbot.js',
    'js/markets.js',
    'js/products.js',
    'js/farmer.js',
    'js/admin.js',
    // Database schemas
    'database/mysql-schema.sql',
    'database/mongodb-seed.json',
    // Vercel Serverless API endpoints
    'api/health',
    'api/markets',
    'api/products',
    'api/categories',
    'api/farmers',
    'api/customers',
    'api/stats',
    'api/slots',
    'api/reviews'
];

const server = app.listen(PORT, async () => {
    console.log(`\n🔍 Verifying ${endpoints.length} MarketLink endpoints on http://localhost:${PORT}...\n`);

    let passed = 0;
    let failed = 0;

    for (const ep of endpoints) {
        const url = `http://localhost:${PORT}/${ep}`;
        try {
            const res = await fetch(url);
            if (res.status === 200) {
                console.log(`  ✅ [200 OK] /${ep}`);
                passed++;
            } else {
                console.log(`  ❌ [${res.status}] /${ep}`);
                failed++;
            }
        } catch (e) {
            console.log(`  ❌ [ERR] /${ep}: ${e.message}`);
            failed++;
        }
    }

    console.log(`\n======================================================`);
    console.log(`🎯 Test Results: ${passed} PASSED, ${failed} FAILED (Total: ${endpoints.length})`);
    console.log(`======================================================\n`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
});
