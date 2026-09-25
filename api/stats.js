const { connectToDatabase } = require('./lib/mongodb');
const { handleCors } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();

        if (isConnected && db) {
            const [customers, farmers, markets, products, orders] = await Promise.all([
                db.collection('customers').countDocuments(),
                db.collection('farmers').countDocuments(),
                db.collection('markets').countDocuments(),
                db.collection('products').countDocuments(),
                db.collection('orders').find({}).toArray()
            ]);

            const totalRevenue = orders.reduce((sum, ord) => {
                if (ord.status !== 'Cancelled') return sum + (Number(ord.total_amount) || 0);
                return sum;
            }, 0);

            return res.status(200).json({
                totalCustomers: customers,
                totalFarmers: farmers,
                totalMarkets: markets,
                totalProducts: products,
                totalOrders: orders.length,
                totalRevenue,
                pendingOrders: orders.filter(o => o.status === 'Placed').length,
                completedOrders: orders.filter(o => o.status === 'Completed').length,
                database: 'MongoDB Atlas'
            });
        }

        // Fallback calculations
        const orders = seedData.DEMO_ORDERS;
        const totalRevenue = orders.reduce((sum, ord) => {
            if (ord.status !== 'Cancelled') return sum + (Number(ord.total_amount) || 0);
            return sum;
        }, 0);

        return res.status(200).json({
            totalCustomers: seedData.DEMO_CUSTOMERS.length,
            totalFarmers: seedData.DEMO_FARMERS.length,
            totalMarkets: seedData.DEMO_MARKETS.length,
            totalProducts: seedData.DEMO_PRODUCTS.length,
            totalOrders: orders.length,
            totalRevenue,
            pendingOrders: orders.filter(o => o.status === 'Placed').length,
            completedOrders: orders.filter(o => o.status === 'Completed').length,
            database: 'Local Demo Data'
        });
    } catch (err) {
        console.error('Stats API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
