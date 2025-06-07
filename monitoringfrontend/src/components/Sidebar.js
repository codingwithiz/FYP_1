import React, { useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

/**
 * Sidebar for adjusting criteria weights, business type, and natural language queries.
 * Props:
 * - weights: {footTraffic, competitorDensity, accessibility, demographics}
 * - onWeightChange: function
 * - businessTypes: Array of strings
 * - selectedBusinessType: string
 * - onBusinessTypeChange: function
 * - onQuerySubmit: function
 * - query: string
 * - onQueryChange: function
 * - chatHistory: Array of {role: 'user'|'ai', message: string}
 * - onSend: function
 * - onShowResults: function
 */
const Sidebar = ({ weights, onWeightChange, businessTypes, selectedBusinessType, onBusinessTypeChange, onQuerySubmit, query, onQueryChange, chatHistory = [], onSend, onShowResults }) => {
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat on new message
  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <aside className="w-full flex flex-col gap-3" aria-label="Sidebar Controls">
      {/* AI Chatbot Section */}
      <div className="flex flex-col gap-2">
        <label htmlFor="nl-query" className="font-semibold">AI Chatbot</label>
        <div className="bg-blue-50 rounded p-2 h-32 overflow-y-auto flex flex-col gap-1 mb-2 border border-blue-100 scrollbar-none">
          {chatHistory.length === 0 && <span className="text-xs text-gray-400">Ask about location suitability...</span>}
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} >
              <span className={`px-2 py-1 rounded-lg max-w-[80%] text-xs ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-blue-200 text-blue-900'}`}>{msg.message}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={onSend} className="flex gap-1 items-center">
          <input
            id="nl-query"
            type="text"
            value={query}
            onChange={onQueryChange}
            placeholder="Type your query..."
            className="input input-bordered w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs mb-0"
            aria-label="Natural Language Query"
            autoComplete="off"
          />
          <button type="submit" className="p-2 bg-blue-500 rounded text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400" aria-label="Send Query">
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
      {/* Business Type and Weights */}
      <label htmlFor="business-type" className="font-semibold mt-2">Business Type</label>
      <select
        id="business-type"
        value={selectedBusinessType}
        onChange={onBusinessTypeChange}
        className="select select-bordered w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs mb-0"
        aria-label="Business Type"
      >
        {businessTypes.map((type, idx) => (
          <option key={idx} value={type}>{type}</option>
        ))}
      </select>
      <div className="flex flex-col gap-2">
        <span className="font-semibold">Criteria Weights</span>
        {Object.entries(weights).map(([key, value]) => {
          // Format label: insert space before capital letters
          const label = key.replace(/([A-Z])/g, ' $1').trim();
          return (
            <div key={key} className="flex flex-row items-center gap-2 mb-0 text-xs py-0.5">
              <span className="capitalize w-28" title={label}>{label}</span>
              <input
                id={key}
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={e => onWeightChange(key, Number(e.target.value))}
                className="w-20 h-2 mx-1"
                aria-label={`${key} weight`}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={value}
                onChange={e => onWeightChange(key, Number(e.target.value))}
                className="w-14 p-1 border border-blue-200 rounded h-7 text-center"
                aria-label={`${key} weight value`}
                style={{ lineHeight: '1.2', marginBottom: 0 }}
              />
            </div>
          );
        })}
      </div>
      <button type="button" onClick={onShowResults} className="btn bg-primary text-white rounded p-2 mt-2 w-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 font-semibold text-sm" aria-label="Show Results">
        Show Results
      </button>
    </aside>
  );
};

export default Sidebar; 