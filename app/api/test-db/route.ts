import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Test connection
    await connectDB();
    
    // Count users
    const userCount = await User.countDocuments();
    
    // Get all users (without passwords)
    const users = await User.find({}).select('-password').limit(10);
    
    // Get database name
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    
    // Get connection host
    const host = mongoose.connection.host || 'unknown';
    const port = mongoose.connection.port || 'unknown';
    
    // Get connection state
    const connectionState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    // Check if connection string is set
    const hasConnectionString = !!process.env.MONGODB_URI;
    const isAtlas = process.env.MONGODB_URI?.includes('mongodb.net') || false;
    const isLocal = process.env.MONGODB_URI?.includes('localhost') || process.env.MONGODB_URI?.includes('127.0.0.1') || false;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      database: dbName,
      host: host,
      port: port,
      connectionType: isAtlas ? 'MongoDB Atlas (Cloud)' : isLocal ? 'Local MongoDB' : 'Unknown',
      connectionState: states[connectionState] || 'unknown',
      userCount: userCount,
      users: users,
      hasConnectionString: hasConnectionString,
      connectionStringPreview: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@').substring(0, 100) + '...' : 
        'Not set in .env.local'
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database connection failed',
        hasConnectionString: !!process.env.MONGODB_URI,
        connectionStringPreview: process.env.MONGODB_URI ? 
          process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@').substring(0, 100) + '...' : 
          'Not set in .env.local',
        troubleshooting: [
          '1. Check if MONGODB_URI is set in .env.local',
          '2. Verify the connection string format',
          '3. For Atlas: Ensure IP is whitelisted and credentials are correct',
          '4. For Local: Ensure MongoDB is running on localhost:27017'
        ]
      },
      { status: 500 }
    );
  }
}

