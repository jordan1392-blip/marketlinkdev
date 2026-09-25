const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const { id } = req.query;

        // GET: Customers
        if (req.method === 'GET') {
            if (isConnected && db) {
                let customers = await db.collection('customers').find({}).toArray();
                if (customers.length === 0) {
                    const docs = seedData.DEMO_CUSTOMERS.map(d => ({ ...d }));
                    await db.collection('customers').insertMany(docs);
                    customers = docs;
                }
                if (id) {
                    const cust = customers.find(c => c.id === id);
                    return cust ? res.status(200).json(cust) : res.status(404).json({ error: 'Customer not found' });
                }
                return res.status(200).json(customers);
            }

            if (id) {
                const c = seedData.DEMO_CUSTOMERS.find(x => x.id === id);
                return c ? res.status(200).json(c) : res.status(404).json({ error: 'Customer not found' });
            }
            return res.status(200).json(seedData.DEMO_CUSTOMERS);
        }

        // PATCH: Update status
        if (req.method === 'PATCH') {
            const body = parseBody(req);
            const targetId = id || body.id;
            const status = body.status;

            if (!targetId || !status) {
                return res.status(400).json({ error: 'Customer ID and status required' });
            }

            if (isConnected && db) {
                await db.collection('customers').updateOne(
                    { id: targetId },
                    { $set: { status, updated_at: new Date().toISOString() } }
                );
            }

            return res.status(200).json({ status: 'success', message: `Customer status updated to ${status}` });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Customers API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
