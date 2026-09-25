# MarketLink – eGreen Basket 🌿
> **Discover Local. Eat Fresh.**  
> A Modern Responsive Full-Stack Agricultural Marketplace connecting local farmers-market farmers with customers for weekly fresh produce pre-orders and pickup.

---

## 🎓 Full-Stack Web Development Architecture
This web application is built for seamless deployment on **Vercel** or **Netlify**:
- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript (ES6+), Bootstrap Icons, Leaflet.js / OpenStreetMap
- **Backend**: Node.js Vercel & Netlify Serverless Functions (`/api/*`)
- **Primary Database**: **MongoDB Atlas** (100% Free Forever M0 Cloud Cluster, zero server maintenance)
- **Relational SQL Database Support**: Full MySQL Schema included in [`database/mysql-schema.sql`](database/mysql-schema.sql)
- **Deployment**: 1-Click ready for **Vercel** and **Netlify** with `vercel.json` and `netlify.toml`
- **Offline / Presentation Mode**: Automatic seamless fallback to local storage so presentations and grading never fail even without an active internet connection.

---

## ⚡ Quick Start (Instant Run Locally)

### Method 1: Node.js Express Dev Server (Recommended)
Open a terminal in the project directory:
```bash
npm install
npm start
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- Backend API Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)

### Method 2: Verification Test Suite
Run the automated test suite verifying all 53 static pages, assets, and serverless API routes:
```bash
node scripts/verify-all.js
```

---

## 🚀 Deploying to Vercel or Netlify

See complete step-by-step instructions in [**`DEPLOYMENT_GUIDE.md`**](DEPLOYMENT_GUIDE.md).

### 1-Minute Vercel Deployment:
1. Push project to your GitHub repository.
2. In [Vercel Dashboard](https://vercel.com), click **"Add New Project"** -> Import repo.
3. In **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
4. Click **Deploy**!
5. After deployment, open your live website and click **"Backend & Database Status"** in the footer -> **"Seed MongoDB Database"** to load all demo markets, farmers, and products.

---

## 🔑 Demo Login Credentials (1-Click Login Ready)

The application includes 1-click Quick Demo login buttons on `login.html` for instant evaluation:

| Role | Demo Email | Password | Dashboard Link |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@marketlink.com` | `demo123` | `customer/dashboard.html` |
| **Farmer** | `farmer@marketlink.com` | `demo123` | `farmer/dashboard.html` |
| **Administrator** | `admin@marketlink.com` | `demo123` | `admin/dashboard.html` |

---

## 🌾 Core Features

### 1. Public Marketplace
- **Home Page (`index.html`)**: Fresh organic hero banner, featured markets, popular products, top-rated farmers, 4-step workflow, customer reviews, and floating AI assistant chatbot (`GreenBot`).
- **Markets Directory (`markets.html`)**: Interactive **Leaflet.js / OpenStreetMap** with custom green markers for 5 Pakistani weekend bazaars, timings, search, day and city filters.
- **Farmers Directory (`farmers.html`)**: Farmer stall cards with ratings, market affiliation, and favorites toggle.
- **Farmer Profile (`farmer-profile.html`)**: Stall details, weekly stock catalog with Add to Basket, ratings, and customer reviews.
- **Product Marketplace (`products.html`)**: Category pills (Vegetables, Fruits, Dairy, Bakery, Eggs, Honey, Other), PKR price filter, search, and stock status.
- **Product Details (`product-details.html`)**: Harvest specifications, farmer stall card, and strict stock-limit validation.

### 2. Pre-Order & Physical Cash-on-Pickup Flow
- **Shopping Basket (`cart.html`)**: Dynamic quantity adjustments, stock safeguards, itemized subtotals, and grand total in PKR.
- **Pickup Checkout (`checkout.html`)**:
  - Payment is made physically in cash upon collection at the stall.
  - Market selection, Farmer selection, Pickup date, and pickup time window selection.
  - Generates unique tracking ID (e.g. `ML-2026-801`).
  - Order status progression:  
    $$\text{Placed} \longrightarrow \text{Accepted} \longrightarrow \text{Ready for Pickup} \longrightarrow \text{Completed}$$

### 3. Customer Portal (`/customer`)
- **Dashboard (`customer/dashboard.html`)**: KPI cards (Active Pre-orders, Completed Pickups, Total Spent in PKR, Saved Favorites).
- **Orders (`customer/orders.html`)**: Pre-order history, order item details modal, order cancellation/modification, and review submission.
- **Favorites (`customer/favorites.html`)**: Saved farmers, products, and markets.
- **Profile (`customer/profile.html`)**: Name, phone, address, and preferences.

### 4. Farmer Portal (`/farmer`)
- **Dashboard (`farmer/dashboard.html`)**: Sales metrics (Total Orders, Pending Orders, Ready for Pickup, Completed, Revenue in PKR).
- **Product CRUD (`farmer/products.html`)**: Add, edit, delete harvest items, set category, price, unit, stock quantity, and mark sold out.
- **Order Processing (`farmer/orders.html`)**: Accept orders, mark ready for pickup, mark completed upon cash collection, or decline.
- **Pickup Slots (`farmer/pickup-slots.html`)**: Configure weekly pickup slots (market days, hours, max orders cap).
- **Stall Settings (`farmer/profile.html`)**: Edit stall branding, contact info, market affiliation, and bio.

### 5. Administrator Portal (`/admin`)
- **Dashboard (`admin/dashboard.html`)**: Platform metrics (Customers, Farmers, Markets, Products, Orders, Revenue in PKR).
- **User Accounts (`admin/users.html`)**: Customer directory, search, and status toggle (Active / Suspended).
- **Farmer Moderation (`admin/farmers.html`)**: Approve pending farmer applications and suspend stalls.
- **Market Locations CRUD (`admin/markets.html`)**: Add, edit, and delete markets with GPS coordinates.
- **Product Moderation (`admin/products.html`)**: Platform-wide catalog inspection and removal.
- **Review Moderation (`admin/reviews.html`)**: Inspect star ratings and remove spam reviews.
- **Reports & Analytics (`admin/reports.html`)**: Platform revenue summary and market breakdown.

---

## 🗄️ Database Architecture & Schemas

### 1. MongoDB Atlas (Cloud NoSQL)
- Configured in Vercel Serverless Functions via `MONGODB_URI`.
- Connection pooling and caching in [`api/lib/mongodb.js`](api/lib/mongodb.js).
- Collections: `markets`, `farmers`, `products`, `categories`, `customers`, `orders`, `reviews`, `pickup_slots`.
- JSON Seed Data: [`database/mongodb-seed.json`](database/mongodb-seed.json).
- Seed endpoint: `GET /api/seed` or `npm run seed`.

### 2. MySQL Relational Schema
- Full SQL DDL with `CREATE TABLE` and sample `INSERT` statements for MySQL 8.0+:
- File: [`database/mysql-schema.sql`](database/mysql-schema.sql).

---

## 📁 Project Directory Structure
```
marketlink/
│
├── api/                        # Vercel & Netlify Serverless Backend API
│   ├── lib/
│   │   ├── mongodb.js          # MongoDB Atlas cached client connection
│   │   ├── handler.js          # CORS and request body parser
│   │   └── seed-data.js        # Realistic demo dataset for cloud seeding
│   ├── health.js               # GET /api/health (DB connectivity & ping)
│   ├── seed.js                 # GET/POST /api/seed (1-click database population)
│   ├── markets.js              # GET/POST/DELETE /api/markets
│   ├── farmers.js              # GET/POST/PATCH /api/farmers
│   ├── products.js             # GET/POST/PATCH/DELETE /api/products
│   ├── orders.js               # GET/POST/PATCH /api/orders (with auto stock deduction)
│   ├── categories.js           # GET /api/categories
│   ├── auth.js                 # POST /api/auth (Login & Registration)
│   ├── reviews.js              # GET/POST/DELETE /api/reviews
│   ├── favorites.js            # GET/POST /api/favorites
│   ├── slots.js                # GET/POST/DELETE /api/slots
│   ├── customers.js            # GET/PATCH /api/customers
│   ├── stats.js                # GET /api/stats (Platform KPI metrics)
│   └── contact.js              # POST /api/contact (Contact inquiries)
│
├── database/
│   ├── mysql-schema.sql        # Complete MySQL relational schema & seed SQL
│   └── mongodb-seed.json       # Exported MongoDB collections in JSON
│
├── js/
│   ├── config.js               # App configuration & Vercel API base route
│   ├── db.js                   # Universal data access layer (Vercel API + Local fallback)
│   ├── auth.js                 # Authentication & access control
│   ├── app.js                  # Shared UI components & backend health status modal
│   ├── demo-data.js            # Local demo dataset
│   ├── cart.js                 # Cart state management
│   ├── checkout.js             # Pre-order checkout logic
│   ├── chatbot.js              # AI assistant chatbot
│   ├── markets.js              # Markets UI & map integration
│   ├── products.js             # Product catalog UI
│   ├── farmer.js               # Farmer stall UI
│   └── admin.js                # Admin management UI
│
├── customer/                   # Customer dashboard & order history
├── farmer/                     # Farmer stall management & catalog
├── admin/                      # Administrator controls & moderation
├── css/style.css               # Agricultural theme CSS
├── server.js                   # Local Express server matching Vercel routes
├── vercel.json                 # Vercel deployment configuration
├── netlify.toml                # Netlify deployment configuration
├── package.json                # Node dependencies & npm scripts
├── DEPLOYMENT_GUIDE.md         # Step-by-step deployment guide
└── index.html                  # Homepage
```
