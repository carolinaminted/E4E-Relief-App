import React from 'react';

interface SupportPageProps {
  navigate: (page: 'home') => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ navigate }) => {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <button onClick={() => navigate('home')} className="text-blue-400 hover:text-blue-300 mb-6">&larr; Back to Home</button>
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Support</h1>
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg space-y-4 text-lg">
        <div>
          <h2 className="text-xl font-semibold text-blue-400 mb-1">Support Email</h2>
          <a href="mailto:support@e4erelief.example" className="text-teal-300 hover:underline">support@e4erelief.example</a>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-blue-400 mb-1">Support Phone</h2>
          <a href="tel:800-555-0199" className="text-teal-300 hover:underline">(800) 555-0199</a>
        </div>
        <p className="text-slate-400 pt-4 italic">
          You can also chat with the in-app AI assistant for quick answers to common questions.
        </p>
      </div>
    </div>
  );
};

export default SupportPage;
