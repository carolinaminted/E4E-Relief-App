import React, { useState } from 'react';
import type { Application } from '../types';

interface ApplyPageProps {
  navigate: (page: 'home' | 'profile') => void;
  onSubmit: (application: Omit<Application, 'id' | 'submittedDate' | 'status'>) => Promise<void>;
}

const ApplyPage: React.FC<ApplyPageProps> = ({ navigate, onSubmit }) => {
  const [hireDate, setHireDate] = useState('');
  const [event, setEvent] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!hireDate || !event || !amount) {
      setError('All fields are required.');
      return;
    }
    const requestedAmount = parseFloat(amount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({ hireDate, event, requestedAmount });
    } catch (err) {
      console.error("Submission failed:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false); // Re-enable button on error
    } 
    // On success, the app navigates away, so no need to set isSubmitting to false here.
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate('home')} className="text-blue-400 hover:text-blue-300 mb-6">&larr; Back to Home</button>
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Apply for Relief</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-lg shadow-lg">
        <div>
          <label htmlFor="hireDate" className="block text-sm font-medium text-slate-300 mb-2">Hire Date</label>
          <input
            type="date"
            id="hireDate"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="event" className="block text-sm font-medium text-slate-300 mb-2">Event</label>
          <select
            id="event"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          >
            <option value="" disabled>Select an event type</option>
            <option value="Flood">Flood</option>
            <option value="Tornado">Tornado</option>
            <option value="Tropical Storm/Hurricane">Tropical Storm/Hurricane</option>
            <option value="Wildfire">Wildfire</option>
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">Requested Relief Payment ($)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
            min="0.01"
            step="0.01"
            required
            disabled={isSubmitting}
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 flex justify-center items-center h-12 disabled:bg-slate-500 disabled:cursor-wait"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </div>
  );
};

export default ApplyPage;