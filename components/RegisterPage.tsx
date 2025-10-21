import React, { useState } from 'react';

interface RegisterPageProps {
  onRegister: (email: string, password: string) => boolean;
  switchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    const success = onRegister(email, password);
    if (!success) {
      setError('An account with this email already exists.');
    } else {
      setError('');
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
        Create Your Account
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-lg shadow-lg">
        <div>
          <label htmlFor="email-reg" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input
            type="email"
            id="email-reg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password-reg" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input
            type="password"
            id="password-reg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
            required
            autoComplete="new-password"
          />
        </div>
         <div>
          <label htmlFor="confirm-password-reg" className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
          <input
            type="password"
            id="confirm-password-reg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
            required
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200">
          Sign Up
        </button>
        <p className="text-sm text-center text-slate-400">
          Already have an account?{' '}
          <button type="button" onClick={switchToLogin} className="font-medium text-blue-400 hover:underline">
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
