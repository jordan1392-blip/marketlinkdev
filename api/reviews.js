const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const { id, farmer_id, product_id } = req.query;

        // GET: Reviews
        if (req.method === 'GET') {
            if (isConnected && db) {
                const query = {};
                if (farmer_id) query.farmer_id = farmer_id;
                if (product_id) query.product_id = product_id;

                let reviews = await db.collection('reviews').find(query).toArray();
                if (reviews.length === 0 && Object.keys(query).length === 0) {
                    const docs = seedData.DEMO_REVIEWS.map(d => ({ ...d }));
                    await db.collection('reviews').insertMany(docs);
                    reviews = docs;
                }
                return res.status(200).json(reviews);
            }

            let result = seedData.DEMO_REVIEWS;
            if (farmer_id) result = result.filter(r => r.farmer_id === farmer_id);
            if (product_id) result = result.filter(r => r.product_id === product_id);
            return res.status(200).json(result);
        }

        // POST: Add review
        if (req.method === 'POST') {
            const body = parseBody(req);
            const reviewData = {
                id: 'rev-' + Date.now(),
                created_at: new Date().toISOString().split('T')[0],
                status: 'approved',
                ...body
            };

            if (isConnected && db) {
                await db.collection('reviews').insertOne(reviewData);
            }

            return res.status(201).json({ status: 'success', data: reviewData });
        }

        // DELETE: Delete review
        if (req.method === 'DELETE') {
            const targetId = id || (parseBody(req)).id;
            if (!targetId) return res.status(400).json({ error: 'Review ID required' });

            if (isConnected && db) {
                await db.collection('reviews').deleteOne({ id: targetId });
            }

            return res.status(200).json({ status: 'success', message: 'Review deleted', id: targetId });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Reviews API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
