// ====================================================================
// MarketLink – eGreen Basket: Application Core Utilities
// UI Helpers, Navbars, Toasts, Formatting, and Settings Modal
// ====================================================================

const App = {
    // Format numeric value into PKR currency representation
    formatCurrency(amount) {
        const val = Number(amount) || 0;
        return `${ML_CONFIG.currencySymbol} ${val.toLocaleString('en-PK')}`;
    },

    // Format ISO or date string to readable format
    formatDate(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    // Render HTML status badge with thematic color coding
    getStatusBadge(status) {
        switch (status) {
            case 'Placed':
                return `<span class="badge-status badge-status-placed"><i class="bi bi-clock-history"></i> Placed</span>`;
            case 'Accepted':
                return `<span class="badge-status badge-status-accepted"><i class="bi bi-check2-circle"></i> Accepted</span>`;
            case 'Ready for Pickup':
                return `<span class="badge-status badge-status-ready"><i class="bi bi-bag-check-fill"></i> Ready for Pickup</span>`;
            case 'Completed':
                return `<span class="badge-status badge-status-completed"><i class="bi bi-patch-check-fill"></i> Completed</span>`;
            case 'Cancelled':
                return `<span class="badge-status badge-status-cancelled"><i class="bi bi-x-circle-fill"></i> Cancelled</span>`;
            default:
                return `<span class="badge bg-secondary">${status}</span>`;
        }
    },

    // Render 5-star rating stars HTML
    renderStars(rating = 5) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let html = '<div class="star-rating d-inline-flex align-items-center gap-1">';
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="bi bi-star-fill text-warning"></i>';
        }
        if (hasHalf) {
            html += '<i class="bi bi-star-half text-warning"></i>';
        }
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            html += '<i class="bi bi-star text-muted opacity-50"></i>';
        }
        html += `<span class="ms-1 fw-bold text-dark fs-6">${Number(rating).toFixed(1)}</span></div>`;
        return html;
    },

    // Display non-intrusive toast notifications
    showToast(message, type = 'success') {
        let container = document.getElementById('ml-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ml-toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        const iconClass = type === 'success' ? 'bi-check-circle-fill text-success' :
                          type === 'error' ? 'bi-exclamation-triangle-fill text-danger' :
                          'bi-info-circle-fill text-primary';

        const toastEl = document.createElement('div');
        toastEl.className = 'toast align-items-center shadow-lg border-0';
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.innerHTML = `
            <div class="d-flex bg-white rounded-3 overflow-hidden border">
                <div class="toast-body d-flex align-items-center gap-2 py-3 px-3">
                    <i class="bi ${iconClass} fs-5"></i>
                    <span class="fw-medium text-dark">${message}</span>
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        container.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    },

    // Update cart counter badges throughout the DOM
    updateCartBadges() {
        const cart = Cart.getCart();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.ml-cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
    },

    // Render universal Top Navigation Bar
    renderNavbar(activePage = 'home') {
        const navbarEl = document.getElementById('main-navbar');
        if (!navbarEl) return;

        const user = Auth.getCurrentUser();
        const isInSubfolder = window.location.pathname.includes('/customer/') ||
                              window.location.pathname.includes('/farmer/') ||
                              window.location.pathname.includes('/admin/');
        const prefix = isInSubfolder ? '../' : '';

        let userNavSection = '';
        if (user) {
            let dashUrl = `${prefix}customer/dashboard.html`;
            let roleBadge = 'Customer';
            if (user.role === 'farmer') {
                dashUrl = `${prefix}farmer/dashboard.html`;
                roleBadge = 'Farmer';
            } else if (user.role === 'admin') {
                dashUrl = `${prefix}admin/dashboard.html`;
                roleBadge = 'Admin';
            }

            userNavSection = `
                <div class="d-flex align-items-center gap-2">
                    <a href="${dashUrl}" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
                        <i class="bi bi-speedometer2"></i>
                        <span>${user.name.split(' ')[0]}</span>
                        <span class="badge bg-success-subtle text-success border border-success-subtle">${roleBadge}</span>
                    </a>
                    <button onclick="Auth.logout()" class="btn btn-sm btn-earthy" title="Sign out">
                        <i class="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            `;
        } else {
            userNavSection = `
                <div class="d-flex align-items-center gap-2">
                    <a href="${prefix}login.html" class="btn btn-outline-primary btn-sm">Login</a>
                    <a href="${prefix}register.html" class="btn btn-primary btn-sm">Register</a>
                </div>
            `;
        }

        navbarEl.innerHTML = `
        <nav class="navbar navbar-expand-lg ml-navbar sticky-top">
            <div class="container">
                <a class="navbar-brand" href="${prefix}index.html">
                    <i class="bi bi-basket2-fill"></i>
                    <span>Market<span class="text-success">Link</span></span>
                </a>
                <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <i class="bi bi-list fs-2 text-dark"></i>
                </button>
                <div class="collapse navbar-collapse" id="navbarContent">
                    <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="${prefix}index.html">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'markets' ? 'active' : ''}" href="${prefix}markets.html">Markets</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'farmers' ? 'active' : ''}" href="${prefix}farmers.html">Farmers</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'products' ? 'active' : ''}" href="${prefix}products.html">Products</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'about' ? 'active' : ''}" href="${prefix}about.html">About</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'contact' ? 'active' : ''}" href="${prefix}contact.html">Contact</a>
                        </li>
                    </ul>
                    <div class="d-flex align-items-center gap-3">
                        <a href="${prefix}cart.html" class="btn btn-earthy btn-sm position-relative p-2 px-3" title="Shopping Cart">
                            <i class="bi bi-cart3 fs-5"></i>
                            <span class="ml-cart-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="display:none;">0</span>
                        </a>
                        ${userNavSection}
                    </div>
                </div>
            </div>
        </nav>
        `;

        this.updateCartBadges();
    },

    // Render universal Footer
    renderFooter() {
        const footerEl = document.getElementById('main-footer');
        if (!footerEl) return;

        const isInSubfolder = window.location.pathname.includes('/customer/') ||
                              window.location.pathname.includes('/farmer/') ||
                              window.location.pathname.includes('/admin/');
        const prefix = isInSubfolder ? '../' : '';

        footerEl.innerHTML = `
        <footer class="ml-footer">
            <div class="container">
                <div class="row g-4">
                    <div class="col-lg-4 col-md-6">
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <i class="bi bi-basket2-fill text-success fs-3"></i>
                            <span class="fs-4 fw-bold text-white">Market<span class="text-success">Link</span></span>
                        </div>
                        <p class="text-muted mb-3">
                            <strong>Discover Local. Eat Fresh.</strong> Connecting local farmers-market farmers with conscious consumers for healthy, organic, zero-middleman pre-orders.
                        </p>
                        <div class="d-flex gap-2">
                            <span class="badge bg-success-subtle text-success border border-success-subtle p-2">
                                <i class="bi bi-shield-check"></i> Cash at Pickup Guaranteed
                            </span>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-6">
                        <h5>Explore</h5>
                        <ul class="list-unstyled d-flex flex-column gap-2">
                            <li><a href="${prefix}markets.html">Farmers Markets</a></li>
                            <li><a href="${prefix}farmers.html">Browse Farmers</a></li>
                            <li><a href="${prefix}products.html">All Products</a></li>
                            <li><a href="${prefix}about.html">About MarketLink</a></li>
                            <li><a href="${prefix}contact.html">Support & Contact</a></li>
                        </ul>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <h5>Portals & Quick Links</h5>
                        <ul class="list-unstyled d-flex flex-column gap-2">
                            <li><a href="${prefix}customer/dashboard.html">Customer Dashboard</a></li>
                            <li><a href="${prefix}farmer/dashboard.html">Farmer Stall Dashboard</a></li>
                            <li><a href="${prefix}admin/dashboard.html">Administrator Control</a></li>
                            <li><a href="${prefix}login.html">Login & Demo Access</a></li>
                            <li><a href="${prefix}register.html">Farmer Registration</a></li>
                        </ul>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <h5>MongoDB & Vercel Backend</h5>
                        <p class="small text-muted mb-3">
                            Full-stack university web development project. Node.js Vercel/Netlify Serverless API & MongoDB Atlas database.
                        </p>
                        <button class="btn btn-outline-light btn-sm w-100 mb-2" onclick="App.openBackendConfigModal()">
                            <i class="bi bi-database-check me-1"></i> Backend & Database Status
                        </button>
                        <button class="btn btn-earthy btn-sm w-100" onclick="DB.resetDemoData(); App.showToast('Demo data reloaded to seed state'); setTimeout(() => location.reload(), 600);">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Demo Database
                        </button>
                    </div>
                </div>
                <div class="ml-footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center text-muted">
                    <p class="mb-0">&copy; 2026 MarketLink – eGreen Basket. Built with Bootstrap 5 & Vanilla JS.</p>
                    <p class="mb-0">Academic Web Development Project | Vercel Serverless & MongoDB Atlas.</p>
                </div>
            </div>
        </footer>
        `;
    },

    // Modal to check live Vercel/Netlify Backend & MongoDB Atlas status
    async openBackendConfigModal() {
        let modalEl = document.getElementById('backendConfigModal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'backendConfigModal';
            modalEl.className = 'modal fade';
            modalEl.tabIndex = -1;
            modalEl.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                                <i class="bi bi-hdd-network text-success"></i> Vercel Backend & MongoDB Atlas Status
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div id="backendHealthContent" class="text-center py-3">
                                <div class="spinner-border text-success" role="status"></div>
                                <p class="small text-muted mt-2">Checking API & MongoDB connectivity...</p>
                            </div>

                            <hr class="my-3">

                            <h6 class="fw-bold mb-2"><i class="bi bi-cloud-arrow-up text-primary me-1"></i> Deployment to Vercel or Netlify</h6>
                            <div class="bg-light p-3 rounded-3 small mb-3">
                                <p class="mb-1"><strong>1. Connect to MongoDB Atlas (100% Free):</strong></p>
                                <p class="text-muted mb-2">Create a free M0 cluster on <a href="https://www.mongodb.com/cloud/atlas" target="_blank">mongodb.com/atlas</a> and copy your connection string.</p>
                                <p class="mb-1"><strong>2. Set Environment Variable in Vercel or Netlify:</strong></p>
                                <code class="d-block p-2 bg-white rounded border mb-2">MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.abcde.mongodb.net/marketlink?retryWrites=true&w=majority</code>
                                <p class="mb-0"><strong>3. Seed Cloud Database:</strong> Click the "Seed MongoDB Database" button below to initialize all markets, farmers, and products in MongoDB!</p>
                            </div>

                            <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                                <button type="button" class="btn btn-outline-success btn-sm" onclick="App.seedLiveDatabase()">
                                    <i class="bi bi-database-add me-1"></i> Seed / Reset MongoDB Database
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="App.refreshBackendStatus()">
                                    <i class="bi bi-arrow-repeat me-1"></i> Re-check Status
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEl);
        }
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        await this.refreshBackendStatus();
    },

    async refreshBackendStatus() {
        const container = document.getElementById('backendHealthContent');
        if (!container) return;
        container.innerHTML = `
            <div class="spinner-border text-success" role="status"></div>
            <p class="small text-muted mt-2">Checking API & MongoDB connectivity...</p>
        `;

        const health = await DB.checkBackendHealth();
        if (health.connected) {
            container.innerHTML = `
                <div class="alert alert-success d-flex align-items-center gap-3 text-start mb-0">
                    <i class="bi bi-check-circle-fill fs-2"></i>
                    <div>
                        <h6 class="mb-1 fw-bold text-success">Live MongoDB Atlas Connected!</h6>
                        <p class="small mb-0">Backend API is running on Vercel Serverless Functions. Active collections: <code>${(health.collections || []).join(', ') || 'Connected'}</code></p>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="alert alert-warning d-flex align-items-center gap-3 text-start mb-0">
                    <i class="bi bi-info-circle-fill fs-2"></i>
                    <div>
                        <h6 class="mb-1 fw-bold">Running in Offline / Presentation Demo Mode</h6>
                        <p class="small mb-0">${health.message || 'No live MongoDB connection detected.'} The web application is working seamlessly with local demo data.</p>
                    </div>
                </div>
            `;
        }
    },

    async seedLiveDatabase() {
        this.showToast('Initializing MongoDB collections...');
        const res = await DB.seedBackendDatabase(true);
        if (res.status === 'success') {
            this.showToast('MongoDB database seeded successfully!');
            await this.refreshBackendStatus();
        } else {
            this.showToast(res.message || 'Could not seed: check MONGODB_URI in backend environment.');
        }
    }
};

window.App = App;
