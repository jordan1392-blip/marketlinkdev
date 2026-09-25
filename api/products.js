const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const { id, farmer_id, category_id, search } = req.query;

        // GET: Products
        if (req.method === 'GET') {
            if (isConnected && db) {
                const collection = db.collection('products');
                const query = {};
                if (id) query.id = id;
                if (farmer_id) query.farmer_id = farmer_id;
                if (category_id) query.category_id = category_id;
                if (search) {
                    query.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ];
                }

                let products = await collection.find(query).toArray();
                if (products.length === 0 && Object.keys(query).length === 0) {
                    const docs = seedData.DEMO_PRODUCTS.map(d => ({ ...d }));
                    await collection.insertMany(docs);
                    products = docs;
                }

                if (id) {
                    return products.length > 0 ? res.status(200).json(products[0]) : res.status(404).json({ error: 'Product not found' });
                }
                return res.status(200).json(products);
            }

            // Fallback
            let result = seedData.DEMO_PRODUCTS;
            if (id) {
                const p = result.find(x => x.id === id);
                return p ? res.status(200).json(p) : res.status(404).json({ error: 'Product not found' });
            }
            if (farmer_id) {
                result = result.filter(x => x.farmer_id === farmer_id);
            }
            if (category_id) {
                result = result.filter(x => x.category_id === category_id);
            }
            if (search) {
                const s = search.toLowerCase();
                result = result.filter(x => (x.name && x.name.toLowerCase().includes(s)) || (x.description && x.description.toLowerCase().includes(s)));
            }
            return res.status(200).json(result);
        }

        // POST / PUT: Create or update product
        if (req.method === 'POST' || req.method === 'PUT') {
            const body = parseBody(req);
            const productData = {
                ...body,
                updated_at: new Date().toISOString()
            };

            if (!productData.id) {
                productData.id = 'prod-' + Date.now();
                productData.created_at = new Date().toISOString();
                productData.status = productData.status || 'available';
            }

            if (isConnected && db) {
                await db.collection('products').updateOne(
                    { id: productData.id },
                    { $set: productData },
                    { upsert: true }
                );
            }

            return res.status(200).json({ status: 'success', data: productData });
        }

        // PATCH: Update stock
        if (req.method === 'PATCH') {
            const body = parseBody(req);
            const targetId = id || body.id;
            const newStock = parseInt(body.stock_quantity !== undefined ? body.stock_quantity : body.newStock, 10);

            if (!targetId || isNaN(newStock)) {
                return res.status(400).json({ error: 'Valid product ID and stock_quantity required' });
            }

            const status = newStock <= 0 ? 'sold_out' : 'available';

            if (isConnected && db) {
                await db.collection('products').updateOne(
                    { id: targetId },
                    { $set: { stock_quantity: Math.max(0, newStock), status, updated_at: new Date().toISOString() } }
                );
            }

            return res.status(200).json({ status: 'success', id: targetId, stock_quantity: Math.max(0, newStock), productStatus: status });
        }

        // DELETE: Delete product
        if (req.method === 'DELETE') {
            const targetId = id || (parseBody(req)).id;
            if (!targetId) return res.status(400).json({ error: 'Product ID required' });

            if (isConnected && db) {
                await db.collection('products').deleteOne({ id: targetId });
            }

            return res.status(200).json({ status: 'success', message: 'Product deleted', id: targetId });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Products API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
