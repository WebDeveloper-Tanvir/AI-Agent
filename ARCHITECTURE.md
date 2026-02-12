# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Chat Panel   │  │ Code Editor  │  │ Live Preview │          │
│  │ (Left)       │  │ (Middle)     │  │ (Right)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ State Management (React Hooks + Local State)         │      │
│  │  - messages, currentCode, versions, etc.             │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)               │
│  POST /api/generate                                             │
│  ┌────────────────────────────────────────────┐                │
│  │ Request: { userIntent, existingCode }       │                │
│  │ Response: { plan, code, explanation }       │                │
│  └────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Agent Orchestrator                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────┐         │
│  │              Step 1: PLANNER                      │         │
│  │  Input: User intent + existing code               │         │
│  │  Output: Structured plan (JSON)                   │         │
│  │   - Intent understanding                          │         │
│  │   - Layout structure                              │         │
│  │   - Component selection                           │         │
│  │   - Reasoning                                     │         │
│  └───────────────────────────────────────────────────┘         │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────┐         │
│  │              Step 2: GENERATOR                    │         │
│  │  Input: Plan + user intent + existing code        │         │
│  │  Output: React component code                     │         │
│  │   - Convert plan to code                          │         │
│  │   - Use only whitelisted components               │         │
│  │   - Apply constraints                             │         │
│  │   - Format properly                               │         │
│  └───────────────────────────────────────────────────┘         │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────┐         │
│  │            Step 3: VALIDATOR                      │         │
│  │  Input: Generated code                            │         │
│  │  Output: Validation result                        │         │
│  │   - Component whitelist check                     │         │
│  │   - Inline style detection                        │         │
│  │   - Prop validation                               │         │
│  │   - Syntax check                                  │         │
│  └───────────────────────────────────────────────────┘         │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────┐         │
│  │              Step 4: EXPLAINER                    │         │
│  │  Input: Plan + code + intent                      │         │
│  │  Output: Human-readable explanation               │         │
│  │   - Explain layout choices                        │         │
│  │   - Justify component selection                   │         │
│  │   - Note tradeoffs                                │         │
│  └───────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Anthropic Claude API                         │
│  Model: claude-sonnet-4-20250514                                │
│  - Multi-turn conversations                                     │
│  - Structured outputs                                           │
│  - Prompt engineering                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Fixed Component Library                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Button   │ │ Card     │ │ Input    │ │ Table    │          │
│  │          │ │          │ │          │ │          │          │
│  │ Props:   │ │ Props:   │ │ Props:   │ │ Props:   │          │
│  │ -variant │ │ -title   │ │ -type    │ │ -columns │          │
│  │ -size    │ │ -footer  │ │ -label   │ │ -data    │          │
│  │ -onClick │ │ -variant │ │ -value   │ │ -striped │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Modal    │ │ Sidebar  │ │ Navbar   │ │ Chart    │          │
│  │          │ │          │ │          │ │          │          │
│  │ Props:   │ │ Props:   │ │ Props:   │ │ Props:   │          │
│  │ -isOpen  │ │ -items   │ │ -logo    │ │ -type    │          │
│  │ -onClose │ │ -active  │ │ -items   │ │ -data    │          │
│  │ -title   │ │ -onClick │ │ -variant │ │ -xAxis   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ Chat Interface  │
│ - Collect intent│
│ - Display msgs  │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ API Call        │
│ POST /generate  │
└─────────────────┘
    │
    ▼
┌─────────────────┐      ┌──────────────┐
│ AI Agent        │─────▶│ Claude API   │
│ - Plan          │      └──────────────┘
│ - Generate      │             │
│ - Validate      │◀────────────┘
│ - Explain       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Response        │
│ - Plan (JSON)   │
│ - Code (React)  │
│ - Explanation   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ State Update    │
│ - Add message   │
│ - Set code      │
│ - Save version  │
└─────────────────┘
    │
    ▼
┌─────────────────┐      ┌──────────────┐
│ Code Editor     │      │ Live Preview │
│ - Display code  │      │ - Render UI  │
│ - Allow edits   │──────▶│ - Show errors│
└─────────────────┘      └──────────────┘
```

## State Management

```
Application State
├── messages: ChatMessage[]
│   └── { role, content, timestamp }
├── currentCode: string
├── versions: Version[]
│   └── { id, code, timestamp, userPrompt, plan, explanation }
├── isGenerating: boolean
├── currentExplanation: string
└── agentSteps: AgentStep[]
    └── { step, input, output, timestamp }
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Validation                         │
│                                                                 │
│  Layer 1: Input Sanitization                                   │
│  ┌────────────────────────────────────────┐                    │
│  │ - Trim whitespace                      │                    │
│  │ - Validate required fields             │                    │
│  │ - Check intent length                  │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
│  Layer 2: AI Prompt Safety                                     │
│  ┌────────────────────────────────────────┐                    │
│  │ - Structured prompts                   │                    │
│  │ - Clear constraints                    │                    │
│  │ - JSON-only responses                  │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
│  Layer 3: Code Validation                                      │
│  ┌────────────────────────────────────────┐                    │
│  │ - Component whitelist check            │                    │
│  │ - Inline style detection               │                    │
│  │ - Dynamic class generation check       │                    │
│  │ - Unauthorized component detection     │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
│  Layer 4: Runtime Safety                                       │
│  ┌────────────────────────────────────────┐                    │
│  │ - Sandboxed code execution             │                    │
│  │ - Error boundaries                     │                    │
│  │ - Graceful error handling              │                    │
│  └────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Version Management

```
Version History Flow

Create Initial UI
    │
    ▼
┌─────────────────┐
│ Version 1       │
│ - Code snapshot │
│ - Timestamp     │
│ - User prompt   │
│ - Plan          │
│ - Explanation   │
└─────────────────┘
    │
    ▼
Modify UI
    │
    ▼
┌─────────────────┐
│ Version 2       │
│ - Updated code  │
│ - New timestamp │
│ - Modify prompt │
│ - New plan      │
│ - New explain   │
└─────────────────┘
    │
    ▼
Rollback
    │
    ▼
┌─────────────────┐
│ Restore Ver 1   │
│ - Load old code │
│ - Update preview│
│ - Show explain  │
└─────────────────┘
```

## Technology Stack

```
Frontend Layer
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
└── Tailwind CSS

Component Layer
├── Button (Fixed)
├── Card (Fixed)
├── Input (Fixed)
├── Table (Fixed)
├── Modal (Fixed)
├── Sidebar (Fixed)
├── Navbar (Fixed)
└── Chart (Fixed + Recharts)

Backend Layer
├── Next.js API Routes
├── Anthropic SDK
└── Node.js Runtime

AI Layer
├── Claude Sonnet 4
├── Multi-step prompts
└── Structured outputs

Development Tools
├── Prism.js (Syntax highlighting)
├── React Hot Toast (Notifications)
└── Lucide React (Icons)
```

## Deployment Architecture

```
Development
    │
    ▼
┌─────────────────┐
│ Local Server    │
│ npm run dev     │
│ localhost:3000  │
└─────────────────┘

Production
    │
    ▼
┌─────────────────┐
│ Build Process   │
│ npm run build   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Static Assets   │
│ + Server Files  │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Vercel/Netlify  │
│ CDN + Serverless│
└─────────────────┘
```

## Key Design Decisions

### 1. Multi-Step Agent (vs Single Call)
**Choice:** Three separate AI calls (Planner, Generator, Explainer)
**Rationale:**
- Better separation of concerns
- More traceable decisions
- Easier debugging
- Specialized prompts for each task

### 2. Fixed Component Library (vs Dynamic Generation)
**Choice:** Predefined, immutable components
**Rationale:**
- Visual consistency guaranteed
- Predictable outputs
- Safety and validation easier
- No arbitrary code execution

### 3. Incremental Editing (vs Full Regeneration)
**Choice:** Modify existing code when possible
**Rationale:**
- Faster iterations
- Better user experience
- Preserves user customizations
- More efficient token usage

### 4. Client-Side Preview (vs Server-Side)
**Choice:** Render generated UI in browser
**Rationale:**
- Instant feedback
- No server round-trips
- Better developer experience
- Easier debugging

### 5. Version History (vs No History)
**Choice:** Track all generations
**Rationale:**
- Safety net for users
- Easy experimentation
- Undo capability
- Learning from iterations

## Performance Considerations

```
Optimization Strategies

1. Code Generation
   - Reuse existing code
   - Minimize token usage
   - Cache common patterns

2. Preview Rendering
   - Debounce code changes
   - Virtual DOM diffing
   - Lazy component loading

3. State Management
   - Minimal re-renders
   - Efficient updates
   - Selective subscriptions

4. API Calls
   - Request deduplication
   - Error retry logic
   - Timeout handling
```
