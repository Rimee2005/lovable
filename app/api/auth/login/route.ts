import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB, { resetConnection } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database with timeout
    try {
      const connectPromise = connectDB();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout. Please try again in a moment.')), 8000)
      );
      await Promise.race([connectPromise, timeoutPromise]);
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          error: dbError.message?.includes('timeout') 
            ? 'Database is temporarily unavailable. Please try again in a moment.'
            : 'Unable to connect to database. Please check your connection and try again.'
        },
        { status: 503 }
      );
    }

    // Find user with timeout
    let user;
    try {
      const findPromise = User.findOne({ email: email.toLowerCase() });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );
      user = await Promise.race([findPromise, timeoutPromise]);
    } catch (queryError: any) {
      console.error('Database query error:', queryError);
      // Reset connection if query fails - it might be stale
      try {
        const mongoose = await import('mongoose');
        if (mongoose.default.connection.readyState !== 0) {
          console.warn('Resetting MongoDB connection due to query failure');
          cached.conn = null;
          cached.promise = null;
        }
      } catch {
        // Ignore reset errors
      }
      
      return NextResponse.json(
        { 
          error: queryError.message?.includes('timeout') 
            ? 'Database is taking too long to respond. Please try again in a moment.'
            : 'Database query failed. Please try again.'
        },
        { status: 503 }
      );
    }
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}

