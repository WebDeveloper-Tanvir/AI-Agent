// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Component library definition
const COMPONENT_LIBRARY = `
Available Components:
1. Button - variants: primary, secondary, outline, ghost
2. Card - with title, content, footer
3. Input - with label
4. Table - with columns and rows
5. Modal - overlay dialog
6. Sidebar - navigation sidebar
7. Navbar - top navigation bar
8. Chart - line, bar, pie, area (using recharts)

Only use Tailwind core utility classes.
All components must be from this library only.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, currentCode } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Generating UI with OpenAI...');
    console.log('📝 Prompt:', prompt.substring(0, 100));

    // Step 1: Create a plan
    const planResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a UI planner. Analyze the user's request and create a JSON plan.
          
${COMPONENT_LIBRARY}

Return ONLY a JSON object with this structure:
{
  "layout": "description of layout",
  "components": ["component1", "component2"],
  "reasoning": "why this approach"
}`,
        },
        {
          role: 'user',
          content: currentCode 
            ? `Current UI:\n${currentCode}\n\nModification request: ${prompt}`
            : `Create UI: ${prompt}`,
        },
      ],
      temperature: 0.7,
    });

    let plan;
    try {
      const planText = planResponse.choices[0].message.content || '{}';
      plan = JSON.parse(planText);
    } catch (e) {
      plan = { layout: 'default', components: [], reasoning: 'Generated from prompt' };
    }

    console.log('📋 Plan created:', plan);

    // Step 2: Generate the code
    const codeResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a React code generator. Generate clean, working React code.

${COMPONENT_LIBRARY}

CRITICAL RULES:
- Use ONLY the components listed above
- Import components from '@/components/ui/ComponentName'
- Use only Tailwind core utility classes
- No inline styles
- No custom CSS
- Create a default export functional component
- Make it production-ready

${currentCode ? 'MODIFY the existing code based on the user request. Make targeted changes, preserve what works.' : 'CREATE new code from scratch.'}

Return ONLY the React code, no explanations, no markdown backticks.`,
        },
        {
          role: 'user',
          content: currentCode
            ? `Current code:\n\`\`\`tsx\n${currentCode}\n\`\`\`\n\nPlan: ${JSON.stringify(plan)}\n\nModify based on: ${prompt}`
            : `Plan: ${JSON.stringify(plan)}\n\nCreate: ${prompt}`,
        },
      ],
      temperature: 0.3,
    });

    let code = codeResponse.choices[0].message.content || '';
    
    // Clean up the code (remove markdown if present)
    code = code.replace(/```tsx\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('✅ Code generated, length:', code.length);

    // Step 3: Generate explanation
    const explanationResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful UI designer. Explain the design decisions in 2-3 sentences.',
        },
        {
          role: 'user',
          content: `I asked for: "${prompt}"\n\nPlan: ${JSON.stringify(plan)}\n\nExplain what was created and why.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const explanation = explanationResponse.choices[0].message.content || 
      'UI component created based on your request.';

    console.log('💬 Explanation generated');

    return NextResponse.json({
      code,
      explanation,
      plan,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ OpenAI API error:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate UI',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    provider: 'OpenAI',
    timestamp: new Date().toISOString(),
  });
}
