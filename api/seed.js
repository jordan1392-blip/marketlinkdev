const { connectToDatabase } = require('./lib/mongodb');
const { handleCors } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();

        if (!isConnected || !db) {
            return res.status(200).json({
                status: 'skipped',
                message: 'MongoDB is not connected. Please provide MONGODB_URI in environment variables to seed cloud database.',
                connected: false
            });
        }

        const force = req.query.force === 'true' || (req.body && req.body.force === true);

        const results = {};

        const collectionsToSeed = [
            { name: 'categories', data: seedData.DEMO_CATEGORIES },
            { name: 'markets', data: seedData.DEMO_MARKETS },
            { name: 'farmers', data: seedData.DEMO_FARMERS },
            { name: 'products', data: seedData.DEMO_PRODUCTS },
            { name: 'customers', data: seedData.DEMO_CUSTOMERS },
            { name: 'orders', data: seedData.DEMO_ORDERS },
            { name: 'reviews', data: seedData.DEMO_REVIEWS },
            { name: 'pickup_slots', data: seedData.DEMO_PICKUP_SLOTS }
        ];

        for (const item of collectionsToSeed) {
            const collection = db.collection(item.name);
            const count = await collection.countDocuments();

            if (count === 0 || force) {
                if (force && count > 0) {
                    await collection.deleteMany({});
                }
                if (item.data && item.data.length > 0) {
                    // Clone data to avoid altering original objects with _id
                    const docs = item.data.map(doc => ({ ...doc }));
                    await collection.insertMany(docs);
                    results[item.name] = `Seeded ${docs.length} documents`;
                } else {
                    results[item.name] = 'No seed data';
                }
            } else {
                results[item.name] = `Already contains ${count} documents (skipped)`;
            }
        }

        return res.status(200).json({
            status: 'success',
            message: 'MongoDB database initialized successfully!',
            results
        });
    } catch (err) {
        console.error('Seed error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to seed database: ' + err.message
        });
    }
};
