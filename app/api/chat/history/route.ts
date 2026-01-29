import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;

    if (!token) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    let userId: string | null = null;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (err) {
      console.warn('Chat history: invalid token', err);
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    await connectDB();

    const conversation = await Conversation.findOne({ user: userId }).lean();

    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    const messages = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error: any) {
    console.error('Chat history error:', error);
    // In case of any error, don't block the UI; just return empty history
    return NextResponse.json(
      { messages: [], error: error.message || 'Failed to load history' },
      { status: 200 }
    );
  }
}


