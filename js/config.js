// ====================================================================
// MarketLink – eGreen Basket: Configuration
// University Full-Stack Project Settings & Credentials
// Architecture: Vercel / Netlify Serverless Backend with MongoDB Atlas
// ====================================================================

const ML_CONFIG = {
    appName: 'MarketLink',
    appSubtitle: 'eGreen Basket',
    tagline: 'Discover Local. Eat Fresh.',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    
    // Backend API Base Route (Vercel & Netlify Serverless Functions)
    apiBaseUrl: '/api',
    
    // Database Architecture Info
    database: 'MongoDB Atlas',
    hosting: 'Vercel / Netlify Serverless',
    
    // Storage keys for local demo persistence & session caching
    STORAGE_KEYS: {
        MARKETS: 'ml_demo_markets',
        FARMERS: 'ml_demo_farmers',
        PRODUCTS: 'ml_demo_products',
        CATEGORIES: 'ml_demo_categories',
        ORDERS: 'ml_demo_orders',
        CUSTOMERS: 'ml_demo_customers',
        FAVORITES: 'ml_demo_favorites',
        REVIEWS: 'ml_demo_reviews',
        PICKUP_SLOTS: 'ml_demo_pickup_slots',
        AUTH_USER: 'ml_auth_user',
        CART: 'ml_cart_items'
    }
};

window.ML_CONFIG = ML_CONFIG;
