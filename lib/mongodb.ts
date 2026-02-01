import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Check if existing connection is healthy
  if (cached.conn) {
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      // Connection is connected, verify it's actually working with a quick ping
      try {
        await mongoose.connection.db.admin().ping({ maxTimeMS: 2000 });
        console.log('✅ Using existing MongoDB connection');
        return cached.conn;
      } catch (pingError) {
        console.warn('⚠️ Existing connection failed ping, reconnecting...', pingError);
        // Connection is stale, reset it
        cached.conn = null;
        cached.promise = null;
        await mongoose.disconnect();
      }
    } else {
      // Connection is not in a good state, reset it
      console.warn('⚠️ Existing connection is not ready (state:', state, '), reconnecting...');
      cached.conn = null;
      cached.promise = null;
      if (state !== 0) {
        try {
          await mongoose.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Avoid 30s hangs when Atlas is temporarily unreachable (your logs show TLS/SSL selection issues)
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Some networks have IPv6/TLS quirks; prefer IPv4
      family: 4,
    };

    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 Database:', MONGODB_URI.split('/').pop()?.split('?')[0] || 'default');

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      console.log('✅ MongoDB connected successfully');
      console.log('📊 Database name:', mongoose.connection.db?.databaseName);
      
      // Verify connection with a ping
      try {
        await mongoose.connection.db.admin().ping({ maxTimeMS: 3000 });
        console.log('✅ MongoDB connection verified');
      } catch (pingError) {
        console.error('❌ MongoDB connection ping failed:', pingError);
        // Don't throw, but log the issue - queries will fail if connection is bad
      }
      
      return mongoose;
    }).catch((error) => {
      // Reset promise on error so we can retry
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

// Function to reset connection if it becomes stale
export async function resetConnection() {
  if (cached.conn) {
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
  cached.conn = null;
  cached.promise = null;
}

export default connectDB;

