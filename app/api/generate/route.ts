// app/api/generate/route.ts (IMPROVED VERSION with config)
import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl, config } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, currentCode } = body;

    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    console.log('🚀 Calling FastAPI backend at:', config.backendUrl);
    console.log('📝 Prompt:', prompt.substring(0, 100) + '...');
    console.log('🔧 Has current code:', !!currentCode);

    // Call your FastAPI backend on Railway
    const response = await fetch(getApiUrl(config.api.generate), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        current_code: currentCode || null,
      }),
      // Add timeout for production
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: `Backend returned ${response.status}`,
          details: errorText,
          backendUrl: config.backendUrl,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Backend response received successfully');
    console.log('📄 Generated code length:', data.code?.length || 0);

    // Validate response structure
    if (!data.code) {
      throw new Error('Backend response missing required "code" field');
    }

    // Return the generated UI data
    return NextResponse.json({
      code: data.code,
      explanation: data.explanation || 'UI generated successfully',
      plan: data.plan || null,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ API route error:', error);
    
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          details: 'The backend took too long to respond. Please try again.',
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate UI',
        details: error instanceof Error ? error.message : 'Unknown error',
        backendUrl: config.backendUrl,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(getApiUrl(config.api.health), {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      status: 'healthy',
      backend: {
        status: data.status,
        url: config.backendUrl,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: config.backendUrl,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
