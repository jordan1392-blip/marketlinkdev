// ====================================================================
// MarketLink – eGreen Basket: Admin Portal Logic
// System-wide management of customers, farmers, markets, products, & reports
// ====================================================================

const AdminPortal = {
    // ----------------- DASHBOARD -----------------
    async initDashboard() {
        const stats = await DB.getPlatformStats();

        const custEl = document.getElementById('stat-admin-customers');
        const farmEl = document.getElementById('stat-admin-farmers');
        const mktEl = document.getElementById('stat-admin-markets');
        const prodEl = document.getElementById('stat-admin-products');
        const ordEl = document.getElementById('stat-admin-orders');
        const revEl = document.getElementById('stat-admin-revenue');

        if (custEl) custEl.textContent = stats.totalCustomers;
        if (farmEl) farmEl.textContent = stats.totalFarmers;
        if (mktEl) mktEl.textContent = stats.totalMarkets;
        if (prodEl) prodEl.textContent = stats.totalProducts;
        if (ordEl) ordEl.textContent = stats.totalOrders;
        if (revEl) revEl.textContent = App.formatCurrency(stats.totalRevenue);

        // Render Recent Activity / Orders
        const orders = await DB.getOrders();
        const tbody = document.getElementById('admin-recent-orders-tbody');
        if (tbody) {
            let html = '';
            orders.slice(0, 6).forEach(o => {
                html += `
                <tr>
                    <td class="fw-bold">${o.order_number}</td>
                    <td>${o.customer_name}</td>
                    <td>${o.farmer_name}</td>
                    <td>${o.market_name}</td>
                    <td class="fw-bold text-success">${App.formatCurrency(o.total_amount)}</td>
                    <td>${App.getStatusBadge(o.status)}</td>
                </tr>
                `;
            });
            tbody.innerHTML = html;
        }
    },

    // ----------------- CUSTOMER MANAGEMENT -----------------
    async initUsers() {
        this.renderCustomersList();
        const searchInput = document.getElementById('userSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderCustomersList());
        }
    },

    async renderCustomersList() {
        const tbody = document.getElementById('admin-users-tbody');
        if (!tbody) return;

        const searchInput = document.getElementById('userSearchInput');
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const customers = await DB.getCustomers();

        const filtered = customers.filter(c => 
            !query || c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query) || (c.phone && c.phone.includes(query))
        );

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No customers found.</td></tr>';
            return;
        }

        let html = '';
        filtered.forEach(c => {
            const isActive = c.status !== 'suspended';
            html += `
            <tr>
                <td class="fw-bold text-dark">${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone || 'N/A'}</td>
                <td><small class="text-muted">${c.address || 'Islamabad'}</small></td>
                <td>
                    <span class="badge ${isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
                        ${isActive ? 'Active' : 'Suspended'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm ${isActive ? 'btn-outline-danger' : 'btn-outline-success'} py-0 px-2"
                            onclick="AdminPortal.toggleCustomerStatus('${c.id}', '${isActive ? 'suspended' : 'active'}')">
                        ${isActive ? 'Suspend' : 'Activate'}
                    </button>
                </td>
            </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    async toggleCustomerStatus(id, newStatus) {
        await DB.updateCustomerStatus(id, newStatus);
        App.showToast(`Customer account marked as ${newStatus}.`, 'info');
        this.renderCustomersList();
    },

    // ----------------- FARMER MANAGEMENT -----------------
    async initFarmers() {
        this.renderFarmersList();
    },

    async renderFarmersList() {
        const tbody = document.getElementById('admin-farmers-tbody');
        if (!tbody) return;

        const farmers = await DB.getFarmers();
        const markets = await DB.getMarkets();

        let html = '';
        farmers.forEach(f => {
            const mkt = markets.find(m => m.id === f.market_id);
            const isApproved = f.status === 'approved';
            html += `
            <tr>
                <td>
                    <img src="${f.image_url}" class="rounded-circle me-2" style="width: 38px; height: 38px; object-fit: cover;">
                    <strong>${f.stall_name}</strong>
                </td>
                <td>${f.contact_person}</td>
                <td>${f.email}<br><small class="text-muted">${f.phone}</small></td>
                <td>${mkt ? mkt.name : 'All Markets'}</td>
                <td>
                    <span class="badge ${isApproved ? 'bg-success' : 'bg-warning text-dark'}">
                        ${f.status || 'approved'}
                    </span>
                </td>
                <td>
                    <div class="d-flex gap-1">
                        ${!isApproved ? `
                            <button class="btn btn-sm btn-success py-0 px-2" onclick="AdminPortal.updateFarmerStatus('${f.id}', 'approved')">
                                Approve
                            </button>
                        ` : `
                            <button class="btn btn-sm btn-outline-warning py-0 px-2" onclick="AdminPortal.updateFarmerStatus('${f.id}', 'suspended')">
                                Suspend
                            </button>
                        `}
                    </div>
                </td>
            </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    async updateFarmerStatus(id, status) {
        await DB.updateFarmerStatus(id, status);
        App.showToast(`Farmer status updated to ${status}.`, 'info');
        this.renderFarmersList();
    },

    // ----------------- MARKET MANAGEMENT (CRUD) -----------------
    async initMarkets() {
        this.renderMarketsList();
    },

    async renderMarketsList() {
        const tbody = document.getElementById('admin-markets-tbody');
        if (!tbody) return;

        const markets = await DB.getMarkets();
        let html = '';
        markets.forEach(m => {
            html += `
            <tr>
                <td class="fw-bold text-dark">${m.name}</td>
                <td>${m.address}</td>
                <td><span class="badge bg-light text-dark border">${m.operating_days}</span></td>
                <td>${m.opening_time} - ${m.closing_time}</td>
                <td><small class="text-muted">${m.latitude}, ${m.longitude}</small></td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="AdminPortal.openEditMarketModal('${m.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="AdminPortal.deleteMarket('${m.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    openAddMarketModal() {
        document.getElementById('marketModalTitle').textContent = 'Add Farmers Market';
        document.getElementById('marketIdInput').value = '';
        document.getElementById('mktNameInput').value = '';
        document.getElementById('mktAddressInput').value = '';
        document.getElementById('mktDaysInput').value = 'Friday, Saturday';
        document.getElementById('mktOpenInput').value = '08:00';
        document.getElementById('mktCloseInput').value = '18:00';
        document.getElementById('mktLatInput').value = '33.7297';
        document.getElementById('mktLngInput').value = '73.0746';
        document.getElementById('mktImageInput').value = '';

        const modal = new bootstrap.Modal(document.getElementById('marketModal'));
        modal.show();
    },

    async openEditMarketModal(marketId) {
        const m = await DB.getMarketById(marketId);
        if (!m) return;

        document.getElementById('marketModalTitle').textContent = 'Edit Farmers Market';
        document.getElementById('marketIdInput').value = m.id;
        document.getElementById('mktNameInput').value = m.name;
        document.getElementById('mktAddressInput').value = m.address;
        document.getElementById('mktDaysInput').value = m.operating_days;
        document.getElementById('mktOpenInput').value = m.opening_time;
        document.getElementById('mktCloseInput').value = m.closing_time;
        document.getElementById('mktLatInput').value = m.latitude;
        document.getElementById('mktLngInput').value = m.longitude;
        document.getElementById('mktImageInput').value = m.image_url;

        const modal = new bootstrap.Modal(document.getElementById('marketModal'));
        modal.show();
    },

    async saveMarketForm(e) {
        if (e) e.preventDefault();
        const id = document.getElementById('marketIdInput').value;
        const name = document.getElementById('mktNameInput').value.trim();
        const address = document.getElementById('mktAddressInput').value.trim();
        const operating_days = document.getElementById('mktDaysInput').value.trim();
        const opening_time = document.getElementById('mktOpenInput').value;
        const closing_time = document.getElementById('mktCloseInput').value;
        const latitude = parseFloat(document.getElementById('mktLatInput').value) || 33.7;
        const longitude = parseFloat(document.getElementById('mktLngInput').value) || 73.0;
        let image_url = document.getElementById('mktImageInput').value.trim();

        if (!name || !address) {
            App.showToast('Please fill in market name and address.', 'error');
            return;
        }

        if (!image_url) {
            image_url = 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80';
        }

        await DB.saveMarket({
            id: id || undefined,
            name: name,
            address: address,
            operating_days: operating_days,
            opening_time: opening_time,
            closing_time: closing_time,
            latitude: latitude,
            longitude: longitude,
            image_url: image_url
        });

        App.showToast('Farmers Market saved successfully!', 'success');
        const modalEl = document.getElementById('marketModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        this.renderMarketsList();
    },

    async deleteMarket(id) {
        if (confirm('Are you sure you want to delete this market location?')) {
            await DB.deleteMarket(id);
            App.showToast('Market deleted.', 'info');
            this.renderMarketsList();
        }
    },

    // ----------------- PRODUCT MODERATION -----------------
    async initProducts() {
        this.renderProductsList();
    },

    async renderProductsList() {
        const tbody = document.getElementById('admin-products-tbody');
        if (!tbody) return;

        const products = await DB.getProducts();
        const farmers = await DB.getFarmers();
        const categories = await DB.getCategories();

        let html = '';
        products.forEach(p => {
            const f = farmers.find(farm => farm.id === p.farmer_id);
            const c = categories.find(cat => cat.id === p.category_id);
            html += `
            <tr>
                <td>
                    <img src="${p.image_url}" class="rounded-2 me-2" style="width: 36px; height: 36px; object-fit: cover;">
                    <strong>${p.name}</strong>
                </td>
                <td>${f ? f.stall_name : 'Local Farmer'}</td>
                <td><span class="badge bg-light text-dark border">${c ? c.name : 'General'}</span></td>
                <td class="fw-bold text-success">${App.formatCurrency(p.price)} / ${p.unit}</td>
                <td>${p.stock_quantity}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="AdminPortal.removeProduct('${p.id}')">
                        <i class="bi bi-trash"></i> Remove
                    </button>
                </td>
            </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    async removeProduct(id) {
        if (confirm('Remove this product listing from the platform?')) {
            await DB.deleteProduct(id);
            App.showToast('Product listing removed by admin.', 'info');
            this.renderProductsList();
        }
    },

    // ----------------- REVIEWS MODERATION -----------------
    async initReviews() {
        this.renderReviewsList();
    },

    async renderReviewsList() {
        const tbody = document.getElementById('admin-reviews-tbody');
        if (!tbody) return;

        const reviews = await DB.getReviews();
        const farmers = await DB.getFarmers();

        let html = '';
        reviews.forEach(r => {
            const f = farmers.find(farm => farm.id === r.farmer_id);
            html += `
            <tr>
                <td class="fw-bold">${r.customer_name || 'Customer'}</td>
                <td>${f ? f.stall_name : 'Farmer Stall'}</td>
                <td>${App.renderStars(r.rating)}</td>
                <td style="max-width: 300px;"><small class="text-dark">"${r.comment}"</small></td>
                <td><small class="text-muted">${r.created_at}</small></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="AdminPortal.deleteReview('${r.id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    async deleteReview(id) {
        if (confirm('Delete this customer review?')) {
            await DB.deleteReview(id);
            App.showToast('Review removed.', 'info');
            this.renderReviewsList();
        }
    },

    // ----------------- REPORTS & ANALYTICS -----------------
    async initReports() {
        const stats = await DB.getPlatformStats();
        const orders = await DB.getOrders();
        const products = await DB.getProducts();
        const markets = await DB.getMarkets();

        const revEl = document.getElementById('report-revenue');
        const ordersEl = document.getElementById('report-orders');
        const activeFarmEl = document.getElementById('report-farmers');

        if (revEl) revEl.textContent = App.formatCurrency(stats.totalRevenue);
        if (ordersEl) ordersEl.textContent = stats.totalOrders;
        if (activeFarmEl) activeFarmEl.textContent = stats.totalFarmers;

        // Render popular products table
        const topProdTbody = document.getElementById('report-top-products-tbody');
        if (topProdTbody) {
            let html = '';
            products.slice(0, 6).forEach((p, idx) => {
                html += `
                <tr>
                    <td>#${idx + 1}</td>
                    <td class="fw-bold">${p.name}</td>
                    <td>${App.formatCurrency(p.price)}</td>
                    <td>${p.stock_quantity} left in stock</td>
                    <td><span class="badge bg-success-subtle text-success">Popular</span></td>
                </tr>
                `;
            });
            topProdTbody.innerHTML = html;
        }

        // Render market breakdown
        const mktBreakdown = document.getElementById('report-market-breakdown-tbody');
        if (mktBreakdown) {
            let html = '';
            markets.forEach(m => {
                const mktOrders = orders.filter(o => o.market_id === m.id);
                const mktRevenue = mktOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
                html += `
                <tr>
                    <td class="fw-bold">${m.name}</td>
                    <td>${m.operating_days}</td>
                    <td>${mktOrders.length} pre-orders</td>
                    <td class="fw-bold text-success">${App.formatCurrency(mktRevenue)}</td>
                </tr>
                `;
            });
            mktBreakdown.innerHTML = html;
        }
    }
};

window.AdminPortal = AdminPortal;
