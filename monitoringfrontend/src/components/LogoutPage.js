import React from 'react';

const LogoutPage = ({ onLoginAgain }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col gap-4 border border-blue-200 items-center">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">You have been logged out</h1>
        <p className="text-blue-900 text-center">Thank you for using the dashboard.</p>
        <button
          onClick={onLoginAgain}
          className="btn bg-primary text-white rounded p-2 mt-2 w-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 font-semibold text-base transition-colors"
        >
          Log In Again
        </button>
      </div>
    </div>
  );
};

export default LogoutPage; 