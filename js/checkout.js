// ====================================================================
// MarketLink – eGreen Basket: Pre-Order & Pickup Checkout Engine
// Physical Cash-on-Pickup Flow with Robust Validations
// ====================================================================

const Checkout = {
    selectedMarketId: null,
    selectedFarmerId: null,

    async init() {
        const cart = Cart.getCart();
        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        // Enforce customer authentication before checkout
        const user = Auth.getCurrentUser();
        if (!user) {
            sessionStorage.setItem('ml_auth_redirect', 'checkout.html');
            App.showToast('Please log in with your customer account to place a pre-order.', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 600);
            return;
        }

        // Update signed-in badge
        const authNameEl = document.getElementById('checkout-auth-name');
        const authEmailEl = document.getElementById('checkout-auth-email');
        if (authNameEl) authNameEl.textContent = user.name;
        if (authEmailEl) authEmailEl.textContent = user.email;

        // Pre-fill user contact fields
        const nameEl = document.getElementById('customerName');
        const phoneEl = document.getElementById('customerPhone');
        const emailEl = document.getElementById('customerEmail');
        if (nameEl) nameEl.value = user.name || '';
        if (phoneEl) phoneEl.value = user.phone || '';
        if (emailEl) emailEl.value = user.email || '';

        // Render Order Items Summary
        this.renderOrderSummary();

        // Populate Markets Dropdown
        await this.populateMarkets();

        // Determine if cart already has an associated farmer
        const farmerIds = [...new Set(cart.map(item => item.farmer_id))];
        if (farmerIds.length > 0) {
            this.selectedFarmerId = farmerIds[0];
            await this.populateFarmerAndSlots(this.selectedFarmerId);
        }

        // Setup min date to today
        const dateInput = document.getElementById('pickupDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];

            dateInput.addEventListener('change', () => {
                const isValid = Validator.isFutureOrToday(dateInput.value);
                Validator.markField(dateInput, isValid, 'Pickup date cannot be in the past.');
            });
        }

        this.setupRealtimeValidations();
    },

    setupRealtimeValidations() {
        const nameEl = document.getElementById('customerName');
        const phoneEl = document.getElementById('customerPhone');
        const emailEl = document.getElementById('customerEmail');
        const mktEl = document.getElementById('marketSelect');
        const slotEl = document.getElementById('timeSlotSelect');

        if (nameEl) {
            nameEl.addEventListener('blur', () => {
                Validator.markField(nameEl, Validator.isValidName(nameEl.value), 'Please enter a valid full name (min 3 letters).');
            });
        }
        if (phoneEl) {
            phoneEl.addEventListener('blur', () => {
                Validator.markField(phoneEl, Validator.isValidPhone(phoneEl.value), 'Enter a valid Pakistani phone number (e.g. 03001234567).');
            });
        }
        if (emailEl) {
            emailEl.addEventListener('blur', () => {
                Validator.markField(emailEl, Validator.isValidEmail(emailEl.value), 'Please enter a valid email address.');
            });
        }
        if (mktEl) {
            mktEl.addEventListener('change', () => {
                Validator.markField(mktEl, mktEl.value !== '', 'Please select a market location for collection.');
            });
        }
        if (slotEl) {
            slotEl.addEventListener('change', () => {
                Validator.markField(slotEl, slotEl.value !== '', 'Please select an available pickup time window.');
            });
        }
    },

    renderOrderSummary() {
        const cart = Cart.getCart();
        const container = document.getElementById('checkout-items-list');
        const totalEl = document.getElementById('checkout-total-amount');
        if (!container) return;

        let html = '';
        cart.forEach(item => {
            html += `
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div>
                        <div class="fw-bold text-dark">${item.product_name}</div>
                        <small class="text-muted">${item.quantity} ${item.unit} &times; ${App.formatCurrency(item.price)}</small>
                    </div>
                    <span class="fw-bold text-success">${App.formatCurrency(item.subtotal)}</span>
                </div>
            `;
        });
        container.innerHTML = html;

        const totals = Cart.getTotals();
        if (totalEl) totalEl.textContent = App.formatCurrency(totals.total);
    },

    async populateMarkets() {
        const select = document.getElementById('marketSelect');
        if (!select) return;

        const markets = await DB.getMarkets();
        select.innerHTML = '<option value="">-- Choose Pickup Farmers Market --</option>';
        markets.forEach(m => {
            select.innerHTML += `<option value="${m.id}">${m.name} (${m.operating_days})</option>`;
        });

        if (markets.length > 0) {
            select.value = markets[0].id;
            this.selectedMarketId = markets[0].id;
        }

        select.addEventListener('change', async (e) => {
            this.selectedMarketId = e.target.value;
            const market = await DB.getMarketById(this.selectedMarketId);
            const mktInfoEl = document.getElementById('selectedMarketInfo');
            if (mktInfoEl && market) {
                mktInfoEl.innerHTML = `
                    <div class="small p-2 bg-light rounded mt-2 border">
                        <i class="bi bi-geo-alt-fill text-danger me-1"></i> ${market.address}<br>
                        <i class="bi bi-calendar-event me-1"></i> Open: ${market.operating_days} (${market.opening_time} - ${market.closing_time})
                    </div>
                `;
            }
        });
    },

    async populateFarmerAndSlots(farmerId) {
        const farmer = await DB.getFarmerById(farmerId);
        const farmerSelect = document.getElementById('farmerSelect');

        if (farmerSelect) {
            const farmers = await DB.getFarmers();
            farmerSelect.innerHTML = '';
            farmers.forEach(f => {
                const isSelected = f.id === farmerId ? 'selected' : '';
                farmerSelect.innerHTML += `<option value="${f.id}" ${isSelected}>${f.stall_name} (${f.contact_person})</option>`;
            });

            farmerSelect.addEventListener('change', async (e) => {
                this.selectedFarmerId = e.target.value;
                await this.loadPickupSlots(this.selectedFarmerId);
            });
        }

        await this.loadPickupSlots(farmerId || (farmer ? farmer.id : 'fm-1'));
    },

    async loadPickupSlots(farmerId) {
        const slotSelect = document.getElementById('timeSlotSelect');
        if (!slotSelect) return;

        const slots = await DB.getPickupSlots(farmerId);
        if (slots.length > 0) {
            slotSelect.innerHTML = '';
            slots.forEach(s => {
                slotSelect.innerHTML += `<option value="${s.time}">${s.day ? s.day + ': ' : ''}${s.time} (Cutoff: ${s.cutoff || '4h'})</option>`;
            });
        } else {
            slotSelect.innerHTML = `
                <option value="09:00 AM - 10:30 AM">Morning: 09:00 AM - 10:30 AM</option>
                <option value="11:00 AM - 12:30 PM">Midday: 11:00 AM - 12:30 PM</option>
                <option value="02:00 PM - 03:30 PM">Afternoon: 02:00 PM - 03:30 PM</option>
                <option value="04:00 PM - 05:30 PM">Evening: 04:00 PM - 05:30 PM</option>
            `;
        }
    },

    // Submit Pre-Order with Full Business Validations
    async submitPreOrder(event) {
        if (event) event.preventDefault();

        const cart = Cart.getCart();
        if (cart.length === 0) {
            App.showToast('Your basket is empty. Please add products first.', 'error');
            return;
        }

        // Validate Form Fields
        const nameEl = document.getElementById('customerName');
        const phoneEl = document.getElementById('customerPhone');
        const emailEl = document.getElementById('customerEmail');
        const marketEl = document.getElementById('marketSelect');
        const dateEl = document.getElementById('pickupDate');
        const slotEl = document.getElementById('timeSlotSelect');
        const notes = document.getElementById('orderNotes').value.trim();

        const isNameValid = Validator.markField(nameEl, Validator.isValidName(nameEl.value), 'Full name must be at least 3 letters.');
        const isPhoneValid = Validator.markField(phoneEl, Validator.isValidPhone(phoneEl.value), 'Enter a valid Pakistani phone number (e.g. 03001234567).');
        const isEmailValid = Validator.markField(emailEl, Validator.isValidEmail(emailEl.value), 'Please enter a valid email address.');
        const isMarketValid = Validator.markField(marketEl, marketEl.value !== '', 'Please select a Farmers Market for pickup.');
        const isDateValid = Validator.markField(dateEl, Validator.isFutureOrToday(dateEl.value), 'Pickup date must be today or a future date.');
        const isSlotValid = Validator.markField(slotEl, slotEl.value !== '', 'Please choose a pickup time window.');

        if (!isNameValid || !isPhoneValid || !isEmailValid || !isMarketValid || !isDateValid || !isSlotValid) {
            App.showToast('Please fix all errors highlighted in the pre-order form.', 'error');
            return;
        }

        // Live Stock Validation Check (Business Rule: Never allow pre-orders exceeding current stock)
        for (const item of cart) {
            const liveProd = await DB.getProductById(item.product_id);
            if (!liveProd) {
                App.showToast(`Product "${item.product_name}" is no longer available.`, 'error');
                return;
            }
            if (liveProd.status === 'sold_out' || liveProd.stock_quantity <= 0) {
                App.showToast(`Item "${liveProd.name}" was just sold out! Please update your basket.`, 'error');
                return;
            }
            if (item.quantity > liveProd.stock_quantity) {
                App.showToast(`Stock limit: Only ${liveProd.stock_quantity} ${liveProd.unit} of "${liveProd.name}" left. Please reduce your basket quantity.`, 'error');
                return;
            }
        }

        let user = Auth.getCurrentUser();
        if (!user) {
            sessionStorage.setItem('ml_auth_redirect', 'checkout.html');
            App.showToast('Please sign in to confirm your pre-order!', 'error');
            setTimeout(() => window.location.href = 'login.html', 500);
            return;
        }

        // Keep user phone updated
        if (phoneEl && phoneEl.value.trim()) {
            user.phone = phoneEl.value.trim();
            Auth.setSession(user);
        }

        const marketId = marketEl.value;
        const farmerId = document.getElementById('farmerSelect').value;
        const pickupDate = dateEl.value;
        const pickupTime = slotEl.value;

        const market = await DB.getMarketById(marketId);
        const farmer = await DB.getFarmerById(farmerId);
        const totals = Cart.getTotals();

        const orderData = {
            customer_id: user.id,
            customer_name: user.name,
            farmer_id: farmerId,
            farmer_name: farmer ? farmer.stall_name : 'Local Farmer',
            market_id: marketId,
            market_name: market ? market.name : 'Farmers Market',
            pickup_date: pickupDate,
            pickup_time: pickupTime,
            total_amount: totals.total,
            notes: notes,
            items: cart.map(i => ({
                product_id: i.product_id,
                product_name: i.product_name,
                quantity: i.quantity,
                price: i.price,
                subtotal: i.subtotal
            }))
        };

        const newOrder = await DB.createOrder(orderData);
        Cart.clearCart();

        // Show Confirmation Modal
        this.showOrderConfirmationModal(newOrder);
    },

    showOrderConfirmationModal(order) {
        const modalEl = document.createElement('div');
        modalEl.className = 'modal fade';
        modalEl.id = 'orderConfirmationModal';
        modalEl.setAttribute('data-bs-backdrop', 'static');
        modalEl.setAttribute('tabindex', '-1');
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
                    <div class="modal-body text-center p-4 p-md-5">
                        <div class="mb-3 text-success">
                            <i class="bi bi-check-circle-fill display-3"></i>
                        </div>
                        <h3 class="fw-bold mb-2">Pre-Order Placed Successfully!</h3>
                        <p class="text-muted mb-3">
                            Your order <strong>${order.order_number}</strong> has been sent to <strong>${order.farmer_name}</strong>.
                        </p>
                        
                        <div class="cash-pickup-notice text-start mb-4">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <i class="bi bi-cash-coin fs-5"></i>
                                <strong>Payment Method: Physical Cash at Pickup</strong>
                            </div>
                            <small class="text-success-emphasis">
                                You do not pay online. Hand the exact amount of <strong>${App.formatCurrency(order.total_amount)}</strong> directly to the farmer at the stall.
                            </small>
                        </div>

                        <div class="card bg-light border-0 p-3 mb-4 text-start small">
                            <div class="d-flex justify-content-between py-1">
                                <span class="text-muted">Market:</span>
                                <span class="fw-bold">${order.market_name}</span>
                            </div>
                            <div class="d-flex justify-content-between py-1">
                                <span class="text-muted">Pickup Date:</span>
                                <span class="fw-bold">${order.pickup_date}</span>
                            </div>
                            <div class="d-flex justify-content-between py-1">
                                <span class="text-muted">Time Slot:</span>
                                <span class="fw-bold">${order.pickup_time}</span>
                            </div>
                            <div class="d-flex justify-content-between py-1 border-top mt-1 pt-1">
                                <span class="text-muted">Current Status:</span>
                                ${App.getStatusBadge(order.status)}
                            </div>
                        </div>

                        <div class="d-flex flex-column gap-2">
                            <a href="customer/orders.html" class="btn btn-primary w-100 py-2">
                                <i class="bi bi-clock-history me-1"></i> Track Order in Dashboard
                            </a>
                            <a href="products.html" class="btn btn-earthy w-100 py-2">
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
};

window.Checkout = Checkout;
