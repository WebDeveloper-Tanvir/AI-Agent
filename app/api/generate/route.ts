// app/api/generate/route.ts (DEBUG VERSION)
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    
    // DEBUG: Log everything we receive
    console.log('=== DEBUG: API Route Called ===');
    console.log('Full body:', JSON.stringify(body, null, 2));
    console.log('Body keys:', Object.keys(body));
    console.log('Prompt value:', body.prompt);
    console.log('Prompt type:', typeof body.prompt);
    console.log('Current code:', body.currentCode ? 'Present' : 'Not present');
    console.log('============================');

    // Extract prompt - try different possible field names
    const prompt = body.prompt || body.message || body.input || body.text;
    const currentCode = body.currentCode || body.current_code || body.code;

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      console.error('❌ Invalid prompt received');
      return NextResponse.json(
        { 
          error: 'Valid prompt is required',
          received: body,
          debug: {
            promptValue: prompt,
            promptType: typeof prompt,
            bodyKeys: Object.keys(body)
          }
        },
        { status: 400 }
      );
    }

    console.log('✅ Valid prompt received:', prompt.substring(0, 100));
    console.log('🚀 Calling backend at:', BACKEND_URL);

    // Call your FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        current_code: currentCode || null,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: `Backend error: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Backend response received');
    console.log('Code length:', data.code?.length || 0);

    return NextResponse.json({
      code: data.code,
      explanation: data.explanation || 'UI generated successfully',
      plan: data.plan || null,
    });

  } catch (error) {
    console.error('❌ API route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate UI',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  console.log('Health check called');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      status: 'ok',
      backend: data,
      backendUrl: BACKEND_URL,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: BACKEND_URL,
    }, { status: 503 });
  }
}
