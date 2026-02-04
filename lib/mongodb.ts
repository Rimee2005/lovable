import mongoose from 'mongoose';

// ✅ Read env
const uri = process.env.MONGODB_URI;

// ✅ Runtime check
if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// ✅ Now TypeScript KNOWS this is a string
const MONGODB_URI: string = uri;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // ✅ Reuse existing healthy connection
  if (cached.conn) {
    const state = mongoose.connection.readyState;

    if (state === 1) {
      try {
        if (!mongoose.connection.db) {
          throw new Error('MongoDB database instance not available');
        }

        await mongoose.connection.db.admin().ping({ maxTimeMS: 2000 });
        console.log('✅ Using existing MongoDB connection');
        return cached.conn;
      } catch (error) {
        console.warn('⚠️ Existing connection stale, reconnecting...', error);
        cached.conn = null;
        cached.promise = null;
        try {
          await mongoose.disconnect();
        } catch {}
      }
    } else {
      cached.conn = null;
      cached.promise = null;
      if (state !== 0) {
        try {
          await mongoose.disconnect();
        } catch {}
      }
    }
  }

  // ✅ Create new connection
  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    console.log('🔄 Connecting to MongoDB...');
    console.log(
      '📍 Database:',
      MONGODB_URI.split('/').pop()?.split('?')[0] ?? 'default'
    );

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then(async (mongooseInstance) => {
        console.log('✅ MongoDB connected');

        if (!mongooseInstance.connection.db) {
          throw new Error('MongoDB db not available after connect');
        }

        console.log(
          '📊 Database:',
          mongooseInstance.connection.db.databaseName
        );

        try {
          await mongooseInstance.connection.db.admin().ping({
            maxTimeMS: 3000,
          });
          console.log('✅ MongoDB ping successful');
        } catch (pingError) {
          console.error('❌ MongoDB ping failed:', pingError);
        }

        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// 🔁 Reset connection
export async function resetConnection() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch {
    // ignore
  } finally {
    cached.conn = null;
    cached.promise = null;
  }
}

export default connectDB;
