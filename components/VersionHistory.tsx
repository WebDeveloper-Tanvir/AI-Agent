'use client';

import { Version } from '@/types';
import { History } from 'lucide-react';

interface VersionHistoryProps {
  versions: Version[];
  onRollback: (version: Version) => void;
}

export default function VersionHistory({ versions, onRollback }: VersionHistoryProps) {
  return (
    <div className="max-h-48 overflow-y-auto">
      <div className="space-y-2">
        {versions.slice().reverse().map((version, idx) => (
          <div
            key={version.id}
            className="flex items-start justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
            onClick={() => onRollback(version)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <History className="w-3 h-3 text-gray-400" />
                <p className="text-xs font-medium text-gray-900 truncate">
                  {version.userPrompt}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(version.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRollback(version);
              }}
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
