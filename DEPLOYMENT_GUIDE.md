# 🚀 MarketLink – Vercel, Netlify & MongoDB Deployment Guide

Is guide me complete step-by-step instructions hain ke aap MarketLink project ko **Vercel** ya **Netlify** par backend ke sath kaise deploy karenge aur **MongoDB Atlas (100% Free)** se kaise connect karenge.

---

## 📑 Table of Contents
1. [MongoDB Atlas Cloud Database Setup (Free Forever)](#1-mongodb-atlas-setup)
2. [Vercel Deployment (Recommended - Easiest & Fastest)](#2-vercel-deployment)
3. [Netlify Deployment](#3-netlify-deployment)
4. [Local Testing (Before Uploading)](#4-local-testing)
5. [Database Architecture & Files](#5-database-architecture)

---

## 1. MongoDB Atlas Setup (100% Free Forever)
MongoDB Atlas ek permanent free cloud database deta hai jisme koi credit card nahi lagta:

1. Visit karein: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Free account banayein ya Google account se sign in karein.
3. **Create Cluster** par click karein aur **M0 Free (Shared Sandbox)** select karein.
4. **Security Setup**:
   - **Database Access**: Username (e.g. `marketlink_admin`) aur Password banayein. (Password yaad rakhein!)
   - **Network Access**: **Add IP Address** -> Select **"Allow Access from Anywhere"** (`0.0.0.0/0`) -> Confirm.
5. **Get Connection String**:
   - Click **Connect** -> Choose **"Drivers" (Node.js)**.
   - Connection string copy karein, jo is tarah hogi:
     ```text
     mongodb+srv://marketlink_admin:<password>@cluster0.abcde.mongodb.net/marketlink?retryWrites=true&w=majority
     ```
   - `<password>` ko apne set kiye hue real password se replace kar dein.

---

## 2. Vercel Deployment (Recommended)

MarketLink me Vercel ke liye serverless API routes (`/api/*`) aur `vercel.json` already configure hain.

### Option A: GitHub ke zariye Deploy karna (Easiest)
1. Project ko apne **GitHub** par push karein:
   ```bash
   git add .
   git commit -m "MarketLink with Vercel Serverless Backend & MongoDB Atlas"
   git push origin main
   ```
2. [Vercel.com](https://vercel.com) par login karein.
3. Click **"Add New..."** -> **"Project"**.
4. Apna GitHub repository **Import** karein.
5. **Environment Variables** section kholein aur add karein:
   - **Key**: `MONGODB_URI`
   - **Value**: Apni MongoDB Atlas connection string (e.g. `mongodb+srv://...`)
6. Click **"Deploy"**!
7. **Done!** Kuch hi seconds me aapki live website tayyar ho jayegi!
8. Website open karein aur footer me **"Backend & Database Status"** button click karke **"Seed MongoDB Database"** par click karein. Yeh saare demo markets, farmers, aur products cloud database me daal dega!

### Option B: Vercel CLI ke zariye Deploy karna (Direct Terminal se)
Terminal me run karein:
```bash
npx vercel
```
- First time login prompt aayega (browser me authorize karein).
- Questions me defaults (`Y`) accept karein.
- Environment variable add karein:
```bash
npx vercel env add MONGODB_URI
```
- Production deploy karein:
```bash
npx vercel --prod
```

---

## 3. Netlify Deployment

MarketLink me Netlify ke liye `netlify.toml` already included hai.

1. Project ko GitHub par push karein.
2. [Netlify.com](https://www.netlify.com) par login karein.
3. Click **"Add new site"** -> **"Import an existing project"** -> GitHub.
4. Repo select karein:
   - **Build command**: (Empty chhod dein ya `npm install`)
   - **Publish directory**: `.` (Root directory)
5. **Environment variables** me add karein:
   - `MONGODB_URI` = Apni MongoDB Atlas connection string
6. Click **"Deploy MarketLink"**!

---

## 4. Local Testing (Before Uploading)

Aap deployment se pehle apne computer par bhi pura backend test kar sakte hain:

1. Dependencies install karein (already installed):
   ```bash
   npm install
   ```
2. `.env` file banayein (ya `.env.example` ko copy karein):
   ```text
   MONGODB_URI=mongodb+srv://user:pass@cluster0.abcde.mongodb.net/marketlink?retryWrites=true&w=majority
   PORT=3000
   ```
3. Server start karein:
   ```bash
   npm start
   ```
4. Browser me open karein:
   - **Web App**: [http://localhost:3000](http://localhost:3000)
   - **Backend Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - **Verification Suite**: `node scripts/verify-all.js`

> 💡 **Notice**: Agar aapke paas abhi MongoDB Atlas connection string nahi hai, to bhi project bilkul bina kisi error ke local presentation / demo storage me 100% chalega!

---

## 5. Database Architecture & Included Files

Aapke project me dono databases ka full support diya gaya hai:

| File | Description |
| :--- | :--- |
| [`api/lib/mongodb.js`](api/lib/mongodb.js) | Vercel Serverless MongoDB Atlas connection manager with connection pooling |
| [`api/health.js`](api/health.js) | Health check endpoint verifying MongoDB Atlas connection status |
| [`api/seed.js`](api/seed.js) | 1-Click cloud database initialization & seeder |
| [`api/markets.js`](api/markets.js) | Markets CRUD API |
| [`api/products.js`](api/products.js) | Products & Stock update API |
| [`api/orders.js`](api/orders.js) | Pre-orders & Stock deduction API |
| [`api/farmers.js`](api/farmers.js) | Farmers & Stall management API |
| [`api/auth.js`](api/auth.js) | Authentication & Registration API |
| [`database/mysql-schema.sql`](database/mysql-schema.sql) | Complete MySQL schema with `CREATE TABLE` and sample `INSERT` statements (for university/academic report submission) |
| [`database/mongodb-seed.json`](database/mongodb-seed.json) | Exported JSON collection data for MongoDB Compass or Atlas import |
| [`vercel.json`](vercel.json) | Vercel Serverless Function & CORS configuration |
| [`netlify.toml`](netlify.toml) | Netlify Functions & redirect rules |
