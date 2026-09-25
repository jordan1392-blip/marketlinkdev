// ====================================================================
// MarketLink – eGreen Basket: MongoDB Atlas Connection (Vercel Serverless)
// Caches MongoDB client promise across serverless function invocations
// ====================================================================

require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'marketlink';

let cachedClient = null;
let cachedDb = null;

if (!uri) {
    console.warn('⚠️ Notice: MONGODB_URI is not set in environment variables. Falling back to local/demo mode.');
}

async function connectToDatabase() {
    if (!uri) {
        return { client: null, db: null, isConnected: false, warning: 'MONGODB_URI environment variable is missing.' };
    }

    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb, isConnected: true };
    }

    let client;
    let clientPromise;

    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable to preserve connection across HMR
        if (!global._mongoClientPromise) {
            client = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                },
                maxPoolSize: 10,
                connectTimeoutMS: 8000,
                serverSelectionTimeoutMS: 8000
            });
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        // In production / Vercel Serverless environment
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            maxPoolSize: 10,
            connectTimeoutMS: 8000,
            serverSelectionTimeoutMS: 8000
        });
        clientPromise = client.connect();
    }

    try {
        const connectedClient = await clientPromise;
        const db = connectedClient.db(dbName);
        cachedClient = connectedClient;
        cachedDb = db;
        return { client: connectedClient, db, isConnected: true };
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
        return { client: null, db: null, isConnected: false, error: error.message };
    }
}

module.exports = { connectToDatabase };
