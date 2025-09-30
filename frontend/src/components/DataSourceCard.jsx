import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const DataSourceCard = ({ source, isConnected, onConnect }) => {
  return (
    <button
      onClick={onConnect}
      disabled={isConnected}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
        isConnected
          ? 'bg-primary-50 border-primary-500'
          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-25'
      } ${isConnected ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm text-gray-900">{source.name}</span>
        {isConnected ? (
          <CheckCircle2 className="w-4 h-4 text-primary-600" />
        ) : (
          <Circle className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <span className="text-xs text-gray-600 capitalize">{source.type}</span>
      {isConnected && (
        <div className="mt-2 text-xs text-primary-700 font-medium">
          ✓ Connected
        </div>
      )}
    </button>
  );
};

export default DataSourceCard;
