// ====================================================================
// MarketLink – eGreen Basket: Floating AI Assistant Chatbot
// Answers queries about markets, farmers, products, pickup times & locations
// ====================================================================

const Chatbot = {
    isOpen: false,

    init() {
        if (document.getElementById('ml-chatbot-widget')) return;

        const widgetEl = document.createElement('div');
        widgetEl.id = 'ml-chatbot-widget';
        widgetEl.innerHTML = `
            <!-- Chatbot Trigger Button -->
            <div id="chatbot-trigger" class="ml-chatbot-trigger" title="Ask MarketLink AI Assistant">
                <i class="bi bi-chat-heart-fill"></i>
            </div>

            <!-- Chatbot Window Box -->
            <div id="chatbot-box" class="ml-chatbot-box d-none">
                <div class="ml-chatbot-header">
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center" style="width:32px; height:32px;">
                            <i class="bi bi-robot text-success fs-5"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold text-white">GreenBot AI</h6>
                            <small class="text-white-50" style="font-size: 0.75rem;">Market & Farmer Assistant</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close btn-close-white" id="chatbot-close-btn"></button>
                </div>

                <div class="ml-chatbot-messages" id="chatbot-messages">
                    <div class="chat-bubble chat-bubble-bot">
                        Hello! 👋 I'm <strong>GreenBot</strong>, your MarketLink assistant. How can I help you today?
                    </div>
                    <div class="chat-bubble chat-bubble-bot small text-muted" style="background: transparent; border: none; padding: 0;">
                        Try asking:
                    </div>
                    <div class="d-flex flex-wrap gap-1 mb-2">
                        <button class="btn btn-outline-success btn-sm py-0 px-2 rounded-pill small" onclick="Chatbot.askQuick('What are the market timings?')">Market timings?</button>
                        <button class="btn btn-outline-success btn-sm py-0 px-2 rounded-pill small" onclick="Chatbot.askQuick('How does cash at pickup work?')">Payment method?</button>
                        <button class="btn btn-outline-success btn-sm py-0 px-2 rounded-pill small" onclick="Chatbot.askQuick('Where is Islamabad F-6 Market?')">F-6 Market location?</button>
                        <button class="btn btn-outline-success btn-sm py-0 px-2 rounded-pill small" onclick="Chatbot.askQuick('What fresh products are available?')">Fresh products?</button>
                    </div>
                </div>

                <form id="chatbot-form" class="ml-chatbot-input" onsubmit="Chatbot.handleSend(event)">
                    <input type="text" id="chatbot-input" class="form-control form-control-sm border-0 bg-light" placeholder="Ask about markets, timings, farmers..." autocomplete="off">
                    <button type="submit" class="btn btn-primary btn-sm px-3">
                        <i class="bi bi-send-fill"></i>
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(widgetEl);

        document.getElementById('chatbot-trigger').addEventListener('click', () => this.toggle());
        document.getElementById('chatbot-close-btn').addEventListener('click', () => this.toggle());
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const box = document.getElementById('chatbot-box');
        if (box) {
            if (this.isOpen) {
                box.classList.remove('d-none');
                document.getElementById('chatbot-input').focus();
            } else {
                box.classList.add('d-none');
            }
        }
    },

    askQuick(text) {
        document.getElementById('chatbot-input').value = text;
        this.handleSend(new Event('submit'));
    },

    async handleSend(e) {
        if (e) e.preventDefault();
        const inputEl = document.getElementById('chatbot-input');
        const text = inputEl.value.trim();
        if (!text) return;

        this.appendMessage(text, 'user');
        inputEl.value = '';

        // Typing indicator
        const typingId = this.showTypingIndicator();

        // Generate response
        setTimeout(async () => {
            this.removeTypingIndicator(typingId);
            const reply = await this.generateResponse(text);
            this.appendMessage(reply, 'bot');
        }, 600);
    },

    appendMessage(text, sender = 'bot') {
        const container = document.getElementById('chatbot-messages');
        if (!container) return;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble chat-bubble-${sender}`;
        bubble.innerHTML = text;
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    },

    showTypingIndicator() {
        const container = document.getElementById('chatbot-messages');
        const typingEl = document.createElement('div');
        const id = 'typing-' + Date.now();
        typingEl.id = id;
        typingEl.className = 'chat-bubble chat-bubble-bot text-muted small';
        typingEl.innerHTML = '<i class="bi bi-three-dots"></i> GreenBot is typing...';
        container.appendChild(typingEl);
        container.scrollTop = container.scrollHeight;
        return id;
    },

    removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    },

    async generateResponse(query) {
        const q = query.toLowerCase();

        // Market timings
        if (q.includes('timing') || q.includes('time') || q.includes('hour') || q.includes('when')) {
            return `📅 <strong>Market Timings:</strong><br>
            • <strong>Islamabad F-6:</strong> Friday & Saturday, 8:00 AM – 6:00 PM<br>
            • <strong>Lahore Model Town:</strong> Sunday, 7:30 AM – 4:00 PM<br>
            • <strong>Karachi Clifton:</strong> Saturday, 8:00 AM – 3:00 PM<br>
            • <strong>Rawalpindi Hub:</strong> Tuesday & Thursday, 8:30 AM – 5:30 PM<br>
            • <strong>Peshawar Heritage:</strong> Wednesday & Sunday, 8:00 AM – 5:00 PM`;
        }

        // Location queries
        if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('map')) {
            if (q.includes('islamabad') || q.includes('f-6')) {
                return `📍 <strong>Islamabad F-6 Bazaar:</strong> Located at School Road, Super Market, Sector F-6, Islamabad. You can view it on our interactive map on the <a href="markets.html" class="fw-bold">Markets page</a>!`;
            }
            if (q.includes('lahore') || q.includes('model town')) {
                return `📍 <strong>Lahore Market:</strong> Located at Central Park Ground, Model Town, Lahore. Open every Sunday from 7:30 AM.`;
            }
            if (q.includes('karachi') || q.includes('clifton')) {
                return `📍 <strong>Karachi Market:</strong> Located near Beach Park, Block 2, Clifton, Karachi. Open every Saturday!`;
            }
            return `📍 We have 5 primary farmers markets across Pakistan: Islamabad F-6, Lahore Model Town, Karachi Clifton, Rawalpindi Ayub Park, and Peshawar Shahi Bagh. Check the <a href="markets.html" class="fw-bold">Markets page</a> for interactive OpenStreetMap GPS locations!`;
        }

        // Payment and pickup queries
        if (q.includes('payment') || q.includes('pay') || q.includes('cash') || q.includes('card') || q.includes('online')) {
            return `💵 <strong>Physical Cash at Pickup:</strong><br>
            There is <em>NO online credit card or bank payment</em> on MarketLink. When placing a pre-order, you reserve your basket. You simply inspect and pay the farmer in cash when you arrive at their stall during your pickup window!`;
        }

        // Pre-orders and pickup slot queries
        if (q.includes('pre-order') || q.includes('order') || q.includes('pickup') || q.includes('slot')) {
            return `🛍️ <strong>How Pre-Orders Work:</strong><br>
            1. Browse fresh produce on our Products page.<br>
            2. Add items to your Basket.<br>
            3. Choose your market and farmer's pickup time slot.<br>
            4. Collect your fresh produce and pay in cash! You can modify or cancel orders in your dashboard prior to the farmer's cutoff time.`;
        }

        // Farmer availability
        if (q.includes('farmer') || q.includes('stall') || q.includes('grower')) {
            return `👨‍🌾 We have <strong>8 verified local farmers</strong> including <em>GreenValley Organic Farm</em> (Islamabad), <em>Potohar Fresh Orchards</em> (Chakwal), <em>Sindh Dairy</em> (Karachi), <em>Chenab Bakery</em> (Lahore), and <em>Swat Mountain Fruit Co.</em> Visit the <a href="farmers.html" class="fw-bold">Farmers page</a> to view individual profiles!`;
        }

        // Products
        if (q.includes('product') || q.includes('fruit') || q.includes('vegetable') || q.includes('milk') || q.includes('honey') || q.includes('ghee') || q.includes('egg')) {
            return `🥦 <strong>Current Fresh Stock:</strong><br>
            We offer farm-fresh red tomatoes (Rs. 180/kg), Desi Ghee (Rs. 2,400/kg), pure buffalo milk (Rs. 220/L), Sidr mountain honey (Rs. 2,800/jar), free-range desi eggs (Rs. 390/doz), and artisan sourdough bread. Head to the <a href="products.html" class="fw-bold">Products page</a> to explore all 30 items!`;
        }

        // Cancellation or modification
        if (q.includes('cancel') || q.includes('modify') || q.includes('change')) {
            return `🔄 <strong>Modifying/Cancelling Orders:</strong><br>
            You can modify or cancel your pre-order anytime while its status is <strong>Placed</strong> or <strong>Accepted</strong> before the cutoff time. Visit your <a href="customer/orders.html" class="fw-bold">Customer Orders</a> page to manage active requests.`;
        }

        // Default fallback
        return `🌿 I can assist you with:
        • Market locations & operating hours<br>
        • Farmer stall availability<br>
        • Fresh product stock & PKR prices<br>
        • Pickup time slots and cash-on-pickup guidelines.<br><br>
        What specific market or product would you like to know about?`;
    }
};

window.Chatbot = Chatbot;

// Auto-initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    Chatbot.init();
});
