import React from 'react';

type Page = 'home' | 'apply' | 'profile' | 'support' | 'tokenUsage';

interface SupportPageProps {
  navigate: (page: Page) => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ navigate }) => {
  
  // A smaller, simpler card for secondary actions
  const SubActionCard: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <div 
      className="bg-[#004b8d] p-6 rounded-lg shadow-lg hover:bg-[#005ca0]/50 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
      onClick={onClick}
    >
      <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-2">{title}</h2>
      <p className="text-white text-sm">{description}</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="max-w-5xl mx-auto w-full">
        <button onClick={() => navigate('home')} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:opacity-80 mb-6">&larr; Back to Home</button>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-12 text-center">
          Support Center
        </h1>
        
        {/* Main Contact Card */}
        <div className="bg-[#004b8d] p-8 rounded-lg shadow-2xl max-w-2xl mx-auto border border-[#005ca0]/50">
           <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-2 text-center">Contact Support</h2>
           <p className="text-white mb-6 text-center">Try asking the AI Relief Assistant for any questions you may have now. Select the chat bubble in the bottom left to get started.</p>
           <div className="bg-[#003a70]/50 p-6 rounded-lg space-y-6 text-center">
               <div>
                  <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-1">Support Email</h3>
                  <a href="mailto:support@e4erelief.example" className="font-semibold text-white hover:underline text-lg">support@e4erelief.example</a>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-1">Support Phone</h3>
                  <a href="tel:800-555-0199" className="font-semibold text-white hover:underline text-lg">(800) 555-0199</a>
                </div>
            </div>
        </div>

        {/* Secondary Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
            <SubActionCard 
                title="FAQs" 
                description="Find answers to common questions." 
                onClick={() => {}} 
            />
            <SubActionCard 
                title="View Token Usage" 
                description="Review AI model token consumption." 
                onClick={() => navigate('tokenUsage')} 
            />
            <SubActionCard 
                title="Payment Options" 
                description="Learn how grants are disbursed." 
                onClick={() => {}} 
            />
        </div>
        
        <p className="text-white pt-12 italic text-center text-sm">
            You can also chat with the in-app AI assistant for quick answers to common questions.
        </p>
      </div>
    </div>
  );
};

export default SupportPage;
