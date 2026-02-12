'use client';

import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      Prism.highlightElement(preRef.current);
    }
  }, [code]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-50">
        {code ? (
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full p-0 m-0 border-none outline-none resize-none bg-transparent text-transparent caret-black font-mono text-sm"
              style={{ caretColor: 'black' }}
              spellCheck={false}
            />
            <pre className="pointer-events-none" ref={preRef}>
              <code className="language-tsx">{code}</code>
            </pre>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No code generated yet</p>
            <p className="text-sm mt-2">Start by describing your UI in the chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
