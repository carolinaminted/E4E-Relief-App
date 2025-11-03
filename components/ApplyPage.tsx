import React, { useState } from 'react';
import type { Application, UserProfile, ApplicationFormData } from '../types';

// Import step components
import ApplyContactPage from './ApplyContactPage';
import ApplyEventPage from './ApplyEventPage';
import ApplyExpensesPage from './ApplyExpensesPage';
import ApplyTermsPage from './ApplyTermsPage';

interface ApplyPageProps {
  navigate: (page: 'home' | 'profile') => void;
  onSubmit: (application: ApplicationFormData) => Promise<void>;
  userProfile: UserProfile;
  applicationDraft: Partial<ApplicationFormData> | null;
}

const ApplyPage: React.FC<ApplyPageProps> = ({ navigate, onSubmit, userProfile, applicationDraft }) => {
  const [step, setStep] = useState(1);
  
  // Initialize state by deeply merging the user's profile with any draft data from the chatbot
  const [formData, setFormData] = useState<ApplicationFormData>(() => {
    // FIX: Cast draftProfile to Partial<UserProfile> to allow safe access to nested properties like primaryAddress
    const draftProfile: Partial<UserProfile> = applicationDraft?.profileData || {};
    const draftEvent = applicationDraft?.eventData || {};

    const initialProfile = {
      ...userProfile,
      ...draftProfile,
      primaryAddress: {
        ...userProfile.primaryAddress,
        ...(draftProfile.primaryAddress || {}),
      },
      mailingAddress: {
        ...(userProfile.mailingAddress || { country: '', street1: '', city: '', state: '', zip: '' }),
        ...(draftProfile.mailingAddress || {}),
      },
    };

    const initialEvent = {
        event: '',
        requestedAmount: 0,
        ...draftEvent,
    };

    return {
        profileData: initialProfile,
        eventData: initialEvent,
        agreementData: {
            shareStory: null,
            receiveAdditionalInfo: null,
        },
    };
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
  
  const handleAIParsedData = (parsedData: Partial<ApplicationFormData>) => {
    setFormData(prev => {
        const newProfileData = parsedData.profileData ? {
            ...prev.profileData,
            ...parsedData.profileData,
            primaryAddress: {
                ...prev.profileData.primaryAddress,
                ...(parsedData.profileData.primaryAddress || {}),
            },
            mailingAddress: {
                ...(prev.profileData.mailingAddress || { country: '', street1: '', city: '', state: '', zip: '' }),
                ...(parsedData.profileData.mailingAddress || {}),
            },
        } : prev.profileData;

        const newEventData = parsedData.eventData ? {
            ...prev.eventData,
            ...parsedData.eventData,
        } : prev.eventData;

        return {
            ...prev,
            profileData: newProfileData,
            eventData: newEventData,
        };
    });
  };
  
  const handleFinalSubmit = async () => {
    await onSubmit(formData);
  };

  const renderStep = () => {
      switch(step) {
          case 1:
              return <ApplyContactPage 
                formData={formData.profileData} 
                updateFormData={updateProfileData} 
                nextStep={nextStep}
                onAIParsed={handleAIParsedData}
                />;
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
      <button onClick={() => navigate('home')} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:opacity-80 mb-6">&larr; Back to Home</button>
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] text-center">Apply for Relief</h1>
      <div>
        {renderStep()}
      </div>
    </div>
  );
};

export default ApplyPage;