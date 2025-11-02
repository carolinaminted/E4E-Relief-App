import React from 'react';

interface SupportPageProps {
  navigate: (page: 'home') => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ navigate }) => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate('home')} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:opacity-80 mb-6">&larr; Back to Home</button>
      <div className="bg-[#004b8d] p-8 rounded-lg shadow-lg space-y-4 text-lg text-center">
        <div>
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-1">Support Email</h2>
          <a href="mailto:support@e4erelief.example" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:underline">support@e4erelief.example</a>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-1">Support Phone</h2>
          <a href="tel:800-555-0199" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:underline">(800) 555-0199</a>
        </div>
        <p className="text-white pt-4 italic">
          You can also chat with the in-app AI assistant for quick answers to common questions.
        </p>
      </div>
    </div>
  );
};

export default SupportPage;