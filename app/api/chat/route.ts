import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, Message } from '@/lib/gemini';

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

    // Generate AI response
    const aiResponse = await generateAIResponse(validMessages);

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

