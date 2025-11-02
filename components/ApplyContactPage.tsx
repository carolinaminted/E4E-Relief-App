import React from 'react';
import type { ApplicationFormData } from './ApplyPage';

interface ApplyContactPageProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  nextStep: () => void;
}

const ApplyContactPage: React.FC<ApplyContactPageProps> = ({ formData, updateFormData, nextStep }) => {
  
  const handleNext = () => {
    // Future validation can be added here
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Step 1: Contact Information</h2>
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">First Name</label>
        <input
          type="text"
          id="firstName"
          value={formData.firstName || ''}
          onChange={(e) => updateFormData({ firstName: e.target.value })}
          className="w-full bg-[#005ca0] border border-[#005ca0] rounded-md p-2 text-white"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">Last Name</label>
        <input
          type="text"
          id="lastName"
          value={formData.lastName || ''}
          onChange={(e) => updateFormData({ lastName: e.target.value })}
          className="w-full bg-[#005ca0] border border-[#005ca0] rounded-md p-2 text-white"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email Address</label>
        <input
          type="email"
          id="email"
          value={formData.email || ''}
          disabled
          className="w-full bg-[#003a70] border border-[#002a50] rounded-md p-2 text-gray-400 cursor-not-allowed"
        />
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={handleNext} className="bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-6 rounded-md transition-colors duration-200">
          Next
        </button>
      </div>
    </div>
  );
};

export default ApplyContactPage;
