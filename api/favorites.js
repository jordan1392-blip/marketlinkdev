const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const { customer_id } = req.query;

        // GET: Favorites
        if (req.method === 'GET') {
            if (isConnected && db) {
                const query = customer_id ? { customer_id } : {};
                const favs = await db.collection('favorites').find(query).toArray();
                return res.status(200).json(favs);
            }
            return res.status(200).json([]);
        }

        // POST: Toggle favorite
        if (req.method === 'POST') {
            const body = parseBody(req);
            const { customer_id: cid, item_type, item_id } = body;

            if (!cid || !item_type || !item_id) {
                return res.status(400).json({ error: 'customer_id, item_type, and item_id required' });
            }

            let isSaved = false;
            if (isConnected && db) {
                const collection = db.collection('favorites');
                const existing = await collection.findOne({ customer_id: cid, item_type, item_id });

                if (existing) {
                    await collection.deleteOne({ _id: existing._id });
                    isSaved = false;
                } else {
                    await collection.insertOne({
                        id: 'fav-' + Date.now(),
                        customer_id: cid,
                        item_type,
                        item_id,
                        created_at: new Date().toISOString()
                    });
                    isSaved = true;
                }
            }

            return res.status(200).json({ status: 'success', isSaved });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Favorites API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
