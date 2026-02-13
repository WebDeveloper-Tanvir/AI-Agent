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
    // DEBUG: Log what we're about to send
    console.log('=== handleSend called ===');
    console.log('Input value:', input);
    console.log('Input length:', input.length);
    console.log('Input trimmed:', input.trim());
    console.log('Is generating:', isGenerating);
    console.log('=======================');

    // Validation
    if (!input || !input.trim() || isGenerating) {
      console.warn('⚠️ Validation failed - not sending request');
      if (!input.trim()) {
        toast.error('Please enter a prompt');
      }
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const promptToSend = input; // Store the prompt before clearing
    setInput(''); // Clear input
    setIsGenerating(true);

    try {
      console.log('📤 Sending request to /api/generate');
      console.log('Payload:', {
        prompt: promptToSend,
        currentCode: currentCode || null,
      });

      // Call the Next.js API route
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToSend,  // Make sure we send the stored prompt
          currentCode: currentCode || null,
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Success! Data received:', {
        hasCode: !!data.code,
        codeLength: data.code?.length,
        hasExplanation: !!data.explanation,
      });

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.explanation || 'UI generated successfully!',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update the generated code
      if (data.code) {
        setGeneratedCode(data.code);
        setCurrentCode(data.code);
        toast.success('UI generated successfully!');
      } else {
        toast.error('No code received from backend');
      }

    } catch (error) {
      console.error('❌ Generation error:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to generate UI. Please try again.'}`,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error(error instanceof Error ? error.message : 'Failed to generate UI');
    } finally {
      setIsGenerating(false);
      console.log('✅ Request completed');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Panel - Left */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">AI UI Generator</h1>
          <p className="text-sm text-gray-500">Describe your UI and watch it come to life</p>
          {/* DEBUG INFO */}
          <div className="mt-2 text-xs text-gray-400">
            Backend: {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set'}
          </div>
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
