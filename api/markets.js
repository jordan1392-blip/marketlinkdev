const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const id = req.query.id;

        // GET: All markets or single market
        if (req.method === 'GET') {
            if (isConnected && db) {
                const collection = db.collection('markets');
                if (id) {
                    const market = await collection.findOne({ id: id });
                    if (!market) return res.status(404).json({ error: 'Market not found' });
                    return res.status(200).json(market);
                }
                let markets = await collection.find({}).toArray();
                if (markets.length === 0) {
                    // Auto-seed if empty
                    const docs = seedData.DEMO_MARKETS.map(d => ({ ...d }));
                    await collection.insertMany(docs);
                    markets = docs;
                }
                return res.status(200).json(markets);
            }

            // Fallback
            if (id) {
                const market = seedData.DEMO_MARKETS.find(m => m.id === id);
                return market ? res.status(200).json(market) : res.status(404).json({ error: 'Market not found' });
            }
            return res.status(200).json(seedData.DEMO_MARKETS);
        }

        // POST / PUT: Create or update market
        if (req.method === 'POST' || req.method === 'PUT') {
            const body = parseBody(req);
            const marketData = {
                ...body,
                updated_at: new Date().toISOString()
            };

            if (!marketData.id) {
                marketData.id = 'mkt-' + Date.now();
                marketData.farmer_count = marketData.farmer_count || 0;
                marketData.created_at = new Date().toISOString();
            }

            if (isConnected && db) {
                const collection = db.collection('markets');
                await collection.updateOne(
                    { id: marketData.id },
                    { $set: marketData },
                    { upsert: true }
                );
            }

            return res.status(200).json({ status: 'success', data: marketData });
        }

        // DELETE: Remove market
        if (req.method === 'DELETE') {
            const targetId = id || (parseBody(req)).id;
            if (!targetId) return res.status(400).json({ error: 'Market ID required' });

            if (isConnected && db) {
                await db.collection('markets').deleteOne({ id: targetId });
            }

            return res.status(200).json({ status: 'success', message: 'Market deleted', id: targetId });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Markets API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
