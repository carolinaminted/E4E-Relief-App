import React from 'react';

type Page = 'home' | 'apply' | 'profile' | 'support' | 'tokenUsage';

interface SupportPageProps {
  navigate: (page: Page) => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ navigate }) => {
  const ActionCard: React.FC<{ title: string; description: string; onClick: () => void; children?: React.ReactNode }> = ({ title, description, onClick, children }) => (
    <div 
      className="bg-[#004b8d] p-6 rounded-lg shadow-lg hover:bg-[#005ca0]/50 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-2">{title}</h2>
      <p className="text-white mb-4 flex-grow">{description}</p>
      {children}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="max-w-5xl mx-auto w-full">
        <button onClick={() => navigate('home')} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:opacity-80 mb-6">&larr; Back to Home</button>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-12 text-center">
          Support Center
        </h1>
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <ActionCard 
            title="Contact Support" 
            description="Get in touch with our support team for assistance."
            onClick={() => {}}
          >
            <div className="bg-[#003a70]/50 p-4 rounded-lg space-y-4 text-center cursor-default" onClick={(e) => e.stopPropagation()}>
               <div>
                  <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-1">Support Email</h3>
                  <a href="mailto:support@e4erelief.example" className="font-semibold text-white hover:underline">support@e4erelief.example</a>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-1">Support Phone</h3>
                  <a href="tel:800-555-0199" className="font-semibold text-white hover:underline">(800) 555-0199</a>
                </div>
            </div>
          </ActionCard>
          <ActionCard 
            title="FAQs" 
            description="Find answers to common questions about our relief programs and application process." 
            onClick={() => {}} 
          />
          <ActionCard 
            title="View Token Usage" 
            description="Review AI model token consumption for your account." 
            onClick={() => navigate('tokenUsage')} 
          />
          <ActionCard 
            title="Payment Options" 
            description="Learn more about how grants are disbursed and the payment methods available." 
            onClick={() => {}} 
          />
        </div>
        <p className="text-white pt-12 italic text-center">
            You can also chat with the in-app AI assistant for quick answers to common questions.
        </p>
      </div>
    </div>
  );
};

export default SupportPage;