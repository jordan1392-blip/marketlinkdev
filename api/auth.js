const { connectToDatabase } = require('./lib/mongodb');
const { handleCors, parseBody } = require('./lib/handler');
const seedData = require('./lib/seed-data');

module.exports = async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const { db, isConnected } = await connectToDatabase();
        const action = req.query.action || (req.body ? req.body.action : 'login');
        const body = parseBody(req);

        // 1. LOGIN
        if (action === 'login' || req.method === 'POST') {
            const email = (body.email || '').trim().toLowerCase();
            const password = body.password || '';

            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required' });
            }

            // Check Admin
            if (email === 'admin@marketlink.com' || email.includes('admin')) {
                const adminUser = {
                    id: seedData.DEMO_ADMIN.id,
                    name: seedData.DEMO_ADMIN.name,
                    email: seedData.DEMO_ADMIN.email,
                    role: 'admin',
                    phone: seedData.DEMO_ADMIN.phone,
                    address: seedData.DEMO_ADMIN.address
                };
                return res.status(200).json({
                    success: true,
                    user: adminUser,
                    redirect: 'admin/dashboard.html'
                });
            }

            // Check Farmer in MongoDB / seed
            let farmer = null;
            if (isConnected && db) {
                farmer = await db.collection('farmers').findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
            } else {
                farmer = seedData.DEMO_FARMERS.find(f => f.email && f.email.toLowerCase() === email);
            }

            if (farmer) {
                const farmerUser = {
                    id: farmer.id,
                    user_id: farmer.user_id || farmer.id,
                    name: farmer.contact_person || farmer.farmer_name,
                    stall_name: farmer.stall_name,
                    email: farmer.email,
                    phone: farmer.phone,
                    address: farmer.address,
                    market_id: farmer.market_id,
                    role: 'farmer'
                };
                return res.status(200).json({
                    success: true,
                    user: farmerUser,
                    redirect: 'farmer/dashboard.html'
                });
            }

            // Check Customer in MongoDB / seed
            let customer = null;
            if (isConnected && db) {
                customer = await db.collection('customers').findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
            } else {
                customer = seedData.DEMO_CUSTOMERS.find(c => c.email && c.email.toLowerCase() === email);
            }

            if (customer) {
                if (customer.status === 'suspended') {
                    return res.status(403).json({ success: false, message: 'This account has been suspended. Please contact support.' });
                }
                const customerUser = {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    role: 'customer'
                };
                return res.status(200).json({
                    success: true,
                    user: customerUser,
                    redirect: 'customer/dashboard.html'
                });
            }

            // Auto-provision new customer for demo convenience
            const newCustomer = {
                id: 'usr-customer-' + Date.now(),
                name: body.name || email.split('@')[0].replace('.', ' ').toUpperCase(),
                email: email,
                phone: body.phone || '+92 300 0000000',
                address: body.address || 'Islamabad, Pakistan',
                role: 'customer',
                status: 'active',
                created_at: new Date().toISOString()
            };

            if (isConnected && db) {
                await db.collection('customers').insertOne(newCustomer);
            }

            return res.status(200).json({
                success: true,
                user: newCustomer,
                redirect: 'customer/dashboard.html'
            });
        }

        // 2. REGISTER
        if (action === 'register') {
            const role = body.role || 'customer';
            const email = (body.email || '').trim().toLowerCase();

            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required' });
            }

            if (role === 'farmer') {
                const newFarmer = {
                    id: 'fm-' + Date.now(),
                    stall_name: body.stall_name || body.name + "'s Farm",
                    farmer_name: body.name,
                    contact_person: body.name,
                    phone: body.phone || '',
                    email: email,
                    address: body.address || '',
                    market_id: body.market_id || 'mkt-isb-f6',
                    operating_days: 'Friday, Saturday',
                    pickup_start: '09:00',
                    pickup_end: '17:00',
                    rating: 5.0,
                    reviews_count: 0,
                    status: 'pending',
                    bio: body.bio || 'New organic farmer on MarketLink.',
                    created_at: new Date().toISOString()
                };

                if (isConnected && db) {
                    await db.collection('farmers').insertOne(newFarmer);
                }

                return res.status(201).json({
                    success: true,
                    message: 'Farmer registered successfully! Waiting for admin approval.',
                    user: { ...newFarmer, role: 'farmer' }
                });
            } else {
                const newCust = {
                    id: 'usr-customer-' + Date.now(),
                    name: body.name,
                    email: email,
                    phone: body.phone || '',
                    address: body.address || '',
                    role: 'customer',
                    status: 'active',
                    created_at: new Date().toISOString()
                };

                if (isConnected && db) {
                    await db.collection('customers').insertOne(newCust);
                }

                return res.status(201).json({
                    success: true,
                    message: 'Registration successful!',
                    user: newCust
                });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Auth API Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
