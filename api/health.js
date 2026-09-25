const { connectToDatabase } = require('./lib/mongodb');
const { handleCors } = require('./lib/handler');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected, error } = await connectToDatabase();

        if (!isConnected || !db) {
            return res.status(200).json({
                status: 'warning',
                message: 'MongoDB is not connected yet. Add MONGODB_URI to your Vercel or Netlify environment variables.',
                database: 'Fallback Demo Data',
                connected: false,
                error: error || 'MONGODB_URI missing',
                timestamp: new Date().toISOString()
            });
        }

        // Test ping to verify active MongoDB connection
        await db.command({ ping: 1 });
        const collections = await db.listCollections().toArray();

        return res.status(200).json({
            status: 'success',
            message: 'MarketLink Vercel Backend is healthy and connected to MongoDB Atlas!',
            database: 'MongoDB Atlas',
            connected: true,
            collections: collections.map(c => c.name),
            timestamp: new Date().toISOString(),
            currency: 'PKR'
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Database check failed: ' + err.message,
            connected: false
        });
    }
};
