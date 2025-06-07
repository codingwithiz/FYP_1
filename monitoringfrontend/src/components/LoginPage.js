import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    // Demo: hardcoded credentials
    if (username === 'admin' && password === 'password123') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col gap-4 border border-blue-200">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">Dashboard Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="font-semibold text-sm text-blue-900">Username</label>
          <input
            type="text"
            className="input input-bordered p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
            placeholder="Enter your username"
          />
          <label className="font-semibold text-sm text-blue-900">Password</label>
          <input
            type="password"
            className="input input-bordered p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          {error && <div className="text-red-500 text-xs text-center mt-1">{error}</div>}
          <button
            type="submit"
            className="btn bg-primary text-white rounded p-2 mt-2 w-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 font-semibold text-base transition-colors"
          >
            Log In
          </button>
        </form>
        <div className="text-xs text-gray-400 text-center mt-2">Demo: admin / password123</div>
      </div>
    </div>
  );
};

export default LoginPage; 