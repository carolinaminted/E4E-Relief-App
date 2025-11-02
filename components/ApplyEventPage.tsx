import React, { useState } from 'react';
// FIX: Corrected the import path for ApplicationFormData. It should be imported from '../types' instead of a component file.
import type { ApplicationFormData } from '../types';
import SearchableSelector from './SearchableSelector';
import { eventTypes } from '../data/appData';

interface ApplyEventPageProps {
  formData: ApplicationFormData['eventData'];
  updateFormData: (data: Partial<ApplicationFormData['eventData']>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ApplyEventPage: React.FC<ApplyEventPageProps> = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.event) {
      newErrors.event = 'Please select an event type.';
    }
    if (!formData.requestedAmount || formData.requestedAmount <= 0) {
      newErrors.requestedAmount = 'Requested amount must be greater than zero.';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      nextStep();
    }
  };
  
  const handleUpdate = (data: Partial<ApplicationFormData['eventData']>) => {
    updateFormData(data);
    const fieldName = Object.keys(data)[0];
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6 p-8">
      <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Event Details</h2>
        <SearchableSelector
            label="Event"
            id="event"
            required
            value={formData.event || ''}
            options={eventTypes}
            onUpdate={value => handleUpdate({ event: value })}
            variant="underline"
            error={errors.event}
        />
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white mb-2">Requested Relief Payment ($)</label>
          <input
            type="number"
            id="amount"
            value={formData.requestedAmount || ''}
            onChange={(e) => handleUpdate({ requestedAmount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className={`w-full bg-transparent border-0 border-b p-2 text-white focus:outline-none focus:ring-0 ${errors.requestedAmount ? 'border-red-500' : 'border-[#005ca0] focus:border-[#ff8400]'}`}
            min="0.01"
            step="0.01"
            required
          />
          {errors.requestedAmount && <p className="text-red-400 text-xs mt-1">{errors.requestedAmount}</p>}
        </div>
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
