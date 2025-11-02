import React, { useState } from 'react';
import type { Application, UserProfile } from '../types';

// Import step components
import ApplyContactPage from './ApplyContactPage';
import ApplyEventPage from './ApplyEventPage';
import ApplyExpensesPage from './ApplyExpensesPage';
import ApplyTermsPage from './ApplyTermsPage';

export interface ApplicationFormData {
  profileData: UserProfile;
  eventData: {
    event: string;
    requestedAmount: number;
  };
  agreementData: {
    shareStory: boolean;
    receiveAdditionalInfo: boolean;
  };
}

interface ApplyPageProps {
  navigate: (page: 'home' | 'profile') => void;
  onSubmit: (application: ApplicationFormData) => Promise<void>;
  userProfile: UserProfile;
}

const ApplyPage: React.FC<ApplyPageProps> = ({ navigate, onSubmit, userProfile }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationFormData>({
    profileData: { ...userProfile },
    eventData: {
      event: '',
      requestedAmount: 0,
    },
    agreementData: {
      shareStory: false,
      receiveAdditionalInfo: false,
    },
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  const updateProfileData = (newData: Partial<UserProfile>) => {
      setFormData(prev => ({ 
          ...prev, 
          profileData: { ...prev.profileData, ...newData } 
      }));
  };
  
  const updateEventData = (newData: Partial<ApplicationFormData['eventData']>) => {
      setFormData(prev => ({
          ...prev,
          eventData: { ...prev.eventData, ...newData }
      }));
  };

  const updateAgreementData = (newData: Partial<ApplicationFormData['agreementData']>) => {
      setFormData(prev => ({
          ...prev,
          agreementData: { ...prev.agreementData, ...newData }
      }));
  };
  
  const handleFinalSubmit = async () => {
    await onSubmit(formData);
  };

  const renderStep = () => {
      switch(step) {
          case 1:
              return <ApplyContactPage formData={formData.profileData} updateFormData={updateProfileData} nextStep={nextStep} />;
          case 2:
              return <ApplyEventPage formData={formData.eventData} updateFormData={updateEventData} nextStep={nextStep} prevStep={prevStep} />;
          case 3:
              return <ApplyExpensesPage nextStep={nextStep} prevStep={prevStep} />;
          case 4:
              return <ApplyTermsPage formData={formData.agreementData} updateFormData={updateAgreementData} prevStep={prevStep} onSubmit={handleFinalSubmit} />;
          default:
            navigate('home');
            return null;
      }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <button onClick={() => navigate('home')} className="text-[#ff8400] hover:text-[#ff9d33] mb-6">&larr; Back to Home</button>
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Apply for Relief</h1>
      <div className="bg-[#004b8d] p-8 rounded-lg shadow-lg">
        {renderStep()}
      </div>
    </div>
  );
};

export default ApplyPage;