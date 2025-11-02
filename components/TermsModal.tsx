import React from 'react';

interface TermsModalProps {
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
    >
      <div 
        className="bg-[#003a70] rounded-lg shadow-xl p-8 w-full max-w-2xl m-4 relative border border-[#002a50] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] flex-shrink-0">
          Terms of Acceptance
        </h2>
        <div className="space-y-4 text-white/90 overflow-y-auto pr-4 text-sm">
          <p>By submitting this application, I certify that the information provided is true, correct, and complete to the best of my knowledge. I understand that any false statements, misrepresentations, or omissions may lead to the denial of my application or other disciplinary action, up to and including termination of employment, where applicable.</p>
          <p>I authorize E4E Relief and its agents to verify the information provided in this application. I understand that this assistance is intended to provide temporary relief for qualified disaster events and may not cover all of my expenses.</p>
          <p>I agree to release and hold harmless E4E Relief, my employer, and their respective officers, directors, employees, and agents from any and all claims, liabilities, or causes of action arising out of or related to this application and any assistance provided.</p>
          <p>I understand that the funds are granted based on the information provided and are subject to availability. Receiving an award does not guarantee future assistance. All decisions made by E4E Relief are final.</p>
        </div>
        <div className="mt-6 pt-4 border-t border-[#002a50] flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            I Have Read and Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
