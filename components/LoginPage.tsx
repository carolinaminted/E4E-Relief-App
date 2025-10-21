import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
  switchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for demo purposes
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
        Sign In to E4E Relief
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-lg shadow-lg">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200">
          Sign In
        </button>
        <p className="text-sm text-center text-slate-400">
          Don't have an account?{' '}
          <button type="button" onClick={switchToRegister} className="font-medium text-blue-400 hover:underline">
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
