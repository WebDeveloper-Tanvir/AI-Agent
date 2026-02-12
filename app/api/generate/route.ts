import { NextRequest, NextResponse } from 'next/server';
import { AIAgent } from '@/lib/agent';

export async function POST(request: NextRequest) {
  try {
    const { userIntent, existingCode } = await request.json();

    if (!userIntent) {
      return NextResponse.json(
        { error: 'User intent is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const agent = new AIAgent();
    const result = await agent.generateUI(userIntent, existingCode);

    return NextResponse.json({
      success: true,
      result,
      steps: agent.getSteps(),
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate UI' },
      { status: 500 }
    );
  }
}
