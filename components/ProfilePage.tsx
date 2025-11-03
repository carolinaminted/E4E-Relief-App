import React, { useState, useMemo } from 'react';
import type { Application, UserProfile, Address } from '../types';
import ApplicationDetailModal from './ApplicationDetailModal';
import CountrySelector from './CountrySelector';
import AddressHelper from './AddressHelper';
import SearchableSelector from './SearchableSelector';
import { employmentTypes, languages } from '../data/appData';
import { formatPhoneNumber } from '../utils/formatting';
import RequiredIndicator from './RequiredIndicator';

interface ProfilePageProps {
  navigate: (page: 'home' | 'apply') => void;
  applications: Application[];
  userProfile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const statusStyles: Record<Application['status'], string> = {
    Submitted: 'text-[#ff8400]',
    Awarded: 'text-[#edda26]',
    Declined: 'text-red-400',
};

// --- Reusable Form Components ---
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, required?: boolean, error?: string }> = ({ label, id, required, error, ...props }) => (
    <div>
        <label htmlFor={id} className="flex items-center text-sm font-medium text-white mb-1">
            {label} <RequiredIndicator required={required} isMet={!!props.value} />
        </label>
        <input id={id} {...props} className={`w-full bg-transparent border-0 border-b p-2 text-white focus:outline-none focus:ring-0 ${error ? 'border-red-500' : 'border-[#005ca0] focus:border-[#ff8400]'} disabled:bg-transparent disabled:border-b disabled:border-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed`} />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);


const FormRadioGroup: React.FC<{ legend: string, name: string, options: string[], value: string, onChange: (value: any) => void, required?: boolean, error?: string }> = ({ legend, name, options, value, onChange, required, error }) => (
    <div>
        <p className={`flex items-center text-sm font-medium text-white mb-1 ${error ? 'text-red-400' : ''}`}>
            {legend} <RequiredIndicator required={required} isMet={!!value} />
        </p>
        <div className="flex gap-4 mt-2">
            {options.map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                    <input type="radio" name={name} value={option} checked={value === option} onChange={(e) => onChange(e.target.value)} className="form-radio h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 focus:ring-[#ff8400]" />
                    <span className="ml-2 text-white">{option}</span>
                </label>
            ))}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);

const AddressFields: React.FC<{ address: Address, onUpdate: (field: keyof Address, value: string) => void, onBulkUpdate: (parsedAddress: Partial<Address>) => void, prefix: string, errors: Record<string, string> }> = ({ address, onUpdate, onBulkUpdate, prefix, errors }) => (
    <>
        <AddressHelper onAddressParsed={onBulkUpdate} variant="underline" />
        <CountrySelector id={`${prefix}Country`} required value={address.country} onUpdate={value => onUpdate('country', value)} variant="underline" error={errors.country}/>
        <FormInput label="Street 1" id={`${prefix}Street1`} required value={address.street1} onChange={e => onUpdate('street1', e.target.value)} error={errors.street1} />
        <FormInput label="Street 2" id={`${prefix}Street2`} value={address.street2 || ''} onChange={e => onUpdate('street2', e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput label="City" id={`${prefix}City`} required value={address.city} onChange={e => onUpdate('city', e.target.value)} error={errors.city} />
            <FormInput label="State or Province" id={`${prefix}State`} required value={address.state} onChange={e => onUpdate('state', e.target.value)} error={errors.state} />
            <FormInput label="ZIP/Postal Code" id={`${prefix}Zip`} required value={address.zip} onChange={e => onUpdate('zip', e.target.value)} error={errors.zip} />
        </div>
    </>
);

// --- UI Icons ---
const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-[#ff8400] transition-transform duration-300 transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const NotificationIcon: React.FC = () => (
    <span className="relative flex h-3 w-3" title="Action required in this section">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff8400] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff9d33]"></span>
    </span>
);


const ProfilePage: React.FC<ProfilePageProps> = ({ navigate, applications, userProfile, onProfileUpdate }) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(true);
  const [openSections, setOpenSections] = useState({
    contact: false,
    primaryAddress: false,
    additionalDetails: false,
    mailingAddress: false,
    consent: false,
  });
  
  const { twelveMonthRemaining, lifetimeRemaining } = useMemo(() => {
    if (applications.length === 0) {
      return {
        twelveMonthRemaining: 10000,
        lifetimeRemaining: 50000,
      };
    }

    // The most recent application is the last one in the array, which reflects the latest state.
    const latestApplication = applications[applications.length - 1];
    
    return {
      twelveMonthRemaining: latestApplication.twelveMonthGrantRemaining,
      lifetimeRemaining: latestApplication.lifetimeGrantRemaining,
    };
  }, [applications]);

  // Create a reversed list for display so newest applications appear first
  const sortedApplicationsForDisplay = useMemo(() => {
    return [...applications].reverse();
  }, [applications]);

  const sectionHasErrors = useMemo(() => {
    // Contact
    const contactHasBlanks = !formData.firstName || !formData.lastName || !formData.mobileNumber;
    
    // Primary Address
    const primaryAddressHasBlanks = !formData.primaryAddress.country || !formData.primaryAddress.street1 || !formData.primaryAddress.city || !formData.primaryAddress.state || !formData.primaryAddress.zip;
    
    // Additional Details
    const additionalDetailsHasBlanks = !formData.employmentStartDate || !formData.eligibilityType || formData.householdIncome === '' || formData.householdSize === '' || !formData.homeowner;
    
    // Mailing Address
    let mailingAddressHasBlanks = false;
    if (!formData.isMailingAddressSame) {
        mailingAddressHasBlanks = !formData.mailingAddress?.country || !formData.mailingAddress?.street1 || !formData.mailingAddress?.city || !formData.mailingAddress?.state || !formData.mailingAddress?.zip;
    }

    // Consent
    const consentHasBlanks = !formData.ackPolicies || !formData.commConsent || !formData.infoCorrect;

    return {
        contact: contactHasBlanks,
        primaryAddress: primaryAddressHasBlanks,
        additionalDetails: additionalDetailsHasBlanks,
        mailingAddress: mailingAddressHasBlanks,
        consent: consentHasBlanks,
    };
  }, [formData]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };


  const handleFormChange = (field: keyof UserProfile, value: any) => {
    let finalValue = value;
    if (field === 'mobileNumber') {
      finalValue = formatPhoneNumber(value);
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleAddressChange = (addressType: 'primaryAddress' | 'mailingAddress', field: keyof Address, value: string) => {
    setFormData(prev => ({
        ...prev,
        [addressType]: {
            ...(prev[addressType] || { country: '', street1: '', city: '', state: '', zip: '' }), // Ensure mailingAddress is not undefined
            [field]: value
        }
    }));
    const errorKey = `${addressType}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };
  
  const handleAddressBulkChange = (addressType: 'primaryAddress' | 'mailingAddress', parsedAddress: Partial<Address>) => {
    setFormData(prev => ({
        ...prev,
        [addressType]: {
            ...(prev[addressType] || { country: '', street1: '', city: '', state: '', zip: '' }),
            ...parsedAddress
        }
    }));
    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(parsedAddress).forEach(field => {
        const errorKey = `${addressType}.${field}`;
        if (newErrors[errorKey]) {
          delete newErrors[errorKey];
        }
      });
      return newErrors;
    });
  };

  const validate = () => {
    const newErrors: Record<string, any> = {};
    const sectionsToOpen: Partial<Record<keyof typeof openSections, boolean>> = {};

    // Contact Info
    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last name is required.';
    if (!formData.mobileNumber) {
        newErrors.mobileNumber = 'Mobile number is required.';
    } else {
        const digitCount = formData.mobileNumber.replace(/[^\d]/g, '').length;
        if (digitCount < 7) {
            newErrors.mobileNumber = 'Please enter a valid phone number (at least 7 digits).';
        }
    }

    // Primary Address
    const primaryAddrErrors: Record<string, string> = {};
    if (!formData.primaryAddress.country) primaryAddrErrors.country = 'Country is required.';
    if (!formData.primaryAddress.street1) primaryAddrErrors.street1 = 'Street 1 is required.';
    if (!formData.primaryAddress.city) primaryAddrErrors.city = 'City is required.';
    if (!formData.primaryAddress.state) primaryAddrErrors.state = 'State is required.';
    if (!formData.primaryAddress.zip) primaryAddrErrors.zip = 'ZIP code is required.';
    if (Object.keys(primaryAddrErrors).length > 0) newErrors.primaryAddress = primaryAddrErrors;

    // Additional Details
    if (!formData.employmentStartDate) newErrors.employmentStartDate = 'Employment start date is required.';
    if (!formData.eligibilityType) newErrors.eligibilityType = 'Eligibility type is required.';
    if (formData.householdIncome === '') newErrors.householdIncome = 'Household income is required.';
    if (formData.householdSize === '') newErrors.householdSize = 'Household size is required.';
    if (!formData.homeowner) newErrors.homeowner = 'Homeowner status is required.';
    
    // Mailing Address (if applicable)
    if (!formData.isMailingAddressSame) {
        const mailingAddrErrors: Record<string, string> = {};
        if (!formData.mailingAddress?.country) mailingAddrErrors.country = 'Country is required.';
        if (!formData.mailingAddress?.street1) mailingAddrErrors.street1 = 'Street 1 is required.';
        if (!formData.mailingAddress?.city) mailingAddrErrors.city = 'City is required.';
        if (!formData.mailingAddress?.state) mailingAddrErrors.state = 'State is required.';
        if (!formData.mailingAddress?.zip) mailingAddrErrors.zip = 'ZIP code is required.';
        if (Object.keys(mailingAddrErrors).length > 0) newErrors.mailingAddress = mailingAddrErrors;
    }

    // Consent
    if (!formData.ackPolicies) newErrors.ackPolicies = 'You must agree to the policies.';
    if (!formData.commConsent) newErrors.commConsent = 'You must consent to communications.';
    if (!formData.infoCorrect) newErrors.infoCorrect = 'You must confirm your information is correct.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
        if(newErrors.firstName || newErrors.lastName || newErrors.mobileNumber) sectionsToOpen.contact = true;
        if(newErrors.primaryAddress) sectionsToOpen.primaryAddress = true;
        if(newErrors.employmentStartDate || newErrors.eligibilityType || newErrors.householdIncome || newErrors.householdSize || newErrors.homeowner) sectionsToOpen.additionalDetails = true;
        if(newErrors.mailingAddress) sectionsToOpen.mailingAddress = true;
        if(newErrors.ackPolicies || newErrors.commConsent || newErrors.infoCorrect) sectionsToOpen.consent = true;
        setOpenSections(prev => ({ ...prev, ...sectionsToOpen }));
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onProfileUpdate(formData);
      alert('Profile saved!'); // Simple feedback
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('home')} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:opacity-80 mb-6">&larr; Back to Home</button>
      
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] text-center">Profile</h1>

      {/* Applications Section */}
        <section className="border-b border-[#005ca0] pb-4 mb-4">
            <button type="button" onClick={() => setIsApplicationsOpen(p => !p)} className="w-full flex justify-between items-center text-left py-2" aria-expanded={isApplicationsOpen}>
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">My Applications</h2>
                <ChevronIcon isOpen={isApplicationsOpen} />
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isApplicationsOpen ? 'max-h-[1000px] opacity-100 mt-4 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="bg-[#003a70]/50 p-4 rounded-lg mb-4 flex justify-around text-center border border-[#005ca0]">
                    <div>
                        <p className="text-sm text-gray-300 uppercase tracking-wider">12 Month Remaining</p>
                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">
                            ${twelveMonthRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-300 uppercase tracking-wider">Lifetime Remaining</p>
                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">
                            ${lifetimeRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                {applications.length > 0 ? (
                    <>
                        {sortedApplicationsForDisplay.map(app => (
                        <button key={app.id} onClick={() => setSelectedApplication(app)} className="w-full text-left bg-[#004b8d] p-4 rounded-md flex justify-between items-center hover:bg-[#005ca0]/50 transition-colors duration-200">
                            <div>
                            <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">{app.event}</p>
                            <p className="text-sm text-gray-300">Submitted: {app.submittedDate}</p>
                            </div>
                            <div className="text-right">
                            <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">${app.requestedAmount.toFixed(2)}</p>
                            <p className="text-sm text-gray-300">Status: <span className={`font-medium ${statusStyles[app.status]}`}>{app.status}</span></p>
                            </div>
                        </button>
                        ))}
                        <div className="flex justify-center pt-4">
                            <button 
                                onClick={() => navigate('apply')} 
                                className="bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-6 rounded-md transition-colors duration-200"
                            >
                                Apply Now
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 bg-[#003a70]/50 rounded-lg">
                        <p className="text-gray-300">You have not submitted any applications yet.</p>
                        <button onClick={() => navigate('apply')} className="mt-4 bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-4 rounded-md">
                        Apply Now
                        </button>
                    </div>
                )}
                </div>
            </div>
        </section>


      <form onSubmit={handleSave} className="space-y-4">
        {/* 1a Contact Information */}
        <fieldset className="border-b border-[#005ca0] pb-4">
            <button type="button" onClick={() => toggleSection('contact')} className="w-full flex justify-between items-center text-left py-2" aria-expanded={openSections.contact} aria-controls="contact-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Contact Information</h2>
                    {sectionHasErrors.contact && !openSections.contact && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.contact} />
            </button>
            <div id="contact-section" className={`transition-all duration-500 ease-in-out ${openSections.contact ? 'max-h-[1000px] opacity-100 mt-4 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <FormInput label="First Name" id="firstName" required value={formData.firstName} onChange={e => handleFormChange('firstName', e.target.value)} error={errors.firstName} />
                    <FormInput label="Middle Name(s)" id="middleName" value={formData.middleName || ''} onChange={e => handleFormChange('middleName', e.target.value)} />
                    <FormInput label="Last Name" id="lastName" required value={formData.lastName} onChange={e => handleFormChange('lastName', e.target.value)} error={errors.lastName} />
                    <FormInput label="Suffix" id="suffix" value={formData.suffix || ''} onChange={e => handleFormChange('suffix', e.target.value)} />
                    <FormInput label="Email" id="email" required value={formData.email} disabled />
                    <FormInput label="Mobile Number" id="mobileNumber" required value={formData.mobileNumber} onChange={e => handleFormChange('mobileNumber', e.target.value)} error={errors.mobileNumber} placeholder="(555) 555-5555" />
                </div>
            </div>
        </fieldset>

        {/* 1b Primary Address */}
        <fieldset className="border-b border-[#005ca0] pb-4">
            <button type="button" onClick={() => toggleSection('primaryAddress')} className="w-full flex justify-between items-center text-left py-2" aria-expanded={openSections.primaryAddress} aria-controls="address-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Primary Address</h2>
                    {sectionHasErrors.primaryAddress && !openSections.primaryAddress && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.primaryAddress} />
            </button>
            <div id="address-section" className={`transition-all duration-500 ease-in-out ${openSections.primaryAddress ? 'max-h-[1000px] opacity-100 mt-4 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="space-y-6 pt-4">
                    <AddressFields address={formData.primaryAddress} onUpdate={(field, value) => handleAddressChange('primaryAddress', field, value)} onBulkUpdate={(parsed) => handleAddressBulkChange('primaryAddress', parsed)} prefix="primary" errors={errors.primaryAddress || {}} />
                </div>
            </div>
        </fieldset>
        
        {/* 1c Additional Details */}
        <fieldset className="border-b border-[#005ca0] pb-4">
            <button type="button" onClick={() => toggleSection('additionalDetails')} className="w-full flex justify-between items-center text-left py-2" aria-expanded={openSections.additionalDetails} aria-controls="details-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Additional Details</h2>
                    {sectionHasErrors.additionalDetails && !openSections.additionalDetails && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.additionalDetails} />
            </button>
            <div id="details-section" className={`transition-all duration-500 ease-in-out ${openSections.additionalDetails ? 'max-h-[1000px] opacity-100 mt-4 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <FormInput type="date" label="Employment Start Date" id="employmentStartDate" required value={formData.employmentStartDate} onChange={e => handleFormChange('employmentStartDate', e.target.value)} error={errors.employmentStartDate} />
                    <SearchableSelector
                        label="Eligibility Type"
                        id="eligibilityType"
                        required
                        value={formData.eligibilityType}
                        options={employmentTypes}
                        onUpdate={value => handleFormChange('eligibilityType', value)}
                        variant="underline"
                        error={errors.eligibilityType}
                    />
                    <FormInput type="number" label="Estimated Annual Household Income" id="householdIncome" required value={formData.householdIncome} onChange={e => handleFormChange('householdIncome', parseFloat(e.target.value) || '')} error={errors.householdIncome} />
                    <FormInput type="number" label="Number of people in household" id="householdSize" required value={formData.householdSize} onChange={e => handleFormChange('householdSize', parseInt(e.target.value, 10) || '')} error={errors.householdSize} />
                    <FormRadioGroup legend="Do you own your own home?" name="homeowner" options={['Yes', 'No']} value={formData.homeowner} onChange={value => handleFormChange('homeowner', value)} required error={errors.homeowner} />
                    <SearchableSelector
                        label="Preferred Language"
                        id="preferredLanguage"
                        value={formData.preferredLanguage || ''}
                        options={languages}
                        onUpdate={value => handleFormChange('preferredLanguage', value)}
                        variant="underline"
                    />
                </div>
            </div>
        </fieldset>

        {/* 1d Mailing Address */}
        <fieldset className="border-b border-[#005ca0] pb-4">
            <button type="button" onClick={() => toggleSection('mailingAddress')} className="w-full flex justify-between items-center text-left py-2" aria-expanded={openSections.mailingAddress} aria-controls="mailing-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Mailing Address</h2>
                    {sectionHasErrors.mailingAddress && !openSections.mailingAddress && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.mailingAddress} />
            </button>
            <div id="mailing-section" className={`transition-all duration-500 ease-in-out ${openSections.mailingAddress ? 'max-h-[1000px] opacity-100 mt-4 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="space-y-4 pt-4">
                    <FormRadioGroup legend="Mailing Address Same as Primary?" name="isMailingAddressSame" options={['Yes', 'No']} value={formData.isMailingAddressSame ? 'Yes' : 'No'} onChange={value => handleFormChange('isMailingAddressSame', value === 'Yes')} />
                    {!formData.isMailingAddressSame && (
                        <div className="pt-4 mt-4 border-t border-[#002a50] space-y-6">
                            <AddressFields address={formData.mailingAddress || { country: '', street1: '', city: '', state: '', zip: '' }} onUpdate={(field, value) => handleAddressChange('mailingAddress', field, value)} onBulkUpdate={(parsed) => handleAddressBulkChange('mailingAddress', parsed)} prefix="mailing" errors={errors.mailingAddress || {}} />
                        </div>
                    )}
                </div>
            </div>
        </fieldset>

        {/* 1e Consent and Acknowledgement */}
        <fieldset className="pb-4">
            <button type="button" onClick={() => toggleSection('consent')} className="w-full flex justify-between items-center text-left py-2" aria-expanded={openSections.consent} aria-controls="consent-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Consent & Acknowledgement</h2>
                    {sectionHasErrors.consent && !openSections.consent && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.consent} />
            </button>
            <div id="consent-section" className={`transition-all duration-500 ease-in-out ${openSections.consent ? 'max-h-[1000px] opacity-100 mt-4 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="space-y-3 pt-4">
                     {errors.ackPolicies && <p className="text-red-400 text-xs">{errors.ackPolicies}</p>}
                    <div className="flex items-start">
                        <input type="checkbox" id="ackPolicies" required checked={formData.ackPolicies} onChange={e => handleFormChange('ackPolicies', e.target.checked)} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                        <label htmlFor="ackPolicies" className="flex items-center ml-3 text-sm text-white">I have read and agree to E4E Relief’s Privacy Policy and Cookie Policy. <RequiredIndicator required isMet={formData.ackPolicies} /></label>
                    </div>
                     {errors.commConsent && <p className="text-red-400 text-xs">{errors.commConsent}</p>}
                    <div className="flex items-start">
                        <input type="checkbox" id="commConsent" required checked={formData.commConsent} onChange={e => handleFormChange('commConsent', e.target.checked)} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                        <label htmlFor="commConsent" className="flex items-center ml-3 text-sm text-white">I consent to receive emails and text messages regarding my application. <RequiredIndicator required isMet={formData.commConsent} /></label>
                    </div>
                     {errors.infoCorrect && <p className="text-red-400 text-xs">{errors.infoCorrect}</p>}
                    <div className="flex items-start">
                        <input type="checkbox" id="infoCorrect" required checked={formData.infoCorrect} onChange={e => handleFormChange('infoCorrect', e.target.checked)} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                        <label htmlFor="infoCorrect" className="flex items-center ml-3 text-sm text-white">All information I have provided is accurate. <RequiredIndicator required isMet={formData.infoCorrect} /></label>
                    </div>
                </div>
            </div>
        </fieldset>

        <div className="flex justify-center pt-8 flex-col items-center">
            {Object.keys(errors).length > 0 && (
                <div className="bg-red-800/50 border border-red-600 text-red-200 p-4 rounded-md mb-4 w-full max-w-md text-sm">
                    <p className="font-bold">Please correct the highlighted errors before saving.</p>
                </div>
            )}
            <button type="submit" className="bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-8 rounded-md transition-colors duration-200">Save Changes</button>
        </div>
      </form>

      {selectedApplication && (
        <ApplicationDetailModal 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)} 
        />
      )}
    </div>
  );
};

export default ProfilePage;