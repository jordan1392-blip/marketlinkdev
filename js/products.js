// ====================================================================
// MarketLink – eGreen Basket: Products Catalog & Filter Engine
// Filtering by category, price, market, farmer, and search query
// ====================================================================

const ProductsView = {
    allProducts: [],
    categories: [],
    farmers: [],
    markets: [],
    activeCategory: 'all',

    async init() {
        this.allProducts = await DB.getProducts();
        this.categories = await DB.getCategories();
        this.farmers = await DB.getFarmers();
        this.markets = await DB.getMarkets();

        // Check URL params
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('category')) this.activeCategory = urlParams.get('category');
        const initialSearch = urlParams.get('search') || '';
        const initialFarmer = urlParams.get('farmer') || '';

        this.renderCategoryPills();
        this.populateFilterDropdowns(initialFarmer);

        const searchInput = document.getElementById('productSearchInput');
        if (searchInput && initialSearch) searchInput.value = initialSearch;

        this.setupEventListeners();
        this.applyFilters();
    },

    renderCategoryPills() {
        const container = document.getElementById('category-pills-container');
        if (!container) return;

        let html = `
            <button class="category-pill ${this.activeCategory === 'all' ? 'active' : ''}" onclick="ProductsView.selectCategory('all')">
                <i class="bi bi-grid-fill"></i> All Items
            </button>
        `;

        this.categories.forEach(cat => {
            const isActive = this.activeCategory === cat.id ? 'active' : '';
            html += `
                <button class="category-pill ${isActive}" onclick="ProductsView.selectCategory('${cat.id}')">
                    <i class="bi ${cat.icon}"></i> ${cat.name}
                </button>
            `;
        });

        container.innerHTML = html;
    },

    selectCategory(catId) {
        this.activeCategory = catId;
        this.renderCategoryPills();
        this.applyFilters();
    },

    populateFilterDropdowns(selectedFarmerId = '') {
        const farmerSelect = document.getElementById('filterFarmerSelect');
        const marketSelect = document.getElementById('filterMarketSelect');

        if (farmerSelect) {
            farmerSelect.innerHTML = '<option value="all">All Farmers</option>';
            this.farmers.forEach(f => {
                const selected = f.id === selectedFarmerId ? 'selected' : '';
                farmerSelect.innerHTML += `<option value="${f.id}" ${selected}>${f.stall_name}</option>`;
            });
        }

        if (marketSelect) {
            marketSelect.innerHTML = '<option value="all">All Markets</option>';
            this.markets.forEach(m => {
                marketSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
            });
        }
    },

    setupEventListeners() {
        const searchInput = document.getElementById('productSearchInput');
        const priceSlider = document.getElementById('priceRangeSlider');
        const farmerSelect = document.getElementById('filterFarmerSelect');
        const marketSelect = document.getElementById('filterMarketSelect');

        if (searchInput) searchInput.addEventListener('input', () => this.applyFilters());
        if (priceSlider) {
            priceSlider.addEventListener('input', (e) => {
                const valEl = document.getElementById('priceRangeVal');
                if (valEl) valEl.textContent = App.formatCurrency(e.target.value);
                this.applyFilters();
            });
        }
        if (farmerSelect) farmerSelect.addEventListener('change', () => this.applyFilters());
        if (marketSelect) marketSelect.addEventListener('change', () => this.applyFilters());
    },

    applyFilters() {
        const searchInput = document.getElementById('productSearchInput');
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const priceSlider = document.getElementById('priceRangeSlider');
        const maxPrice = priceSlider ? Number(priceSlider.value) : 3500;
        const farmerSelect = document.getElementById('filterFarmerSelect');
        const selectedFarmer = farmerSelect ? farmerSelect.value : 'all';
        const marketSelect = document.getElementById('filterMarketSelect');
        const selectedMarket = marketSelect ? marketSelect.value : 'all';

        const filtered = this.allProducts.filter(p => {
            // Category filter
            if (this.activeCategory !== 'all' && p.category_id !== this.activeCategory) return false;

            // Search query
            if (query && !p.name.toLowerCase().includes(query) && !p.description.toLowerCase().includes(query)) return false;

            // Price filter
            if (Number(p.price) > maxPrice) return false;

            // Farmer filter
            if (selectedFarmer !== 'all' && p.farmer_id !== selectedFarmer) return false;

            // Market filter
            if (selectedMarket !== 'all') {
                const farmer = this.farmers.find(f => f.id === p.farmer_id);
                if (!farmer || farmer.market_id !== selectedMarket) return false;
            }

            return true;
        });

        this.renderProductsGrid(filtered);
    },

    async renderProductsGrid(products) {
        const container = document.getElementById('products-grid');
        const countBadge = document.getElementById('product-count-badge');
        if (!container) return;

        if (countBadge) countBadge.textContent = `${products.length} Products Found`;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-basket3 text-muted display-4"></i>
                    <h5 class="fw-bold mt-3">No Products Found</h5>
                    <p class="text-muted">Try adjusting your filters or search keywords.</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="ProductsView.resetFilters()">Reset All Filters</button>
                </div>
            `;
            return;
        }

        const user = Auth.getCurrentUser();
        let userFavorites = [];
        if (user) {
            userFavorites = await DB.getFavorites(user.id);
        }

        let html = '';
        products.forEach(p => {
            const farmer = this.farmers.find(f => f.id === p.farmer_id);
            const isFav = userFavorites.some(f => f.item_id === p.id);
            const isSoldOut = p.status === 'sold_out' || p.stock_quantity <= 0;
            const isLowStock = !isSoldOut && p.stock_quantity <= 5;

            let stockBadge = `<span class="stock-tag stock-available"><i class="bi bi-check-circle-fill"></i> In Stock (${p.stock_quantity} ${p.unit})</span>`;
            if (isSoldOut) {
                stockBadge = `<span class="stock-tag stock-out"><i class="bi bi-x-circle-fill"></i> Sold Out</span>`;
            } else if (isLowStock) {
                stockBadge = `<span class="stock-tag stock-low"><i class="bi bi-exclamation-circle-fill"></i> Only ${p.stock_quantity} left</span>`;
            }

            html += `
            <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
                <div class="product-card card-hover-lift">
                    <div class="product-img-wrapper">
                        <img src="${p.image_url}" alt="${p.name}" loading="lazy">
                        <button class="fav-badge border-0" onclick="ProductsView.toggleFav(event, '${p.id}')" title="Save to Favorites">
                            <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                        </button>
                    </div>
                    <div class="product-body">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            ${stockBadge}
                            <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem;">${p.unit}</small>
                        </div>
                        <h6 class="product-title">
                            <a href="product-details.html?id=${p.id}" class="text-dark text-decoration-none">
                                ${p.name}
                            </a>
                        </h6>
                        <div class="product-farmer">
                            <i class="bi bi-shop text-success"></i>
                            <a href="farmer-profile.html?id=${p.farmer_id}" class="text-muted text-decoration-none">
                                ${farmer ? farmer.stall_name : 'Local Farm'}
                            </a>
                        </div>
                        <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                            <div>
                                <span class="product-price">${App.formatCurrency(p.price)}</span>
                                <span class="product-unit">/${p.unit}</span>
                            </div>
                            <button class="btn btn-primary btn-sm px-3" 
                                    onclick="Cart.addItem('${p.id}', 1)"
                                    ${isSoldOut ? 'disabled' : ''}>
                                <i class="bi bi-cart-plus me-1"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        });

        container.innerHTML = html;
    },

    async toggleFav(e, productId) {
        if (e) e.stopPropagation();
        const user = Auth.getCurrentUser();
        if (!user) {
            App.showToast('Please login to save favorites.', 'info');
            return;
        }

        const isSaved = await DB.toggleFavorite(user.id, 'product', productId);
        App.showToast(isSaved ? 'Saved to your favorites!' : 'Removed from favorites.', 'success');
        this.applyFilters();
    },

    resetFilters() {
        this.activeCategory = 'all';
        this.renderCategoryPills();
        const s = document.getElementById('productSearchInput');
        if (s) s.value = '';
        const f = document.getElementById('filterFarmerSelect');
        if (f) f.value = 'all';
        const m = document.getElementById('filterMarketSelect');
        if (m) m.value = 'all';
        const p = document.getElementById('priceRangeSlider');
        if (p) {
            p.value = 3500;
            const v = document.getElementById('priceRangeVal');
            if (v) v.textContent = App.formatCurrency(3500);
        }
        this.applyFilters();
    }
};

window.ProductsView = ProductsView;
