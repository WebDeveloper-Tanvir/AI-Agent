import Anthropic from '@anthropic-ai/sdk';
import { COMPONENT_LIBRARY, validateComponentUsage } from './components';
import { GenerationPlan, GenerationResult, AgentStep } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Step 1: Planner Prompt
const PLANNER_PROMPT = `You are a UI planning agent. Your job is to analyze user intent and create a structured plan for UI generation.

Available Components (FIXED - cannot be modified or extended):
${Object.entries(COMPONENT_LIBRARY)
  .map(
    ([name, def]) =>
      `- ${name}: ${def.description}
  Allowed props: ${def.allowedProps.join(', ')}`
  )
  .join('\n')}

Given the user's intent, you must:
1. Understand what the user wants to build
2. Choose an appropriate layout structure (e.g., grid, flex, sidebar layout, etc.)
3. Select which components from the library to use
4. Provide reasoning for your choices

Respond ONLY with valid JSON in this exact format:
{
  "intent": "brief summary of what user wants",
  "layoutStructure": "description of layout approach",
  "components": ["Component1", "Component2"],
  "reasoning": ["reason 1", "reason 2"]
}`;

// Step 2: Generator Prompt
const GENERATOR_PROMPT = `You are a UI code generator. Your job is to convert a plan into working React code.

CRITICAL CONSTRAINTS:
- Use ONLY these components: ${Object.keys(COMPONENT_LIBRARY).join(', ')}
- NO inline styles
- NO custom CSS
- NO arbitrary Tailwind class generation
- NO new component creation
- Use ONLY Tailwind's core utility classes

You will receive:
1. The user's original intent
2. A structured plan

Generate clean, valid React code that:
- Uses only allowed components
- Uses only allowed props for each component
- Uses standard Tailwind utility classes
- Is properly formatted and functional

Return ONLY the React component code, starting with "export default function GeneratedUI() {"`;

// Step 3: Explainer Prompt
const EXPLAINER_PROMPT = `You are a UI explanation agent. Your job is to explain design decisions in plain English.

Given:
1. User's intent
2. The plan
3. The generated code

Explain:
- Why this layout was chosen
- Why these specific components were selected
- How the components work together
- Any tradeoffs or limitations

Be concise but informative. Write 2-4 sentences.`;

export class AIAgent {
  private steps: AgentStep[] = [];

  async generateUI(userIntent: string, existingCode?: string): Promise<GenerationResult> {
    this.steps = [];

    try {
      // Step 1: Planning
      const plan = await this.plan(userIntent, existingCode);
      
      // Step 2: Code Generation
      const code = await this.generate(userIntent, plan, existingCode);
      
      // Validate generated code
      const validation = validateComponentUsage(code);
      if (!validation.valid) {
        throw new Error(`Code validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Step 3: Explanation
      const explanation = await this.explain(userIntent, plan, code);
      
      // Extract component usage
      const componentUsage = this.extractComponentUsage(code);
      
      return {
        plan,
        code,
        explanation,
        componentUsage,
      };
    } catch (error) {
      console.error('AI Agent Error:', error);
      throw error;
    }
  }

  private async plan(userIntent: string, existingCode?: string): Promise<GenerationPlan> {
    const context = existingCode 
      ? `\n\nExisting UI code (modify this, don't regenerate from scratch):\n${existingCode}`
      : '';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${PLANNER_PROMPT}\n\nUser Intent: ${userIntent}${context}`,
        },
      ],
    });

    const content = message.content[0];
    const planText = content.type === 'text' ? content.text : '';
    
    this.steps.push({
      step: 'planner',
      input: userIntent,
      output: planText,
      timestamp: Date.now(),
    });

    // Parse JSON response
    const jsonMatch = planText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract plan JSON');
    }

    return JSON.parse(jsonMatch[0]);
  }

  private async generate(
    userIntent: string,
    plan: GenerationPlan,
    existingCode?: string
  ): Promise<string> {
    const planText = JSON.stringify(plan, null, 2);
    const context = existingCode
      ? `\n\nEXISTING CODE (modify this incrementally):\n${existingCode}\n\nModify the existing code based on the new plan. Keep what works, change only what's needed.`
      : '';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${GENERATOR_PROMPT}\n\nUser Intent: ${userIntent}\n\nPlan:\n${planText}${context}`,
        },
      ],
    });

    const content = message.content[0];
    const code = content.type === 'text' ? content.text : '';
    
    this.steps.push({
      step: 'generator',
      input: planText,
      output: code,
      timestamp: Date.now(),
    });

    // Extract the component code
    const codeMatch = code.match(/export default function[\s\S]*/);
    if (!codeMatch) {
      throw new Error('Failed to extract valid component code');
    }

    return codeMatch[0];
  }

  private async explain(
    userIntent: string,
    plan: GenerationPlan,
    code: string
  ): Promise<string> {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `${EXPLAINER_PROMPT}\n\nUser Intent: ${userIntent}\n\nPlan: ${JSON.stringify(plan)}\n\nGenerated Code:\n${code.substring(0, 500)}...`,
        },
      ],
    });

    const content = message.content[0];
    const explanation = content.type === 'text' ? content.text : '';
    
    this.steps.push({
      step: 'explainer',
      input: 'Generate explanation',
      output: explanation,
      timestamp: Date.now(),
    });

    return explanation;
  }

  private extractComponentUsage(code: string): string[] {
    const components = new Set<string>();
    const pattern = /<(\w+)[\s>]/g;
    const matches = [...code.matchAll(pattern)];

    for (const match of matches) {
      const componentName = match[1];
      if (Object.keys(COMPONENT_LIBRARY).includes(componentName)) {
        components.add(componentName);
      }
    }

    return Array.from(components);
  }

  getSteps(): AgentStep[] {
    return this.steps;
  }
}
