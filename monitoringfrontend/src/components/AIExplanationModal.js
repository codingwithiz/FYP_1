import React from 'react';

/**
 * AIExplanationModal for showing AI-generated rule explanations.
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - explanation: string
 */
const AIExplanationModal = ({ isOpen, onClose, explanation }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="AI Explanation Modal">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-blue-600" aria-label="Close Modal">&times;</button>
        <h2 className="text-xl font-bold mb-4">AI Explanation</h2>
        <p className="text-gray-700 whitespace-pre-line">{explanation}</p>
      </div>
    </div>
  );
};

export default AIExplanationModal; 