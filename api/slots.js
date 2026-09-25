const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const { id, farmer_id } = req.query;

        // GET: Pickup Slots
        if (req.method === 'GET') {
            if (isConnected && db) {
                const query = farmer_id ? { farmer_id } : {};
                let slots = await db.collection('pickup_slots').find(query).toArray();
                if (slots.length === 0 && !farmer_id) {
                    const docs = seedData.DEMO_PICKUP_SLOTS.map(d => ({ ...d }));
                    await db.collection('pickup_slots').insertMany(docs);
                    slots = docs;
                }
                return res.status(200).json(slots);
            }

            let result = seedData.DEMO_PICKUP_SLOTS;
            if (farmer_id) result = result.filter(s => s.farmer_id === farmer_id);
            return res.status(200).json(result);
        }

        // POST / PUT: Save slot
        if (req.method === 'POST' || req.method === 'PUT') {
            const body = parseBody(req);
            const slotData = {
                ...body,
                updated_at: new Date().toISOString()
            };

            if (!slotData.id) {
                slotData.id = 'slot-' + Date.now();
                slotData.created_at = new Date().toISOString();
            }

            if (isConnected && db) {
                await db.collection('pickup_slots').updateOne(
                    { id: slotData.id },
                    { $set: slotData },
                    { upsert: true }
                );
            }

            return res.status(200).json({ status: 'success', data: slotData });
        }

        // DELETE: Delete slot
        if (req.method === 'DELETE') {
            const targetId = id || (parseBody(req)).id;
            if (!targetId) return res.status(400).json({ error: 'Slot ID required' });

            if (isConnected && db) {
                await db.collection('pickup_slots').deleteOne({ id: targetId });
            }

            return res.status(200).json({ status: 'success', message: 'Slot deleted', id: targetId });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Slots API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
