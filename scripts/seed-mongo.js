// ====================================================================
// MarketLink – eGreen Basket: CLI MongoDB Seed Script
// Populates MongoDB Atlas with realistic demo markets, farmers, products, etc.
// Usage: npm run seed
// ====================================================================

require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const seedData = require('../api/lib/seed-data');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'marketlink';

if (!uri) {
    console.error('\n❌ ERROR: MONGODB_URI is not set!');
    console.error('Please set MONGODB_URI in your .env file or environment variables.');
    console.error('Example: MONGODB_URI=mongodb+srv://user:pass@cluster0.abcde.mongodb.net/marketlink?retryWrites=true&w=majority\n');
    process.exit(1);
}

async function runSeed() {
    console.log(`\n🌿 Connecting to MongoDB Atlas (${dbName})...`);
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        console.log('✅ Connected successfully to MongoDB Atlas!\n');

        const collections = [
            { name: 'categories', data: seedData.DEMO_CATEGORIES },
            { name: 'markets', data: seedData.DEMO_MARKETS },
            { name: 'farmers', data: seedData.DEMO_FARMERS },
            { name: 'products', data: seedData.DEMO_PRODUCTS },
            { name: 'customers', data: seedData.DEMO_CUSTOMERS },
            { name: 'orders', data: seedData.DEMO_ORDERS },
            { name: 'reviews', data: seedData.DEMO_REVIEWS },
            { name: 'pickup_slots', data: seedData.DEMO_PICKUP_SLOTS }
        ];

        for (const item of collections) {
            const col = db.collection(item.name);
            await col.deleteMany({});
            const docs = item.data.map(d => ({ ...d }));
            if (docs.length > 0) {
                await col.insertMany(docs);
                console.log(`  📦 Collection '${item.name}': Seeded ${docs.length} documents.`);
            }
        }

        console.log('\n🎉 All MongoDB collections seeded successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await client.close();
        console.log('Connection closed.\n');
    }
}

runSeed();
