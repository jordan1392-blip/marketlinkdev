const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const { id, market_id, email } = req.query;

        // GET: Farmers
        if (req.method === 'GET') {
            if (isConnected && db) {
                const collection = db.collection('farmers');
                const query = {};
                if (id) query.id = id;
                if (market_id) query.market_id = market_id;
                if (email) query.email = { $regex: new RegExp(`^${email}$`, 'i') };

                let farmers = await collection.find(query).toArray();
                if (farmers.length === 0 && Object.keys(query).length === 0) {
                    const docs = seedData.DEMO_FARMERS.map(d => ({ ...d }));
                    await collection.insertMany(docs);
                    farmers = docs;
                }

                if (id || email) {
                    return farmers.length > 0 ? res.status(200).json(farmers[0]) : res.status(404).json({ error: 'Farmer not found' });
                }
                return res.status(200).json(farmers);
            }

            // Fallback
            let result = seedData.DEMO_FARMERS;
            if (id) {
                const f = result.find(x => x.id === id);
                return f ? res.status(200).json(f) : res.status(404).json({ error: 'Farmer not found' });
            }
            if (market_id) {
                result = result.filter(x => x.market_id === market_id);
            }
            if (email) {
                const f = result.find(x => x.email && x.email.toLowerCase() === email.toLowerCase());
                return f ? res.status(200).json(f) : res.status(404).json({ error: 'Farmer not found' });
            }
            return res.status(200).json(result);
        }

        // POST / PUT: Create or update farmer
        if (req.method === 'POST' || req.method === 'PUT') {
            const body = parseBody(req);
            const farmerData = {
                ...body,
                updated_at: new Date().toISOString()
            };

            if (!farmerData.id) {
                farmerData.id = 'fm-' + Date.now();
                farmerData.rating = 5.0;
                farmerData.reviews_count = 0;
                farmerData.status = farmerData.status || 'approved';
                farmerData.created_at = new Date().toISOString();
            }

            if (isConnected && db) {
                await db.collection('farmers').updateOne(
                    { id: farmerData.id },
                    { $set: farmerData },
                    { upsert: true }
                );
            }

            return res.status(200).json({ status: 'success', data: farmerData });
        }

        // PATCH: Update status
        if (req.method === 'PATCH') {
            const body = parseBody(req);
            const targetId = id || body.id;
            const status = body.status;

            if (!targetId || !status) {
                return res.status(400).json({ error: 'Farmer ID and status required' });
            }

            if (isConnected && db) {
                await db.collection('farmers').updateOne(
                    { id: targetId },
                    { $set: { status: status, updated_at: new Date().toISOString() } }
                );
            }

            return res.status(200).json({ status: 'success', message: `Farmer status updated to ${status}` });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Farmers API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
