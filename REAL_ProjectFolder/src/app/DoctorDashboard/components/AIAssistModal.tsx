// components/AIAssistModal.tsx
'use client';

import { useState } from 'react';

export default function AIAssistModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate AI response
    setResponse(`Based on your query about "${query}", I recommend reviewing the patient's recent lab results and considering a follow-up appointment to discuss these symptoms in detail. The symptoms described could be related to medication side effects or underlying conditions that may need further investigation.`);
  };

  return (
     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="premium-card p-6 w-96 bg-slate-800/95 border border-white/20">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fas fa-robot text-cyan-400 mr-2"></i>
          AI Clinical Assistant
        </h3>
        
        {!response ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Clinical Question</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                className="w-full premium-card p-3 h-32 resize-none"
                placeholder="Describe the clinical scenario or ask a question..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-300">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                Get AI Insights
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="premium-card p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mb-4">
              <p className="text-sm">{response}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setResponse('')}
                className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-300"
              >
                Ask Another
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}