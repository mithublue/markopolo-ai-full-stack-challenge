import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const CampaignDisplay = ({ content, isStreaming, completeData }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isStreaming) {
    return (
      <div className="flex-1 bg-white border border-primary-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary-600 animate-pulse" />
          <span className="text-sm font-semibold text-primary-700">Generating Campaign...</span>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto font-mono text-gray-700 max-h-96 overflow-y-auto">
          {content}
          <span className="inline-block w-2 h-4 bg-primary-600 animate-pulse ml-1"></span>
        </pre>
      </div>
    );
  }

  if (!completeData) {
    return (
      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto font-mono text-gray-700">
          {content}
        </pre>
      </div>
    );
  }

  // Render beautiful campaign summary
  const { campaign, audience, message, channel, timing, metrics, budget, execution } = completeData;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              {campaign.name}
            </h3>
            <p className="text-gray-600 text-sm mt-1">Campaign ID: {campaign.id}</p>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Copy JSON"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Estimated Reach</p>
          <p className="text-lg font-semibold text-gray-900">{campaign.estimatedReach.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Target Audience</p>
          <p className="text-lg font-semibold text-gray-900">{audience.size.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">ROI Projection</p>
          <p className="text-lg font-semibold text-green-600">{budget.roi_projection}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Channel Selection */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            🎯 Recommended Channel: <span className="text-blue-700">{channel.name}</span>
          </h4>
          <p className="text-sm text-gray-700 mb-2">{channel.reasoning}</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Expected Engagement: <strong>{channel.expectedEngagement}</strong></span>
            <span>Cost: <strong className="capitalize">{channel.estimatedCost}</strong></span>
          </div>
        </div>

        {/* Message Content */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">📧 Message Content</h4>
          {message.subject && (
            <p className="text-sm font-medium text-gray-800 mb-2">
              Subject: {message.subject}
            </p>
          )}
          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">{message.primary}</p>
        </div>

        {/* Audience Details */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">👥 Target Audience</h4>
          <p className="text-sm font-medium text-gray-800 mb-2">{audience.segment}</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {audience.criteria.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Timing */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">⏰ Optimal Timing</h4>
          <p className="text-sm text-gray-700 mb-1">
            <strong>Schedule:</strong> {new Date(timing.optimal).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">{timing.reasoning}</p>
        </div>

        {/* Budget */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">💰 Budget Estimate</h4>
          <p className="text-2xl font-bold text-green-700">{budget.estimated}</p>
          <p className="text-xs text-gray-600 mt-1">Projected ROI: {budget.roi_projection}</p>
        </div>

        {/* Expandable JSON */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-700">Full Campaign JSON</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isExpanded && (
            <pre className="text-xs bg-gray-900 text-gray-100 p-4 overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(completeData, null, 2)}
            </pre>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">🚀 Next Steps</h4>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            {execution.nextSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CampaignDisplay;
