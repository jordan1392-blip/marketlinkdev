// ====================================================================
// MarketLink – eGreen Basket: Universal Data Access Layer
// Supports MongoDB Atlas via Vercel/Netlify Serverless API
// Seamless offline/presentation localStorage fallback
// ====================================================================

// Initialize local demo data storage if needed
function initDemoLocalStorage() {
    const keys = ML_CONFIG.STORAGE_KEYS;
    if (!localStorage.getItem(keys.MARKETS)) {
        localStorage.setItem(keys.MARKETS, JSON.stringify(DEMO_MARKETS));
    }
    if (!localStorage.getItem(keys.FARMERS)) {
        localStorage.setItem(keys.FARMERS, JSON.stringify(DEMO_FARMERS));
    }
    if (!localStorage.getItem(keys.PRODUCTS)) {
        localStorage.setItem(keys.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
    }
    if (!localStorage.getItem(keys.CATEGORIES)) {
        localStorage.setItem(keys.CATEGORIES, JSON.stringify(DEMO_CATEGORIES));
    }
    if (!localStorage.getItem(keys.CUSTOMERS)) {
        localStorage.setItem(keys.CUSTOMERS, JSON.stringify(DEMO_CUSTOMERS));
    }
    if (!localStorage.getItem(keys.ORDERS)) {
        localStorage.setItem(keys.ORDERS, JSON.stringify(DEMO_ORDERS));
    }
    if (!localStorage.getItem(keys.REVIEWS)) {
        localStorage.setItem(keys.REVIEWS, JSON.stringify(DEMO_REVIEWS));
    }
    if (!localStorage.getItem(keys.PICKUP_SLOTS)) {
        localStorage.setItem(keys.PICKUP_SLOTS, JSON.stringify(DEMO_PICKUP_SLOTS));
    }
    if (!localStorage.getItem(keys.FAVORITES)) {
        localStorage.setItem(keys.FAVORITES, JSON.stringify([
            { id: 'fav-1', customer_id: 'usr-customer-1', item_type: 'farmer', item_id: 'fm-1' },
            { id: 'fav-2', customer_id: 'usr-customer-1', item_type: 'product', item_id: 'prod-1' },
            { id: 'fav-3', customer_id: 'usr-customer-1', item_type: 'market', item_id: 'mkt-isb-f6' }
        ]));
    }
}

initDemoLocalStorage();

// API Helper
const API = {
    baseUrl: (window.ML_CONFIG && window.ML_CONFIG.apiBaseUrl) ? window.ML_CONFIG.apiBaseUrl : '/api',

    async request(endpoint, options = {}) {
        try {
            // If running via file:// or disconnected, throw to fallback directly
            if (window.location.protocol === 'file:') {
                throw new Error('Local file protocol detected');
            }

            const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
            const res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                },
                ...options
            });

            if (!res.ok) {
                throw new Error(`API responded with ${res.status}: ${res.statusText}`);
            }

            return await res.json();
        } catch (err) {
            // Silently fall back to local storage
            return null;
        }
    }
};

// Unified Database Interface
const DB = {
    // ----------------- BACKEND HEALTH & SEED -----------------
    async checkBackendHealth() {
        try {
            const res = await fetch(`${API.baseUrl}/health`);
            return await res.json();
        } catch (e) {
            return {
                status: 'offline',
                connected: false,
                database: 'Local Demo Storage',
                message: 'Local presentation mode active (API server not running).'
            };
        }
    },

    async seedBackendDatabase(force = false) {
        try {
            const res = await fetch(`${API.baseUrl}/seed?force=${force}`);
            return await res.json();
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    },

    // ----------------- MARKETS -----------------
    async getMarkets() {
        const remote = await API.request('/markets');
        if (remote && Array.isArray(remote) && remote.length > 0) {
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.MARKETS, JSON.stringify(remote));
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.MARKETS);
        return stored ? JSON.parse(stored) : DEMO_MARKETS;
    },

    async getMarketById(id) {
        const remote = await API.request(`/markets?id=${encodeURIComponent(id)}`);
        if (remote && remote.id) return remote;
        const markets = await this.getMarkets();
        return markets.find(m => m.id === id) || null;
    },

    async saveMarket(marketData) {
        // Try remote first
        const remote = await API.request('/markets', {
            method: 'POST',
            body: JSON.stringify(marketData)
        });

        const markets = await this.getMarkets();
        const saved = (remote && remote.data) ? remote.data : marketData;

        if (saved.id) {
            const index = markets.findIndex(m => m.id === saved.id);
            if (index !== -1) markets[index] = { ...markets[index], ...saved };
            else markets.unshift(saved);
        } else {
            saved.id = 'mkt-' + Date.now();
            saved.farmer_count = 0;
            markets.unshift(saved);
        }

        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.MARKETS, JSON.stringify(markets));
        return saved;
    },

    async deleteMarket(id) {
        await API.request(`/markets?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        let markets = await this.getMarkets();
        markets = markets.filter(m => m.id !== id);
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.MARKETS, JSON.stringify(markets));
        return true;
    },

    // ----------------- FARMERS -----------------
    async getFarmers() {
        const remote = await API.request('/farmers');
        if (remote && Array.isArray(remote) && remote.length > 0) {
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.FARMERS, JSON.stringify(remote));
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.FARMERS);
        return stored ? JSON.parse(stored) : DEMO_FARMERS;
    },

    async getFarmerById(id) {
        const remote = await API.request(`/farmers?id=${encodeURIComponent(id)}`);
        if (remote && remote.id) return remote;
        const farmers = await this.getFarmers();
        return farmers.find(f => f.id === id) || null;
    },

    async getFarmerByEmail(email) {
        const remote = await API.request(`/farmers?email=${encodeURIComponent(email)}`);
        if (remote && remote.email) return remote;
        const farmers = await this.getFarmers();
        return farmers.find(f => f.email && f.email.toLowerCase() === email.toLowerCase()) || null;
    },

    async saveFarmer(farmerData) {
        const remote = await API.request('/farmers', {
            method: 'POST',
            body: JSON.stringify(farmerData)
        });

        const farmers = await this.getFarmers();
        const saved = (remote && remote.data) ? remote.data : farmerData;

        if (saved.id) {
            const idx = farmers.findIndex(f => f.id === saved.id);
            if (idx !== -1) farmers[idx] = { ...farmers[idx], ...saved };
            else farmers.unshift(saved);
        } else {
            saved.id = 'fm-' + Date.now();
            saved.rating = 5.0;
            saved.reviews_count = 0;
            farmers.unshift(saved);
        }
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
        return saved;
    },

    async updateFarmerStatus(id, status) {
        await API.request('/farmers', {
            method: 'PATCH',
            body: JSON.stringify({ id, status })
        });
        const farmers = await this.getFarmers();
        const farmer = farmers.find(f => f.id === id);
        if (farmer) {
            farmer.status = status;
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
            return true;
        }
        return false;
    },

    // ----------------- CATEGORIES -----------------
    async getCategories() {
        const remote = await API.request('/categories');
        if (remote && Array.isArray(remote) && remote.length > 0) {
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.CATEGORIES, JSON.stringify(remote));
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.CATEGORIES);
        return stored ? JSON.parse(stored) : DEMO_CATEGORIES;
    },

    // ----------------- PRODUCTS -----------------
    async getProducts() {
        const remote = await API.request('/products');
        if (remote && Array.isArray(remote) && remote.length > 0) {
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(remote));
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.PRODUCTS);
        return stored ? JSON.parse(stored) : DEMO_PRODUCTS;
    },

    async getProductById(id) {
        const remote = await API.request(`/products?id=${encodeURIComponent(id)}`);
        if (remote && remote.id) return remote;
        const products = await this.getProducts();
        return products.find(p => p.id === id) || null;
    },

    async getProductsByFarmer(farmerId) {
        const remote = await API.request(`/products?farmer_id=${encodeURIComponent(farmerId)}`);
        if (remote && Array.isArray(remote)) return remote;
        const products = await this.getProducts();
        return products.filter(p => p.farmer_id === farmerId);
    },

    async saveProduct(productData) {
        const remote = await API.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });

        const products = await this.getProducts();
        const saved = (remote && remote.data) ? remote.data : productData;

        if (saved.id) {
            const idx = products.findIndex(p => p.id === saved.id);
            if (idx !== -1) products[idx] = { ...products[idx], ...saved };
            else products.unshift(saved);
        } else {
            saved.id = 'prod-' + Date.now();
            products.unshift(saved);
        }
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return saved;
    },

    async deleteProduct(id) {
        await API.request(`/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        let products = await this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return true;
    },

    async updateProductStock(id, newStock) {
        await API.request('/products', {
            method: 'PATCH',
            body: JSON.stringify({ id, newStock })
        });
        const products = await this.getProducts();
        const prod = products.find(p => p.id === id);
        if (prod) {
            prod.stock_quantity = parseInt(newStock, 10);
            if (prod.stock_quantity <= 0) {
                prod.status = 'sold_out';
            } else if (prod.status === 'sold_out') {
                prod.status = 'available';
            }
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            return true;
        }
        return false;
    },

    // ----------------- ORDERS -----------------
    async getOrders() {
        const remote = await API.request('/orders');
        if (remote && Array.isArray(remote) && remote.length > 0) {
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(remote));
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.ORDERS);
        return stored ? JSON.parse(stored) : DEMO_ORDERS;
    },

    async getOrderById(id) {
        const remote = await API.request(`/orders?id=${encodeURIComponent(id)}`);
        if (remote && remote.id) return remote;
        const orders = await this.getOrders();
        return orders.find(o => o.id === id || o.order_number === id) || null;
    },

    async getOrdersByCustomer(customerId) {
        const remote = await API.request(`/orders?customer_id=${encodeURIComponent(customerId)}`);
        if (remote && Array.isArray(remote)) return remote;
        const orders = await this.getOrders();
        return orders.filter(o => o.customer_id === customerId);
    },

    async getOrdersByFarmer(farmerId) {
        const remote = await API.request(`/orders?farmer_id=${encodeURIComponent(farmerId)}`);
        if (remote && Array.isArray(remote)) return remote;
        const orders = await this.getOrders();
        return orders.filter(o => o.farmer_id === farmerId);
    },

    async createOrder(orderData) {
        const remote = await API.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        const orders = await this.getOrders();
        const randId = Math.floor(100 + Math.random() * 900);
        const newOrder = (remote && remote.data) ? remote.data : {
            id: 'ord-' + Date.now(),
            order_number: 'ML-' + new Date().getFullYear() + '-' + randId,
            status: 'Placed',
            created_at: new Date().toISOString(),
            ...orderData
        };

        // Deduct local product stock
        if (newOrder.items && newOrder.items.length > 0) {
            for (const item of newOrder.items) {
                const prod = await this.getProductById(item.product_id);
                if (prod) {
                    const updatedStock = Math.max(0, prod.stock_quantity - item.quantity);
                    await this.updateProductStock(prod.id, updatedStock);
                }
            }
        }

        orders.unshift(newOrder);
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        return newOrder;
    },

    async updateOrderStatus(orderId, newStatus) {
        await API.request('/orders', {
            method: 'PATCH',
            body: JSON.stringify({ id: orderId, status: newStatus })
        });
        const orders = await this.getOrders();
        const order = orders.find(o => o.id === orderId || o.order_number === orderId);
        if (order) {
            order.status = newStatus;
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
            return true;
        }
        return false;
    },

    async cancelOrder(orderId) {
        return this.updateOrderStatus(orderId, 'Cancelled');
    },

    // ----------------- FAVORITES -----------------
    async getFavorites(customerId) {
        const remote = await API.request(`/favorites?customer_id=${encodeURIComponent(customerId || '')}`);
        if (remote && Array.isArray(remote)) {
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.FAVORITES);
        const allFavs = stored ? JSON.parse(stored) : [];
        return customerId ? allFavs.filter(f => f.customer_id === customerId) : allFavs;
    },

    async isFavorite(customerId, itemType, itemId) {
        const favs = await this.getFavorites(customerId);
        return favs.some(f => f.item_type === itemType && f.item_id === itemId);
    },

    async toggleFavorite(customerId, itemType, itemId) {
        const remote = await API.request('/favorites', {
            method: 'POST',
            body: JSON.stringify({ customer_id: customerId, item_type: itemType, item_id: itemId })
        });

        let stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.FAVORITES);
        let allFavs = stored ? JSON.parse(stored) : [];
        const existingIdx = allFavs.findIndex(f => f.customer_id === customerId && f.item_type === itemType && f.item_id === itemId);

        let isNowSaved = false;
        if (existingIdx !== -1) {
            allFavs.splice(existingIdx, 1);
            isNowSaved = false;
        } else {
            allFavs.push({
                id: 'fav-' + Date.now(),
                customer_id: customerId,
                item_type: itemType,
                item_id: itemId,
                created_at: new Date().toISOString()
            });
            isNowSaved = true;
        }
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(allFavs));
        return (remote && typeof remote.isSaved === 'boolean') ? remote.isSaved : isNowSaved;
    },

    // ----------------- REVIEWS -----------------
    async getReviews(filterObj = {}) {
        let qs = [];
        if (filterObj.farmer_id) qs.push(`farmer_id=${encodeURIComponent(filterObj.farmer_id)}`);
        if (filterObj.product_id) qs.push(`product_id=${encodeURIComponent(filterObj.product_id)}`);
        const remote = await API.request(`/reviews${qs.length ? '?' + qs.join('&') : ''}`);
        if (remote && Array.isArray(remote) && remote.length > 0) {
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.REVIEWS);
        let reviews = stored ? JSON.parse(stored) : DEMO_REVIEWS;
        if (filterObj.farmer_id) reviews = reviews.filter(r => r.farmer_id === filterObj.farmer_id);
        if (filterObj.product_id) reviews = reviews.filter(r => r.product_id === filterObj.product_id);
        return reviews;
    },

    async addReview(reviewData) {
        const remote = await API.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });

        const reviews = await this.getReviews();
        const newReview = (remote && remote.data) ? remote.data : {
            id: 'rev-' + Date.now(),
            created_at: new Date().toISOString().split('T')[0],
            status: 'approved',
            ...reviewData
        };
        reviews.unshift(newReview);
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
        return newReview;
    },

    async deleteReview(id) {
        await API.request(`/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        let reviews = await this.getReviews();
        reviews = reviews.filter(r => r.id !== id);
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
        return true;
    },

    // ----------------- PICKUP SLOTS -----------------
    async getPickupSlots(farmerId) {
        const remote = await API.request(`/slots${farmerId ? '?farmer_id=' + encodeURIComponent(farmerId) : ''}`);
        if (remote && Array.isArray(remote) && remote.length > 0) {
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.PICKUP_SLOTS);
        const slots = stored ? JSON.parse(stored) : DEMO_PICKUP_SLOTS;
        return farmerId ? slots.filter(s => s.farmer_id === farmerId) : slots;
    },

    async savePickupSlot(slotData) {
        const remote = await API.request('/slots', {
            method: 'POST',
            body: JSON.stringify(slotData)
        });

        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.PICKUP_SLOTS);
        let slots = stored ? JSON.parse(stored) : DEMO_PICKUP_SLOTS;
        const saved = (remote && remote.data) ? remote.data : slotData;

        if (saved.id) {
            const idx = slots.findIndex(s => s.id === saved.id);
            if (idx !== -1) slots[idx] = { ...slots[idx], ...saved };
            else slots.push(saved);
        } else {
            saved.id = 'slot-' + Date.now();
            slots.push(saved);
        }
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.PICKUP_SLOTS, JSON.stringify(slots));
        return saved;
    },

    async deletePickupSlot(id) {
        await API.request(`/slots?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.PICKUP_SLOTS);
        let slots = stored ? JSON.parse(stored) : DEMO_PICKUP_SLOTS;
        slots = slots.filter(s => s.id !== id);
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.PICKUP_SLOTS, JSON.stringify(slots));
        return true;
    },

    // ----------------- USERS / CUSTOMERS -----------------
    async getCustomers() {
        const remote = await API.request('/customers');
        if (remote && Array.isArray(remote) && remote.length > 0) {
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.CUSTOMERS, JSON.stringify(remote));
            return remote;
        }
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.CUSTOMERS);
        return stored ? JSON.parse(stored) : DEMO_CUSTOMERS;
    },

    async updateCustomerStatus(id, status) {
        await API.request('/customers', {
            method: 'PATCH',
            body: JSON.stringify({ id, status })
        });
        const customers = await this.getCustomers();
        const cust = customers.find(c => c.id === id);
        if (cust) {
            cust.status = status;
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
            return true;
        }
        return false;
    },

    // ----------------- ANALYTICS & STATS -----------------
    async getPlatformStats() {
        const remote = await API.request('/stats');
        if (remote && remote.totalProducts !== undefined) {
            return remote;
        }

        const customers = await this.getCustomers();
        const farmers = await this.getFarmers();
        const markets = await this.getMarkets();
        const products = await this.getProducts();
        const orders = await this.getOrders();

        const totalRevenue = orders.reduce((sum, ord) => {
            if (ord.status !== 'Cancelled') return sum + (Number(ord.total_amount) || 0);
            return sum;
        }, 0);

        return {
            totalCustomers: customers.length,
            totalFarmers: farmers.length,
            totalMarkets: markets.length,
            totalProducts: products.length,
            totalOrders: orders.length,
            totalRevenue: totalRevenue,
            pendingOrders: orders.filter(o => o.status === 'Placed').length,
            completedOrders: orders.filter(o => o.status === 'Completed').length,
            database: 'Local Demo Storage'
        };
    },

    // Reset local data
    resetDemoData() {
        const keys = ML_CONFIG.STORAGE_KEYS;
        localStorage.setItem(keys.MARKETS, JSON.stringify(DEMO_MARKETS));
        localStorage.setItem(keys.FARMERS, JSON.stringify(DEMO_FARMERS));
        localStorage.setItem(keys.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
        localStorage.setItem(keys.CATEGORIES, JSON.stringify(DEMO_CATEGORIES));
        localStorage.setItem(keys.CUSTOMERS, JSON.stringify(DEMO_CUSTOMERS));
        localStorage.setItem(keys.ORDERS, JSON.stringify(DEMO_ORDERS));
        localStorage.setItem(keys.REVIEWS, JSON.stringify(DEMO_REVIEWS));
        localStorage.setItem(keys.PICKUP_SLOTS, JSON.stringify(DEMO_PICKUP_SLOTS));
        console.log('🔄 All demo data reset to original state.');
        return true;
    }
};

window.DB = DB;
window.API = API;
