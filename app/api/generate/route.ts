import { NextRequest, NextResponse } from 'next/server';
import { AIAgent } from '@lib/agent';

// app/api/generate/route.ts
export async function POST(req: Request) {
  const { prompt, currentCode } = await req.json();
  
  // Call your Railway FastAPI backend
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://your-app-name.up.railway.app';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        current_code: currentCode || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json({
      code: data.code,
      explanation: data.explanation,
      plan: data.plan,
    });
  } catch (error) {
    console.error('Backend integration error:', error);
    return Response.json(
      { error: 'Failed to generate UI' },
      { status: 500 }
    );
  }
}
