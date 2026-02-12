'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import * as UIComponents from '@/components/ui';

interface PreviewProps {
  code: string;
}

export default function Preview({ code }: PreviewProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setComponent(null);
      setError(null);
      return;
    }

    try {
      // Create a function that returns the component
      // This is a safe way to evaluate the code
      const componentCode = code.replace('export default', 'return');
      
      // Create function with UI components and React in scope
      const func = new Function(
        ...Object.keys(UIComponents),
        'React',
        'useState',
        'useEffect',
        componentCode
      );

      // Execute with UI components and React hooks
      const GeneratedComponent = func(
        ...Object.values(UIComponents),
        React,
        React.useState,
        React.useEffect
      );

      setComponent(() => GeneratedComponent);
      setError(null);
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(err.message);
      setComponent(null);
    }
  }, [code]);

  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p>No preview available</p>
          <p className="text-sm mt-2">Generate UI to see live preview</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Preview Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">Check the code for syntax errors</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      {Component ? <Component /> : <div className="text-gray-400">Loading preview...</div>}
    </div>
  );
}
