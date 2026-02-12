# AI UI Generator - Claude-Code Style

A production-ready AI-powered UI generator that converts natural language descriptions into working React components using a deterministic component library. Built with multi-step AI agent orchestration.

## 🎯 Overview

This application demonstrates:
- **Multi-step AI agent orchestration** (Planner → Generator → Explainer)
- **Deterministic component system** (fixed library, no arbitrary generation)
- **Incremental code modification** (not full rewrites)
- **Live preview** with real-time rendering
- **Version history** and rollback capability
- **Safety validation** (component whitelist, prompt injection protection)

## 🏗 Architecture

### 1. AI Agent Pipeline

The system uses a three-step agent architecture:

```
User Intent → [Planner] → [Generator] → [Explainer] → UI Code + Explanation
```

**Planner Agent**
- Analyzes user intent
- Chooses layout structure
- Selects components from fixed library
- Outputs structured JSON plan

**Generator Agent**
- Converts plan to React code
- Uses only whitelisted components
- Enforces prop constraints
- Produces valid, formatted code

**Explainer Agent**
- Explains design decisions
- References specific choices
- Provides context and reasoning

### 2. Component System Design

**Fixed Component Library:**
- `Button` - Interactive button with variants (primary, secondary, outline, ghost)
- `Card` - Container with title, content, and footer
- `Input` - Form input with label
- `Table` - Data table with columns and rows
- `Modal` - Overlay dialog
- `Sidebar` - Navigation sidebar
- `Navbar` - Top navigation bar
- `Chart` - Charts using recharts (line, bar, pie, area)

**Design Principles:**
- Components are **immutable** - implementation never changes
- Only **composition** and **props** can vary
- No inline styles or custom CSS allowed
- Tailwind core utilities only
- Visual consistency enforced through validation

### 3. Safety & Validation

**Component Whitelist Enforcement:**
```typescript
- Validates all components against whitelist
- Blocks unauthorized component usage
- Prevents inline styles and dynamic CSS
```

**Prompt Injection Protection:**
- Structured JSON responses
- Validation before rendering
- Error handling for invalid outputs

**Code Validation:**
- Syntax checking
- Component usage validation
- Prop validation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-ui-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

5. Run development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Basic Workflow

1. **Describe your UI** in the chat panel (left)
   - Example: "Create a dashboard with sales charts and a table"

2. **View generated code** in the middle panel
   - Fully editable
   - Syntax highlighted
   - Live updates

3. **See live preview** in the right panel
   - Real-time rendering
   - Uses actual component library
   - Error handling

4. **Iterate with chat**
   - "Add a modal for user settings"
   - "Make the table sortable"
   - AI modifies existing code incrementally

5. **Rollback if needed**
   - Version history tracks all generations
   - One-click restore to previous versions

### Example Prompts

**Dashboard:**
```
Create a sales dashboard with:
- Navbar at the top
- Sidebar with navigation
- Cards showing KPIs
- Charts for trends
```

**Form:**
```
Build a user profile form with:
- Input fields for name, email, password
- Save and Cancel buttons
- Validation messages
```

**Data View:**
```
Make a data table showing user information with:
- Columns for name, email, role, status
- Striped rows
- Action buttons
```

**Incremental Edits:**
```
Add a modal that opens when clicking the settings button
Make the cards elevated instead of outlined
Change the navbar to dark variant
```

## 🛠 Technical Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **AI:** Anthropic Claude (Sonnet 4)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State:** React hooks + Zustand (lightweight)
- **Syntax Highlighting:** Prism.js
- **Notifications:** React Hot Toast

## 📁 Project Structure

```
ai-ui-generator/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # API endpoint for AI generation
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main application page
├── components/
│   ├── ui/                        # Fixed component library
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── Chart.tsx
│   ├── ChatPanel.tsx              # Chat interface
│   ├── CodeEditor.tsx             # Code editing panel
│   ├── Preview.tsx                # Live preview renderer
│   └── VersionHistory.tsx         # Version management
├── lib/
│   ├── agent.ts                   # AI agent orchestrator
│   └── components.ts              # Component library definitions
├── types/
│   └── index.ts                   # TypeScript types
└── README.md
```

## 🔒 Constraints & Guarantees

### What the AI CAN Do:
✅ Select components from the library  
✅ Compose layouts using allowed components  
✅ Set props within allowed values  
✅ Provide content and data  
✅ Modify existing code incrementally  

### What the AI CANNOT Do:
❌ Create new components  
❌ Modify component implementations  
❌ Use inline styles  
❌ Generate arbitrary CSS  
❌ Use external UI libraries  
❌ Access components outside the whitelist  

## 🧪 Key Features Demonstrated

### 1. Multi-Step Agent Reasoning
Each generation involves three distinct AI calls with separate prompts, ensuring:
- Clear separation of concerns
- Traceable decision-making
- Explainable outputs

### 2. Deterministic Generation
Same intent + same state → same output
- Component library is fixed
- No randomness in component selection
- Consistent visual results

### 3. Incremental Editing
When modifying existing UI:
- AI analyzes current code
- Makes targeted changes
- Preserves working components
- Avoids unnecessary rewrites

### 4. Safety First
- Component whitelist enforcement
- Prop validation
- Syntax checking before rendering
- Error boundaries
- Graceful degradation

## 🎨 Design Decisions

### Why Fixed Components?
- **Predictability:** Users know what's possible
- **Consistency:** Visual coherence across generations
- **Safety:** No arbitrary code execution
- **Performance:** Pre-built, optimized components

### Why Multi-Step Agents?
- **Transparency:** Each step is visible and debuggable
- **Quality:** Specialized prompts for each task
- **Flexibility:** Easy to add new steps or modify existing ones

### Why React + Next.js?
- **SSR Support:** Better performance and SEO
- **API Routes:** Backend logic in same codebase
- **TypeScript:** Type safety throughout
- **Hot Reload:** Instant feedback during development

## 🚧 Known Limitations

1. **Component Library Size:** Limited to 8 components
   - Could be extended with more components
   - Current set covers most common use cases

2. **Styling Flexibility:** Only Tailwind core classes
   - Prevents arbitrary styling
   - Ensures visual consistency
   - Trade-off for safety

3. **Complex Interactions:** Limited to prop-based state
   - No custom hooks or complex state management
   - Suitable for presentational UIs
   - Could be extended with state management

4. **Error Recovery:** Basic error handling
   - Could add more sophisticated validation
   - Better error messages for users
   - Retry mechanisms

## 🔮 Future Improvements

With more time, I would add:

### Technical Enhancements:
- **Streaming AI Responses:** Real-time generation feedback
- **Diff View:** Visual comparison between versions
- **Component Schema Validation:** JSON schema for components
- **Static Analysis:** AST-based code validation
- **Export Functionality:** Download generated code
- **Import Existing Code:** Upload and modify existing UIs

### UX Improvements:
- **Undo/Redo:** Granular history navigation
- **Code Formatting:** Prettier integration
- **Dark Mode:** Theme switching
- **Keyboard Shortcuts:** Power user features
- **Guided Tutorials:** Interactive onboarding

### AI Capabilities:
- **Layout Suggestions:** Visual layout options
- **Component Recommendations:** Smart suggestions
- **Accessibility Checks:** A11y validation
- **Performance Analysis:** Optimization hints
- **Multi-Language Support:** i18n generation

### Infrastructure:
- **Authentication:** User accounts and persistence
- **Database:** Save projects across sessions
- **Collaboration:** Real-time multi-user editing
- **API Rate Limiting:** Production-ready rate limits
- **Monitoring:** Error tracking and analytics

## 📝 Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...  # Required: Your Anthropic API key
```

## 🧑‍💻 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a demonstration project for the Ryze AI assignment. For production use, consider:
- Adding comprehensive tests
- Implementing authentication
- Adding database persistence
- Setting up monitoring
- Implementing rate limiting

## 📧 Contact

For questions about this assignment, please contact the Ryze AI team.

---

Built with ❤️ for Ryze AI Full-Stack Assignment
