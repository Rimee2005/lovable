import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Connect to database with timeout
    try {
      const connectPromise = connectDB();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), 8000)
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

    console.log('📝 Attempting to create user:', email.toLowerCase());

    // Check if user already exists with timeout
    let existingUser;
    try {
      const findPromise = User.findOne({ email: email.toLowerCase() });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );
      existingUser = await Promise.race([findPromise, timeoutPromise]);
    } catch (queryError: any) {
      console.error('Database query error:', queryError);
      return NextResponse.json(
        { error: 'Database query failed. Please try again.' },
        { status: 503 }
      );
    }
    if (existingUser) {
      console.log('⚠️ User already exists:', email.toLowerCase());
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with timeout
    let user;
    try {
      const createPromise = User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || '',
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );
      user = await Promise.race([createPromise, timeoutPromise]);
    } catch (createError: any) {
      console.error('User creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create user. Please try again.' },
        { status: 503 }
      );
    }

    // Get database name from mongoose connection
    const mongoose = await import('mongoose');
    const dbName = mongoose.default.connection.db?.databaseName || 'unknown';
    
    console.log('✅ User created successfully:', {
      id: user._id,
      email: user.email,
      database: dbName
    });

    // Return user data (without password)
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}

