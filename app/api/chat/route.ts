import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { generateAIResponse, Message } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Validate message format
    const validMessages: Message[] = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'ai',
      content: String(msg.content || ''),
    }));

    // Ensure last message is from user
    if (validMessages.length === 0 || validMessages[validMessages.length - 1].role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    // Determine authenticated user (if any)
    let userId: string | null = null;
    try {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.replace('Bearer ', '')
        : null;

      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      }
    } catch (authError) {
      // If token is invalid, treat as anonymous but don't block the request
      console.warn('Chat API: JWT verification failed', authError);
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(validMessages);

    // Persist conversation if user is authenticated
    if (userId) {
      try {
        await connectDB();
        const lastMessage = validMessages[validMessages.length - 1];

        await Conversation.findOneAndUpdate(
          { user: userId },
          {
            $push: {
              messages: {
                $each: [
                  {
                    role: 'user',
                    content: lastMessage.content,
                    createdAt: new Date(),
                  },
                  {
                    role: 'ai',
                    content: aiResponse,
                    createdAt: new Date(),
                  },
                ],
              },
            },
          },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        console.error('Failed to persist conversation:', dbError);
        // Do not fail the whole request if persistence fails
      }
    }

    return NextResponse.json({ 
      message: aiResponse 
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}

