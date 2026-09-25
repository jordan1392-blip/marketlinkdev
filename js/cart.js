// ====================================================================
// MarketLink – eGreen Basket: Shopping Cart Management
// Manages cart persistence, stock limits, subtotal calculations
// ====================================================================

const Cart = {
    // Get array of items currently in cart
    getCart() {
        const stored = localStorage.getItem(ML_CONFIG.STORAGE_KEYS.CART);
        return stored ? JSON.parse(stored) : [];
    },

    // Save cart state
    saveCart(cart) {
        localStorage.setItem(ML_CONFIG.STORAGE_KEYS.CART, JSON.stringify(cart));
        App.updateCartBadges();
    },

    // Add product to cart with strict stock validation
    async addItem(productId, quantity = 1) {
        quantity = parseInt(quantity, 10) || 1;
        const product = await DB.getProductById(productId);
        if (!product) {
            App.showToast('Product not found.', 'error');
            return false;
        }

        if (product.status === 'sold_out' || product.stock_quantity <= 0) {
            App.showToast(`Sorry, ${product.name} is currently sold out.`, 'error');
            return false;
        }

        const farmer = await DB.getFarmerById(product.farmer_id);
        const cart = this.getCart();
        const existingItem = cart.find(item => item.product_id === productId);

        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const newTotalQty = currentQtyInCart + quantity;

        // Prevent ordering more than available stock
        if (newTotalQty > product.stock_quantity) {
            App.showToast(`Stock limit reached! Only ${product.stock_quantity} ${product.unit} available.`, 'error');
            return false;
        }

        if (existingItem) {
            existingItem.quantity = newTotalQty;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        } else {
            cart.push({
                product_id: product.id,
                product_name: product.name,
                image_url: product.image_url,
                price: Number(product.price),
                unit: product.unit,
                farmer_id: product.farmer_id,
                farmer_name: farmer ? (farmer.stall_name || farmer.farmer_name) : 'Local Farmer',
                quantity: quantity,
                subtotal: Number(product.price) * quantity,
                stock_quantity: product.stock_quantity
            });
        }

        this.saveCart(cart);
        App.showToast(`Added ${quantity} ${product.unit} of ${product.name} to cart!`, 'success');
        return true;
    },

    // Update item quantity directly
    async updateQuantity(productId, newQty) {
        newQty = parseInt(newQty, 10);
        if (newQty <= 0) {
            return this.removeItem(productId);
        }

        const product = await DB.getProductById(productId);
        const maxStock = product ? product.stock_quantity : 999;

        if (newQty > maxStock) {
            App.showToast(`Maximum available stock is ${maxStock} ${product ? product.unit : 'units'}.`, 'error');
            return false;
        }

        const cart = this.getCart();
        const item = cart.find(i => i.product_id === productId);
        if (item) {
            item.quantity = newQty;
            item.subtotal = item.price * newQty;
            this.saveCart(cart);
            return true;
        }
        return false;
    },

    // Remove single item from cart
    removeItem(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.product_id !== productId);
        this.saveCart(cart);
        App.showToast('Item removed from cart.', 'info');
        return true;
    },

    // Empty entire cart
    clearCart() {
        localStorage.removeItem(ML_CONFIG.STORAGE_KEYS.CART);
        App.updateCartBadges();
    },

    // Calculate totals
    getTotals() {
        const cart = this.getCart();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return {
            count,
            subtotal: total,
            total
        };
    },

    // Render cart items on cart.html
    renderCartPage() {
        const container = document.getElementById('cart-items-container');
        const summaryContainer = document.getElementById('cart-summary-container');
        if (!container) return;

        const cart = this.getCart();
        if (cart.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="mb-3 text-muted">
                        <i class="bi bi-cart-x fs-1 opacity-50"></i>
                    </div>
                    <h4 class="fw-bold mb-2">Your Basket is Empty</h4>
                    <p class="text-muted mb-4">Discover organic fruits, vegetables, and fresh dairy from our local farmers.</p>
                    <a href="products.html" class="btn btn-primary px-4">
                        <i class="bi bi-basket me-2"></i> Browse Products
                    </a>
                </div>
            `;
            if (summaryContainer) summaryContainer.style.display = 'none';
            return;
        }

        if (summaryContainer) summaryContainer.style.display = 'block';

        let rowsHtml = '';
        cart.forEach(item => {
            rowsHtml += `
            <div class="card mb-3 border p-3">
                <div class="row align-items-center g-3">
                    <div class="col-3 col-md-2">
                        <img src="${item.image_url}" alt="${item.product_name}" class="img-fluid rounded-3" style="height: 75px; width: 100%; object-fit: cover;">
                    </div>
                    <div class="col-9 col-md-4">
                        <h6 class="fw-bold mb-1">${item.product_name}</h6>
                        <p class="small text-muted mb-0 d-flex align-items-center gap-1">
                            <i class="bi bi-shop text-success"></i> ${item.farmer_name}
                        </p>
                        <p class="small text-muted mb-0">${App.formatCurrency(item.price)} / ${item.unit}</p>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="input-group input-group-sm" style="max-width: 130px;">
                            <button class="btn btn-outline-secondary" type="button" onclick="Cart.changeQuantity('${item.product_id}', ${item.quantity - 1})">-</button>
                            <input type="number" min="1" max="${item.stock_quantity}" class="form-control text-center bg-white" value="${item.quantity}" onchange="Cart.handleManualQty('${item.product_id}', this.value)">
                            <button class="btn btn-outline-secondary" type="button" onclick="Cart.changeQuantity('${item.product_id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="col-4 col-md-2 text-end">
                        <span class="fw-bold fs-6 text-success">${App.formatCurrency(item.subtotal)}</span>
                    </div>
                    <div class="col-2 col-md-1 text-end">
                        <button class="btn btn-sm text-danger p-0" onclick="Cart.removeItem('${item.product_id}'); Cart.renderCartPage();" title="Remove">
                            <i class="bi bi-trash fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
        });

        container.innerHTML = rowsHtml;

        const totals = this.getTotals();
        const totalAmountEl = document.getElementById('cart-total-amount');
        const itemCountEl = document.getElementById('cart-item-count');
        if (totalAmountEl) totalAmountEl.textContent = App.formatCurrency(totals.total);
        if (itemCountEl) itemCountEl.textContent = `${totals.count} item(s)`;
    },

    async changeQuantity(productId, newQty) {
        await this.updateQuantity(productId, newQty);
        this.renderCartPage();
    },

    async handleManualQty(productId, val) {
        let q = parseInt(val, 10);
        if (isNaN(q) || q < 1) q = 1;
        await this.updateQuantity(productId, q);
        this.renderCartPage();
    }
};

window.Cart = Cart;
