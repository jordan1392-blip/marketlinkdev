// ====================================================================
// MarketLink – eGreen Basket: Authentication & Access Control
// Role-based sessions for Customer, Farmer, and Admin
// ====================================================================

const Auth = {
    // Get currently authenticated user
    getCurrentUser() {
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.AUTH_USER);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    // Check if user is logged in
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    // Get current role: 'customer' | 'farmer' | 'admin' | null
    getRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    },

    // Sign in user
    async login(email, password) {
        email = (email || '').trim().toLowerCase();
        
        // 1. Check if Admin
        if (email === 'admin@marketlink.com' || email.includes('admin')) {
            const adminUser = {
                id: DEMO_ADMIN.id,
                name: DEMO_ADMIN.name,
                email: DEMO_ADMIN.email,
                role: 'admin',
                phone: DEMO_ADMIN.phone,
                address: DEMO_ADMIN.address
            };
            this.setSession(adminUser);
            return { success: true, user: adminUser, redirect: 'admin/dashboard.html' };
        }

        // 2. Check if Farmer
        const farmers = await DB.getFarmers();
        const farmer = farmers.find(f => f.email && f.email.toLowerCase() === email);
        if (farmer) {
            const farmerUser = {
                id: farmer.id,
                user_id: farmer.user_id || farmer.id,
                name: farmer.contact_person || farmer.farmer_name,
                stall_name: farmer.stall_name,
                email: farmer.email,
                phone: farmer.phone,
                address: farmer.address,
                market_id: farmer.market_id,
                role: 'farmer'
            };
            this.setSession(farmerUser);
            return { success: true, user: farmerUser, redirect: 'farmer/dashboard.html' };
        }

        // 3. Check if Customer
        const customers = await DB.getCustomers();
        const customer = customers.find(c => c.email && c.email.toLowerCase() === email);
        if (customer) {
            if (customer.status === 'suspended') {
                return { success: false, message: 'This account has been suspended. Please contact support.' };
            }
            const customerUser = {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                role: 'customer'
            };
            this.setSession(customerUser);
            return { success: true, user: customerUser, redirect: 'customer/dashboard.html' };
        }

        // Fallback for new email input in demo
        if (email.includes('@')) {
            const newCust = {
                id: 'usr-customer-' + Date.now(),
                name: email.split('@')[0].replace('.', ' ').toUpperCase(),
                email: email,
                phone: '+92 300 0000000',
                address: 'Islamabad, Pakistan',
                role: 'customer',
                status: 'active'
            };
            const stored = await DB.getCustomers();
            stored.push(newCust);
            localStorage.setItem(ML_CONFIG.STORAGE_KEYS.CUSTOMERS, JSON.stringify(stored));
            this.setSession(newCust);
            return { success: true, user: newCust, redirect: 'customer/dashboard.html' };
        }

        return { success: false, message: 'Invalid credentials. Please verify your email and password.' };
    },

    // Register a new customer
    async registerCustomer({ name, email, phone, address, password }) {
        email = (email || '').trim().toLowerCase();
        const customers = await DB.getCustomers();

        if (customers.some(c => c.email.toLowerCase() === email)) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newCustomer = {
            id: 'usr-cust-' + Date.now(),
            name: name.trim(),
            email: email,
            phone: phone ? phone.trim() : '',
            address: address ? address.trim() : '',
            role: 'customer',
            status: 'active',
            created_at: new Date().toISOString()
        };

        customers.push(newCustomer);
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        this.setSession(newCustomer);

        return { success: true, user: newCustomer, redirect: 'customer/dashboard.html' };
    },

    // Register a new farmer
    async registerFarmer({ name, stall_name, email, phone, address, market_id, operating_days, bio }) {
        email = (email || '').trim().toLowerCase();
        const farmers = await DB.getFarmers();

        if (farmers.some(f => f.email.toLowerCase() === email)) {
            return { success: false, message: 'A farmer stall with this email already exists.' };
        }

        const newFarmer = {
            id: 'fm-' + Date.now(),
            user_id: 'usr-fm-' + Date.now(),
            farmer_name: name,
            contact_person: name,
            stall_name: stall_name,
            email: email,
            phone: phone,
            address: address,
            market_id: market_id || 'mkt-isb-f6',
            operating_days: operating_days || 'Friday, Saturday',
            pickup_start: '09:00',
            pickup_end: '17:00',
            status: 'approved',
            rating: 5.0,
            reviews_count: 0,
            bio: bio || 'Fresh organic grower providing healthy farm-direct produce.',
            image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
            stall_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
        };

        farmers.push(newFarmer);
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.FARMERS, JSON.stringify(farmers));

        const sessionUser = {
            id: newFarmer.id,
            user_id: newFarmer.user_id,
            name: newFarmer.farmer_name,
            stall_name: newFarmer.stall_name,
            email: newFarmer.email,
            phone: newFarmer.phone,
            address: newFarmer.address,
            role: 'farmer'
        };
        this.setSession(sessionUser);

        return { success: true, user: sessionUser, redirect: 'farmer/dashboard.html' };
    },

    // Set user session in browser storage
    setSession(user) {
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    },

    // Sign out user
    logout() {
        localStorage.removeItem(ML_CONFIG.STORAGE_KEYS.AUTH_USER);
        // Determine root path whether in customer/, farmer/, admin/ or root
        const isInSubfolder = window.location.pathname.includes('/customer/') ||
                              window.location.pathname.includes('/farmer/') ||
                              window.location.pathname.includes('/admin/');
        window.location.href = isInSubfolder ? '../login.html' : 'login.html';
    },

    // Enforce page route protection based on required role
    requireAuth(requiredRole) {
        const user = this.getCurrentUser();
        const isInSubfolder = window.location.pathname.includes('/customer/') ||
                              window.location.pathname.includes('/farmer/') ||
                              window.location.pathname.includes('/admin/');
        const loginUrl = isInSubfolder ? '../login.html' : 'login.html';

        if (!user) {
            sessionStorage.setItem('ml_auth_redirect', window.location.href);
            window.location.href = loginUrl;
            return false;
        }

        if (requiredRole && user.role !== requiredRole) {
            alert(`Access restricted. You need ${requiredRole} access privileges.`);
            if (user.role === 'customer') window.location.href = isInSubfolder ? '../customer/dashboard.html' : 'customer/dashboard.html';
            else if (user.role === 'farmer') window.location.href = isInSubfolder ? '../farmer/dashboard.html' : 'farmer/dashboard.html';
            else if (user.role === 'admin') window.location.href = isInSubfolder ? '../admin/dashboard.html' : 'admin/dashboard.html';
            return false;
        }

        return true;
    }
};

window.Auth = Auth;
