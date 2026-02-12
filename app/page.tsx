'use client';

import { useState, useEffect } from 'react';
import { Send, Code, Eye, RotateCcw, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { Version, ChatMessage, GenerationResult, AgentStep } from '@/types';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import ChatPanel from '@/components/ChatPanel';
import VersionHistory from '@/components/VersionHistory';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIntent: input,
          existingCode: currentCode || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const data = await response.json();
      const result: GenerationResult = data.result;
      const steps: AgentStep[] = data.steps;

      // Save version
      const newVersion: Version = {
        id: Date.now().toString(),
        code: result.code,
        timestamp: Date.now(),
        userPrompt: input,
        plan: result.plan,
        explanation: result.explanation,
      };

      setVersions((prev) => [...prev, newVersion]);
      setCurrentCode(result.code);
      setCurrentExplanation(result.explanation);
      setAgentSteps(steps);

      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: result.explanation,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      toast.success('UI generated successfully!');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate UI');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length === 0) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      await handleGenerate();
    }
  };

  const handleRollback = (version: Version) => {
    setCurrentCode(version.code);
    setCurrentExplanation(version.explanation);
    toast.success('Rolled back to previous version');
  };

  const handleCodeEdit = (newCode: string) => {
    setCurrentCode(newCode);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI UI Generator</h1>
              <p className="text-sm text-gray-500">Claude-Code Style Deterministic UI Builder</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCode(!showCode)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                showCode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                showPreview ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating || messages.length === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
          <ChatPanel
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSend={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Middle Panel - Code Editor */}
        {showCode && (
          <div className="flex-1 border-r border-gray-200 bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Generated Code</h2>
              <p className="text-xs text-gray-500 mt-1">Editable - changes reflect in preview</p>
            </div>
            <CodeEditor code={currentCode} onChange={handleCodeEdit} />
          </div>
        )}

        {/* Right Panel - Preview */}
        {showPreview && (
          <div className="flex-1 bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Live Preview</h2>
              <p className="text-xs text-gray-500 mt-1">Real-time rendering with fixed components</p>
            </div>
            <Preview code={currentCode} />
          </div>
        )}
      </div>

      {/* Bottom Panel - Explanation & Version History */}
      {(currentExplanation || versions.length > 0) && (
        <div className="border-t border-gray-200 bg-white">
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            {/* Explanation */}
            {currentExplanation && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">AI Explanation</h3>
                </div>
                <p className="text-sm text-gray-700">{currentExplanation}</p>
                
                {agentSteps.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-500">Agent Steps:</p>
                    {agentSteps.map((step, idx) => (
                      <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium capitalize">{step.step}:</span> Completed
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Version History */}
            {versions.length > 0 && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Version History</h3>
                </div>
                <VersionHistory versions={versions} onRollback={handleRollback} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
