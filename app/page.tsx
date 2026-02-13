'use client';

import { useState } from 'react';
import ChatPanel from '@/components/ChatPanel';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import { ChatMessage } from '@/types';
import toast from 'react-hot-toast';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentCode, setCurrentCode] = useState('');

  const handleSend = async () => {
    if (!input || !input.trim() || isGenerating) {
      if (!input.trim()) {
        toast.error('Please enter a prompt');
      }
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(), // ✅ String timestamp
    };

    setMessages(prev => [...prev, userMessage]);
    const promptToSend = input;
    setInput('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToSend,
          currentCode: currentCode || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.explanation || 'UI generated successfully!',
        timestamp: new Date().toISOString(), // ✅ String timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.code) {
        setGeneratedCode(data.code);
        setCurrentCode(data.code);
        toast.success('UI generated successfully!');
      } else {
        toast.error('No code received from backend');
      }

    } catch (error) {
      console.error('Generation error:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to generate UI. Please try again.'}`,
        timestamp: new Date().toISOString(), // ✅ String timestamp
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error(error instanceof Error ? error.message : 'Failed to generate UI');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Panel - Left */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">AI UI Generator</h1>
          <p className="text-sm text-gray-500">Describe your UI and watch it come to life</p>
        </div>
        <ChatPanel
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          isGenerating={isGenerating}
        />
      </div>

      {/* Code Editor - Middle */}
      <div className="w-1/3 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Generated Code</h2>
        </div>
        <CodeEditor
          code={generatedCode}
          onChange={setGeneratedCode}
        />
      </div>

      {/* Preview - Right */}
      <div className="w-1/3 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
        </div>
        <Preview code={generatedCode} />
      </div>
    </div>
  );
}
