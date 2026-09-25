// ====================================================================
// MarketLink – eGreen Basket: Farmer Portal Logic
// Product CRUD, Incoming Orders Workflow, Pickup Slot Scheduling
// ====================================================================

const FarmerPortal = {
    currentFarmer: null,

    async getFarmerSession() {
        const user = Auth.getCurrentUser();
        if (!user || user.role !== 'farmer') return null;

        const farmers = await DB.getFarmers();
        let farmer = farmers.find(f => f.email && f.email.toLowerCase() === user.email.toLowerCase());
        if (!farmer) farmer = farmers.find(f => f.id === user.id) || farmers[0];
        this.currentFarmer = farmer;
        return farmer;
    },

    // ----------------- DASHBOARD -----------------
    async initDashboard() {
        const farmer = await this.getFarmerSession();
        if (!farmer) return;

        const nameEl = document.getElementById('farmer-stall-name');
        if (nameEl) nameEl.textContent = farmer.stall_name;

        const orders = await DB.getOrdersByFarmer(farmer.id);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'Placed').length;
        const readyOrders = orders.filter(o => o.status === 'Ready for Pickup').length;
        const completedOrders = orders.filter(o => o.status === 'Completed').length;
        const totalRevenue = orders.reduce((sum, o) => {
            if (o.status !== 'Cancelled') return sum + (Number(o.total_amount) || 0);
            return sum;
        }, 0);

        // Update Stat Cards
        const totalOrdersEl = document.getElementById('stat-total-orders');
        const pendingOrdersEl = document.getElementById('stat-pending-orders');
        const readyOrdersEl = document.getElementById('stat-ready-orders');
        const completedOrdersEl = document.getElementById('stat-completed-orders');
        const revenueEl = document.getElementById('stat-revenue');

        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
        if (readyOrdersEl) readyOrdersEl.textContent = readyOrders;
        if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
        if (revenueEl) revenueEl.textContent = App.formatCurrency(totalRevenue);

        // Recent Incoming Orders Table
        this.renderRecentOrdersTable(orders.slice(0, 5));

        // Top Selling Products
        this.renderTopSellingProducts(farmer.id);
    },

    renderRecentOrdersTable(recentOrders) {
        const tbody = document.getElementById('recent-orders-tbody');
        if (!tbody) return;

        if (recentOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No recent orders yet.</td></tr>';
            return;
        }

        let html = '';
        recentOrders.forEach(o => {
            html += `
            <tr>
                <td class="fw-bold">${o.order_number}</td>
                <td>${o.customer_name}</td>
                <td>${o.pickup_date} <small class="text-muted">(${o.pickup_time})</small></td>
                <td class="fw-bold text-success">${App.formatCurrency(o.total_amount)}</td>
                <td>${App.getStatusBadge(o.status)}</td>
                <td>
                    <a href="orders.html" class="btn btn-sm btn-outline-primary py-0 px-2">Manage</a>
                </td>
            </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    async renderTopSellingProducts(farmerId) {
        const container = document.getElementById('top-selling-products-list');
        if (!container) return;

        const products = await DB.getProductsByFarmer(farmerId);
        if (products.length === 0) {
            container.innerHTML = '<p class="text-muted small">No products listed yet.</p>';
            return;
        }

        let html = '';
        products.slice(0, 4).forEach(p => {
            html += `
            <div class="d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded-3">
                <div class="d-flex align-items-center gap-2">
                    <img src="${p.image_url}" alt="${p.name}" class="rounded-2" style="width: 44px; height: 44px; object-fit: cover;">
                    <div>
                        <h6 class="mb-0 fw-bold small text-dark">${p.name}</h6>
                        <small class="text-muted">${App.formatCurrency(p.price)} / ${p.unit}</small>
                    </div>
                </div>
                <span class="badge ${p.stock_quantity > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
                    ${p.stock_quantity} ${p.unit} left
                </span>
            </div>
            `;
        });
        container.innerHTML = html;
    },

    // ----------------- PRODUCTS MANAGEMENT -----------------
    async initProducts() {
        const farmer = await this.getFarmerSession();
        if (!farmer) return;

        this.renderProductsList();
        this.populateCategorySelect();
    },

    async renderProductsList() {
        const tbody = document.getElementById('farmer-products-tbody');
        if (!tbody) return;

        const farmer = this.currentFarmer || await this.getFarmerSession();
        const products = await DB.getProductsByFarmer(farmer.id);
        const categories = await DB.getCategories();

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted">You have not listed any products yet. Click "+ Add New Product" to start!</td></tr>';
            return;
        }

        let html = '';
        products.forEach(p => {
            const cat = categories.find(c => c.id === p.category_id);
            const isSoldOut = p.status === 'sold_out' || p.stock_quantity <= 0;
            html += `
            <tr>
                <td>
                    <img src="${p.image_url}" alt="${p.name}" class="rounded-3" style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>
                    <div class="fw-bold text-dark">${p.name}</div>
                    <small class="text-muted">${p.description ? p.description.slice(0, 50) + '...' : ''}</small>
                </td>
                <td><span class="badge bg-light text-dark border">${cat ? cat.name : 'Produce'}</span></td>
                <td class="fw-bold text-success">${App.formatCurrency(p.price)} <small class="text-muted">/${p.unit}</small></td>
                <td>
                    <input type="number" min="0" class="form-control form-control-sm text-center" style="width: 80px;" 
                           value="${p.stock_quantity}" onchange="FarmerPortal.updateStock('${p.id}', this.value)">
                </td>
                <td>
                    <span class="badge ${isSoldOut ? 'bg-danger' : 'bg-success'}">
                        ${isSoldOut ? 'Sold Out' : 'Available'}
                    </span>
                </td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-secondary" onclick="FarmerPortal.openEditProductModal('${p.id}')" title="Edit">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="FarmerPortal.deleteProduct('${p.id}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    async populateCategorySelect() {
        const select = document.getElementById('prodCategorySelect');
        if (!select) return;
        const categories = await DB.getCategories();
        select.innerHTML = '';
        categories.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    },

    openAddProductModal() {
        document.getElementById('productModalTitle').textContent = 'Add New Harvest Item';
        document.getElementById('productIdInput').value = '';
        document.getElementById('prodNameInput').value = '';
        document.getElementById('prodPriceInput').value = '';
        document.getElementById('prodUnitInput').value = 'kg';
        document.getElementById('prodStockInput').value = '20';
        document.getElementById('prodImageInput').value = '';
        document.getElementById('prodDescInput').value = '';
        
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    },

    async openEditProductModal(productId) {
        const prod = await DB.getProductById(productId);
        if (!prod) return;

        document.getElementById('productModalTitle').textContent = 'Edit Harvest Item';
        document.getElementById('productIdInput').value = prod.id;
        document.getElementById('prodNameInput').value = prod.name;
        document.getElementById('prodCategorySelect').value = prod.category_id;
        document.getElementById('prodPriceInput').value = prod.price;
        document.getElementById('prodUnitInput').value = prod.unit;
        document.getElementById('prodStockInput').value = prod.stock_quantity;
        document.getElementById('prodImageInput').value = prod.image_url;
        document.getElementById('prodDescInput').value = prod.description || '';

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    },

    async saveProductForm(e) {
        if (e) e.preventDefault();
        const farmer = this.currentFarmer || await this.getFarmerSession();
        const id = document.getElementById('productIdInput').value;
        const name = document.getElementById('prodNameInput').value.trim();
        const category_id = document.getElementById('prodCategorySelect').value;
        const price = Number(document.getElementById('prodPriceInput').value);
        const unit = document.getElementById('prodUnitInput').value.trim();
        const stock_quantity = parseInt(document.getElementById('prodStockInput').value, 10);
        let image_url = document.getElementById('prodImageInput').value.trim();
        const description = document.getElementById('prodDescInput').value.trim();

        if (!name || isNaN(price)) {
            App.showToast('Please provide valid product name and price.', 'error');
            return;
        }

        if (!image_url) {
            image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
        }

        const productData = {
            id: id || undefined,
            farmer_id: farmer.id,
            category_id: category_id,
            name: name,
            price: price,
            unit: unit,
            stock_quantity: stock_quantity,
            image_url: image_url,
            description: description,
            status: stock_quantity > 0 ? 'available' : 'sold_out'
        };

        await DB.saveProduct(productData);
        App.showToast('Product saved successfully!', 'success');
        
        const modalEl = document.getElementById('productModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        this.renderProductsList();
    },

    async updateStock(productId, newStock) {
        await DB.updateProductStock(productId, newStock);
        App.showToast('Stock quantity updated.', 'success');
        this.renderProductsList();
    },

    async deleteProduct(productId) {
        if (confirm('Are you sure you want to remove this product listing?')) {
            await DB.deleteProduct(productId);
            App.showToast('Product listing removed.', 'info');
            this.renderProductsList();
        }
    },

    // ----------------- ORDERS MANAGEMENT -----------------
    async initOrders() {
        const farmer = await this.getFarmerSession();
        if (!farmer) return;
        this.renderOrdersTable('all');
    },

    async renderOrdersTable(filterStatus = 'all') {
        const tbody = document.getElementById('farmer-orders-tbody');
        if (!tbody) return;

        const farmer = this.currentFarmer || await this.getFarmerSession();
        let orders = await DB.getOrdersByFarmer(farmer.id);

        if (filterStatus !== 'all') {
            orders = orders.filter(o => o.status === filterStatus);
        }

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">No orders matching status "${filterStatus}".</td></tr>`;
            return;
        }

        let html = '';
        orders.forEach(o => {
            const itemsSummary = o.items ? o.items.map(i => `${i.quantity} &times; ${i.product_name}`).join('<br>') : 'Produce items';
            
            // Generate workflow action buttons
            let actionButtons = '';
            if (o.status === 'Placed') {
                actionButtons = `
                    <button class="btn btn-sm btn-primary py-1 px-2" onclick="FarmerPortal.changeOrderStatus('${o.id}', 'Accepted')">
                        <i class="bi bi-check-circle"></i> Accept
                    </button>
                    <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="FarmerPortal.changeOrderStatus('${o.id}', 'Cancelled')">
                        Decline
                    </button>
                `;
            } else if (o.status === 'Accepted') {
                actionButtons = `
                    <button class="btn btn-sm btn-info text-white py-1 px-2" onclick="FarmerPortal.changeOrderStatus('${o.id}', 'Ready for Pickup')">
                        <i class="bi bi-bag-check"></i> Ready for Pickup
                    </button>
                `;
            } else if (o.status === 'Ready for Pickup') {
                actionButtons = `
                    <button class="btn btn-sm btn-success py-1 px-2" onclick="FarmerPortal.changeOrderStatus('${o.id}', 'Completed')">
                        <i class="bi bi-check2-all"></i> Mark Completed
                    </button>
                `;
            } else {
                actionButtons = `<span class="text-muted small">No action</span>`;
            }

            html += `
            <tr>
                <td class="fw-bold">${o.order_number}</td>
                <td>
                    <div class="fw-semibold text-dark">${o.customer_name}</div>
                    <small class="text-muted">${o.notes ? '<i class="bi bi-chat-left-text"></i> ' + o.notes : ''}</small>
                </td>
                <td class="small">${itemsSummary}</td>
                <td>
                    <div class="fw-bold">${o.pickup_date}</div>
                    <small class="text-muted">${o.pickup_time}</small>
                </td>
                <td class="fw-bold text-success">${App.formatCurrency(o.total_amount)}</td>
                <td>${App.getStatusBadge(o.status)}</td>
                <td>
                    <div class="d-flex gap-1 flex-wrap">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    async changeOrderStatus(orderId, newStatus) {
        await DB.updateOrderStatus(orderId, newStatus);
        App.showToast(`Order status updated to "${newStatus}"!`, 'success');
        this.renderOrdersTable();
    },

    // ----------------- PICKUP SLOTS -----------------
    async initPickupSlots() {
        const farmer = await this.getFarmerSession();
        if (!farmer) return;
        this.renderSlots();
    },

    async renderSlots() {
        const container = document.getElementById('farmer-slots-container');
        if (!container) return;

        const farmer = this.currentFarmer || await this.getFarmerSession();
        const slots = await DB.getPickupSlots(farmer.id);

        if (slots.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-4 text-muted">No pickup slots scheduled. Configure your weekly hours below.</div>';
            return;
        }

        let html = '';
        slots.forEach(s => {
            html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card p-3 border shadow-sm h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-success">${s.day || 'Market Day'}</span>
                        <button class="btn btn-sm text-danger p-0" onclick="FarmerPortal.deleteSlot('${s.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <h6 class="fw-bold text-dark mb-1"><i class="bi bi-clock me-1 text-primary"></i> ${s.time}</h6>
                    <p class="small text-muted mb-2">Max Pre-orders: <strong>${s.max_orders || 15}</strong></p>
                    <small class="text-muted border-top pt-2"><i class="bi bi-hourglass-split"></i> Cutoff: ${s.cutoff || '4 hours before'}</small>
                </div>
            </div>
            `;
        });
        container.innerHTML = html;
    },

    async addPickupSlot(e) {
        if (e) e.preventDefault();
        const farmer = this.currentFarmer || await this.getFarmerSession();
        const timeInput = document.getElementById('slotTimeInput');
        const maxInput = document.getElementById('slotMaxInput');
        const cutoffInput = document.getElementById('slotCutoffInput');

        const day = document.getElementById('slotDayInput').value;
        const time = timeInput ? timeInput.value.trim() : '';
        const max_orders = parseInt(maxInput ? maxInput.value : 0, 10);
        const cutoff = cutoffInput ? cutoffInput.value.trim() : '4 hours before';

        let isValid = true;
        if (!time || time.length < 5) {
            if (timeInput && window.Validator) Validator.markField(timeInput, false, 'Please specify a valid time range (e.g. 09:00 AM - 12:00 PM).');
            isValid = false;
        } else if (timeInput && window.Validator) {
            Validator.markField(timeInput, true);
        }

        if (isNaN(max_orders) || max_orders < 1) {
            if (maxInput && window.Validator) Validator.markField(maxInput, false, 'Max orders must be at least 1.');
            isValid = false;
        } else if (maxInput && window.Validator) {
            Validator.markField(maxInput, true);
        }

        if (!cutoff) {
            if (cutoffInput && window.Validator) Validator.markField(cutoffInput, false, 'Please specify an order cutoff time.');
            isValid = false;
        } else if (cutoffInput && window.Validator) {
            Validator.markField(cutoffInput, true);
        }

        if (!isValid) {
            App.showToast('Please fix the errors in the pickup slot form.', 'error');
            return;
        }

        await DB.savePickupSlot({
            farmer_id: farmer.id,
            day: day,
            time: time,
            max_orders: max_orders,
            cutoff: cutoff
        });

        App.showToast('Pickup slot created successfully!', 'success');
        if (timeInput) timeInput.value = '';
        this.renderSlots();
    },

    async deleteSlot(id) {
        if (confirm('Delete this pickup slot?')) {
            await DB.deletePickupSlot(id);
            App.showToast('Pickup slot removed.', 'info');
            this.renderSlots();
        }
    }
};

window.FarmerPortal = FarmerPortal;
