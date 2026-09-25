const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const { id, customer_id, farmer_id } = req.query;

        // GET: Orders
        if (req.method === 'GET') {
            if (isConnected && db) {
                const collection = db.collection('orders');
                const query = {};
                if (id) {
                    query.$or = [{ id: id }, { order_number: id }];
                }
                if (customer_id) query.customer_id = customer_id;
                if (farmer_id) query.farmer_id = farmer_id;

                let orders = await collection.find(query).sort({ created_at: -1 }).toArray();
                if (orders.length === 0 && Object.keys(query).length === 0) {
                    const docs = seedData.DEMO_ORDERS.map(d => ({ ...d }));
                    await collection.insertMany(docs);
                    orders = docs;
                }

                if (id) {
                    return orders.length > 0 ? res.status(200).json(orders[0]) : res.status(404).json({ error: 'Order not found' });
                }
                return res.status(200).json(orders);
            }

            // Fallback
            let result = seedData.DEMO_ORDERS;
            if (id) {
                const o = result.find(x => x.id === id || x.order_number === id);
                return o ? res.status(200).json(o) : res.status(404).json({ error: 'Order not found' });
            }
            if (customer_id) {
                result = result.filter(x => x.customer_id === customer_id);
            }
            if (farmer_id) {
                result = result.filter(x => x.farmer_id === farmer_id);
            }
            return res.status(200).json(result);
        }

        // POST: Create order
        if (req.method === 'POST') {
            const body = parseBody(req);
            const randSuffix = Math.floor(100 + Math.random() * 900);
            const orderData = {
                id: 'ord-' + Date.now(),
                order_number: 'ML-' + new Date().getFullYear() + '-' + randSuffix,
                status: 'Placed',
                created_at: new Date().toISOString(),
                ...body
            };

            if (isConnected && db) {
                // 1. Insert order
                await db.collection('orders').insertOne(orderData);

                // 2. Decrement product stocks
                if (orderData.items && Array.isArray(orderData.items)) {
                    for (const item of orderData.items) {
                        const qty = parseInt(item.quantity, 10) || 1;
                        const prod = await db.collection('products').findOne({ id: item.product_id });
                        if (prod) {
                            const newStock = Math.max(0, (prod.stock_quantity || 0) - qty);
                            const newStatus = newStock <= 0 ? 'sold_out' : 'available';
                            await db.collection('products').updateOne(
                                { id: item.product_id },
                                { $set: { stock_quantity: newStock, status: newStatus } }
                            );
                        }
                    }
                }
            }

            return res.status(201).json({ status: 'success', data: orderData });
        }

        // PATCH: Update order status
        if (req.method === 'PATCH') {
            const body = parseBody(req);
            const targetId = id || body.id || body.orderId;
            const newStatus = body.status || body.newStatus;

            if (!targetId || !newStatus) {
                return res.status(400).json({ error: 'Order ID and status required' });
            }

            if (isConnected && db) {
                await db.collection('orders').updateOne(
                    { $or: [{ id: targetId }, { order_number: targetId }] },
                    { $set: { status: newStatus, updated_at: new Date().toISOString() } }
                );
            }

            return res.status(200).json({ status: 'success', id: targetId, status: newStatus });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Orders API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
