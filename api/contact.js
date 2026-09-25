const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = parseBody(req);
        const inquiry = {
            id: 'inq-' + Date.now(),
            name: body.name || 'Anonymous',
            email: body.email || '',
            subject: body.subject || 'General Inquiry',
            message: body.message || '',
            created_at: new Date().toISOString()
        };

        const { db, isConnected } = await connectToDatabase();
        if (isConnected && db) {
            await db.collection('inquiries').insertOne(inquiry);
        }

        return res.status(200).json({
            status: 'success',
            message: 'Your inquiry has been received successfully! Our team will contact you shortly.',
            data: inquiry
        });
    } catch (err) {
        console.error('Contact API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
