// ====================================================================
// MarketLink – eGreen Basket: Legacy Compatibility Adapter
// Supabase has been removed in favor of MongoDB Atlas & Vercel Backend
// Forwarding data layer to js/db.js
// ====================================================================

// Note: Please load js/db.js directly. This file exists for backward compatibility.
if (!window.DB) {
    console.warn('⚠️ Supabase client has been replaced with MongoDB Atlas & Vercel API (js/db.js).');
}
