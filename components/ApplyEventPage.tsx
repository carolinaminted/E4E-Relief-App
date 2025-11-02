import React, { useState } from 'react';
import type { ApplicationFormData } from './ApplyPage';

interface ApplyEventPageProps {
  formData: ApplicationFormData['eventData'];
  updateFormData: (data: Partial<ApplicationFormData['eventData']>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ApplyEventPage: React.FC<ApplyEventPageProps> = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [error, setError] = useState('');
  
  const handleNext = () => {
    if (!formData.event || !formData.requestedAmount || formData.requestedAmount <= 0) {
      setError('All fields are required and the requested amount must be greater than zero.');
      return;
    }
    setError('');
    nextStep();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Step 2: Event Details</h2>
        <div>
          <label htmlFor="event" className="block text-sm font-medium text-white mb-2">Event</label>
          <select
            id="event"
            value={formData.event || ''}
            onChange={(e) => updateFormData({ event: e.target.value })}
            className="w-full bg-[#005ca0] border border-[#005ca0] rounded-md p-2 text-white focus:ring-[#ff8400] focus:border-[#ff8400]"
            required
          >
            <option value="" disabled>Select an event type</option>
            <option value="Flood">Flood</option>
            <option value="Tornado">Tornado</option>
            <option value="Tropical Storm/Hurricane">Tropical Storm/Hurricane</option>
            <option value="Wildfire">Wildfire</option>
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white mb-2">Requested Relief Payment ($)</label>
          <input
            type="number"
            id="amount"
            value={formData.requestedAmount || ''}
            onChange={(e) => updateFormData({ requestedAmount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="w-full bg-[#005ca0] border border-[#005ca0] rounded-md p-2 text-white focus:ring-[#ff8400] focus:border-[#ff8400]"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-200">
          Back
        </button>
        <button onClick={handleNext} className="bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-6 rounded-md transition-colors duration-200">
          Next
        </button>
      </div>
    </div>
  );
};

export default ApplyEventPage;