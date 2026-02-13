// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, currentCode } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Using rule-based generator...');
    console.log('🔗 Backend URL:', BACKEND_URL);

    // ✅ FIX: Use parentheses, not backticks for fetch
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
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
      let errorMessage = `Backend error: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.error || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return NextResponse.json({
      code: data.code,
      explanation: data.explanation,
      plan: data.plan,
    });
  } catch (error: any) {
    console.error('❌ Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate UI' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🏥 Health check - Backend URL:', BACKEND_URL);
    
    // ✅ FIX: Use parentheses, not backticks for fetch
    const response = await fetch(`${BACKEND_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: 'Backend not reachable',
        backend_url: BACKEND_URL 
      },
      { status: 503 }
    );
  }
}
