export interface ComponentDefinition {
  name: string;
  props: Record<string, any>;
  allowedProps: string[];
  description: string;
}

export interface GenerationPlan {
  intent: string;
  layoutStructure: string;
  components: string[];
  reasoning: string[];
}

export interface GenerationResult {
  plan: GenerationPlan;
  code: string;
  explanation: string;
  componentUsage: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Version {
  id: string;
  code: string;
  timestamp: number;
  userPrompt: string;
  plan: GenerationPlan;
  explanation: string;
}

export interface AgentStep {
  step: 'planner' | 'generator' | 'explainer';
  input: string;
  output: string;
  timestamp: number;
}
