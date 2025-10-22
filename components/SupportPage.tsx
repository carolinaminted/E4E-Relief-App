import React from 'react';

interface SupportPageProps {
  navigate: (page: 'home') => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ navigate }) => {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <button onClick={() => navigate('home')} className="text-[#ff8400] hover:text-[#ff9d33] mb-6">&larr; Back to Home</button>
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Support</h1>
      <div className="bg-[#004b8d] p-8 rounded-lg shadow-lg space-y-4 text-lg">
        <div>
          <h2 className="text-xl font-semibold text-[#ff8400] mb-1">Support Email</h2>
          <a href="mailto:support@e4erelief.example" className="text-[#ff8400] hover:underline">support@e4erelief.example</a>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#ff8400] mb-1">Support Phone</h2>
          <a href="tel:800-555-0199" className="text-[#ff8400] hover:underline">(800) 555-0199</a>
        </div>
        <p className="text-white pt-4 italic">
          You can also chat with the in-app AI assistant for quick answers to common questions.
        </p>
      </div>
    </div>
  );
};

export default SupportPage;