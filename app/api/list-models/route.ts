import { NextResponse } from 'next/server';
import { listAvailableModels } from '@/lib/list-models';

export async function GET() {
  try {
    const models = await listAvailableModels();
    return NextResponse.json({ models });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list models' },
      { status: 500 }
    );
  }
}

