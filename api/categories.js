const { connectToDatabase } = require('./lib/mongodb');
const { handleCors } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();

        if (isConnected && db) {
            const collection = db.collection('categories');
            let categories = await collection.find({}).toArray();
            if (categories.length === 0) {
                const docs = seedData.DEMO_CATEGORIES.map(d => ({ ...d }));
                await collection.insertMany(docs);
                categories = docs;
            }
            return res.status(200).json(categories);
        }

        return res.status(200).json(seedData.DEMO_CATEGORIES);
    } catch (err) {
        console.error('Categories API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
