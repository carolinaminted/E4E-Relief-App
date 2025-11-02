import React, { useState, useMemo } from 'react';
import type { Application, UserProfile, Address } from '../types';
import ApplicationDetailModal from './ApplicationDetailModal';

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
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, required?: boolean }> = ({ label, id, required, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input id={id} {...props} className="w-full bg-[#005ca0] border border-[#005ca0] rounded-md p-2 text-white disabled:bg-[#003a70] disabled:text-gray-400 disabled:cursor-not-allowed" />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, required?: boolean, children: React.ReactNode }> = ({ label, id, required, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <select id={id} {...props} className="w-full bg-[#005ca0] border border-[#005ca0] rounded-md p-2 text-white">
            {children}
        </select>
    </div>
);

const FormRadioGroup: React.FC<{ legend: string, name: string, options: string[], value: string, onChange: (value: any) => void, required?: boolean }> = ({ legend, name, options, value, onChange, required }) => (
    <div>
        <p className="block text-sm font-medium text-white mb-1">
            {legend} {required && <span className="text-red-400">*</span>}
        </p>
        <div className="flex gap-4 mt-2">
            {options.map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                    <input type="radio" name={name} value={option} checked={value === option} onChange={(e) => onChange(e.target.value)} className="form-radio h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 focus:ring-[#ff8400]" />
                    <span className="ml-2 text-white">{option}</span>
                </label>
            ))}
        </div>
    </div>
);

const AddressFields: React.FC<{ address: Address, onUpdate: (field: keyof Address, value: string) => void, prefix: string }> = ({ address, onUpdate, prefix }) => (
    <>
        <FormInput label="Location" id={`${prefix}Country`} required value={address.country} onChange={e => onUpdate('country', e.target.value)} />
        <FormInput label="Street 1" id={`${prefix}Street1`} required value={address.street1} onChange={e => onUpdate('street1', e.target.value)} />
        <FormInput label="Street 2" id={`${prefix}Street2`} value={address.street2 || ''} onChange={e => onUpdate('street2', e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="City" id={`${prefix}City`} required value={address.city} onChange={e => onUpdate('city', e.target.value)} />
            <FormInput label="State or Province" id={`${prefix}State`} required value={address.state} onChange={e => onUpdate('state', e.target.value)} />
            <FormInput label="ZIP/Postal Code" id={`${prefix}Zip`} required value={address.zip} onChange={e => onUpdate('zip', e.target.value)} />
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
  const [errors, setErrors] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState({
    contact: true, // Expanded by default
    primaryAddress: false,
    additionalDetails: false,
    mailingAddress: false,
    consent: false,
  });

  const sectionValidation = useMemo(() => {
    const isContactInvalid = !formData.firstName || !formData.lastName || !formData.mobileNumber;
    const isPrimaryAddressInvalid = !formData.primaryAddress.country || !formData.primaryAddress.street1 || !formData.primaryAddress.city || !formData.primaryAddress.state || !formData.primaryAddress.zip;
    const isAdditionalDetailsInvalid = !formData.employmentStartDate || !formData.eligibilityType || formData.householdIncome === '' || formData.householdSize === '' || !formData.homeowner;
    let isMailingAddressInvalid = false;
    if (!formData.isMailingAddressSame) {
        isMailingAddressInvalid = !formData.mailingAddress || !formData.mailingAddress.country || !formData.mailingAddress.street1 || !formData.mailingAddress.city || !formData.mailingAddress.state || !formData.mailingAddress.zip;
    }
    const isConsentInvalid = !formData.ackPolicies || !formData.commConsent || !formData.infoCorrect;

    return {
        contact: isContactInvalid,
        primaryAddress: isPrimaryAddressInvalid,
        additionalDetails: isAdditionalDetailsInvalid,
        mailingAddress: isMailingAddressInvalid,
        consent: isConsentInvalid,
    };
  }, [formData]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };


  const handleFormChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddressChange = (addressType: 'primaryAddress' | 'mailingAddress', field: keyof Address, value: string) => {
    setFormData(prev => ({
        ...prev,
        [addressType]: {
            ...(prev[addressType] || { country: '', street1: '', city: '', state: '', zip: '' }), // Ensure mailingAddress is not undefined
            [field]: value
        }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];
    const sectionsToOpen: Partial<Record<keyof typeof openSections, boolean>> = {};

    if (sectionValidation.contact) {
        newErrors.push('Please fill all required fields in Contact Information.');
        sectionsToOpen.contact = true;
    }
    if (sectionValidation.primaryAddress) {
        newErrors.push('Please fill all required fields in Primary Address.');
        sectionsToOpen.primaryAddress = true;
    }
    if (sectionValidation.additionalDetails) {
        newErrors.push('Please fill all required fields in Additional Details.');
        sectionsToOpen.additionalDetails = true;
    }
    if (sectionValidation.mailingAddress) {
        newErrors.push('Please fill all required fields in Mailing Address.');
        sectionsToOpen.mailingAddress = true;
    }
    if (sectionValidation.consent) {
        newErrors.push('You must agree to all consents and acknowledgements.');
        sectionsToOpen.consent = true;
    }

    setErrors(newErrors);

    if (newErrors.length > 0) {
        setOpenSections(prev => ({ ...prev, ...sectionsToOpen }));
        return;
    }

    onProfileUpdate(formData);
    alert('Profile saved!'); // Simple feedback
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('home')} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:opacity-80 mb-6">&larr; Back to Home</button>
      
      {/* Applications Section */}
      <section className="bg-[#004b8d] p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] text-center border-b border-[#005ca0] pb-3">My Applications</h2>
        <div className="space-y-4 pt-4">
          {applications.length > 0 ? (
            applications.map(app => (
              <button key={app.id} onClick={() => setSelectedApplication(app)} className="w-full text-left bg-[#005ca0] p-4 rounded-md flex justify-between items-center hover:bg-[#005ca0]/50 transition-colors duration-200">
                <div>
                  <p className="font-bold text-lg">{app.event}</p>
                  <p className="text-sm text-gray-300">Submitted: {app.submittedDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">${app.requestedAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-300">Status: <span className={`font-medium ${statusStyles[app.status]}`}>{app.status}</span></p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 bg-[#003a70]/50 rounded-lg">
                <p className="text-gray-300">You have not submitted any applications yet.</p>
                <button onClick={() => navigate('apply')} className="mt-4 bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-4 rounded-md">
                Apply Now
                </button>
            </div>
          )}
        </div>
      </section>

      <form onSubmit={handleSave}>
        {/* 1a Contact Information */}
        <fieldset className="bg-[#004b8d] p-6 rounded-lg shadow-lg mb-8">
            <button type="button" onClick={() => toggleSection('contact')} className="w-full flex justify-between items-center text-left" aria-expanded={openSections.contact} aria-controls="contact-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Contact Information</h2>
                    {sectionValidation.contact && !openSections.contact && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.contact} />
            </button>
            <div id="contact-section" className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.contact ? 'max-h-[1000px] opacity-100 mt-6 pt-6 border-t border-[#005ca0]' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="First Name" id="firstName" required value={formData.firstName} onChange={e => handleFormChange('firstName', e.target.value)} />
                    <FormInput label="Middle Name(s)" id="middleName" value={formData.middleName || ''} onChange={e => handleFormChange('middleName', e.target.value)} />
                    <FormInput label="Last Name" id="lastName" required value={formData.lastName} onChange={e => handleFormChange('lastName', e.target.value)} />
                    <FormInput label="Suffix" id="suffix" value={formData.suffix || ''} onChange={e => handleFormChange('suffix', e.target.value)} />
                    <FormInput label="Email" id="email" required value={formData.email} disabled />
                    <FormInput label="Mobile Number" id="mobileNumber" required value={formData.mobileNumber} onChange={e => handleFormChange('mobileNumber', e.target.value)} />
                </div>
            </div>
        </fieldset>

        {/* 1b Primary Address */}
        <fieldset className="bg-[#004b8d] p-6 rounded-lg shadow-lg mb-8">
            <button type="button" onClick={() => toggleSection('primaryAddress')} className="w-full flex justify-between items-center text-left" aria-expanded={openSections.primaryAddress} aria-controls="address-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Primary Address</h2>
                    {sectionValidation.primaryAddress && !openSections.primaryAddress && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.primaryAddress} />
            </button>
            <div id="address-section" className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.primaryAddress ? 'max-h-[1000px] opacity-100 mt-6 pt-6 border-t border-[#005ca0]' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4">
                    <AddressFields address={formData.primaryAddress} onUpdate={(field, value) => handleAddressChange('primaryAddress', field, value)} prefix="primary" />
                </div>
            </div>
        </fieldset>
        
        {/* 1c Additional Details */}
        <fieldset className="bg-[#004b8d] p-6 rounded-lg shadow-lg mb-8">
            <button type="button" onClick={() => toggleSection('additionalDetails')} className="w-full flex justify-between items-center text-left" aria-expanded={openSections.additionalDetails} aria-controls="details-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Additional Details</h2>
                    {sectionValidation.additionalDetails && !openSections.additionalDetails && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.additionalDetails} />
            </button>
            <div id="details-section" className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.additionalDetails ? 'max-h-[1000px] opacity-100 mt-6 pt-6 border-t border-[#005ca0]' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput type="date" label="Employment Start Date" id="employmentStartDate" required value={formData.employmentStartDate} onChange={e => handleFormChange('employmentStartDate', e.target.value)} />
                    <FormSelect label="Eligibility Type" id="eligibilityType" required value={formData.eligibilityType} onChange={e => handleFormChange('eligibilityType', e.target.value)}>
                        <option value="" disabled>Select...</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contractor">Contractor</option>
                    </FormSelect>
                    <FormInput type="number" label="Estimated Annual Household Income" id="householdIncome" required value={formData.householdIncome} onChange={e => handleFormChange('householdIncome', parseFloat(e.target.value) || '')} />
                    <FormInput type="number" label="Number of people in household" id="householdSize" required value={formData.householdSize} onChange={e => handleFormChange('householdSize', parseInt(e.target.value, 10) || '')} />
                    <FormRadioGroup legend="Do you own your own home?" name="homeowner" options={['Yes', 'No']} value={formData.homeowner} onChange={value => handleFormChange('homeowner', value)} required />
                    <FormSelect label="Preferred Language" id="preferredLanguage" value={formData.preferredLanguage || 'English'} onChange={e => handleFormChange('preferredLanguage', e.target.value)}>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                    </FormSelect>
                </div>
            </div>
        </fieldset>

        {/* 1d Mailing Address */}
        <fieldset className="bg-[#004b8d] p-6 rounded-lg shadow-lg mb-8">
            <button type="button" onClick={() => toggleSection('mailingAddress')} className="w-full flex justify-between items-center text-left" aria-expanded={openSections.mailingAddress} aria-controls="mailing-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Mailing Address</h2>
                    {sectionValidation.mailingAddress && !openSections.mailingAddress && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.mailingAddress} />
            </button>
            <div id="mailing-section" className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.mailingAddress ? 'max-h-[1000px] opacity-100 mt-6 pt-6 border-t border-[#005ca0]' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4">
                    <FormRadioGroup legend="Mailing Address Same as Primary?" name="isMailingAddressSame" options={['Yes', 'No']} value={formData.isMailingAddressSame ? 'Yes' : 'No'} onChange={value => handleFormChange('isMailingAddressSame', value === 'Yes')} />
                    {!formData.isMailingAddressSame && (
                        <div className="pt-4 mt-4 border-t border-[#002a50] space-y-4">
                            <AddressFields address={formData.mailingAddress || { country: '', street1: '', city: '', state: '', zip: '' }} onUpdate={(field, value) => handleAddressChange('mailingAddress', field, value)} prefix="mailing" />
                        </div>
                    )}
                </div>
            </div>
        </fieldset>

        {/* 1e Consent and Acknowledgement */}
        <fieldset className="bg-[#004b8d] p-6 rounded-lg shadow-lg mb-8">
            <button type="button" onClick={() => toggleSection('consent')} className="w-full flex justify-between items-center text-left" aria-expanded={openSections.consent} aria-controls="consent-section">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Consent and Acknowledgement</h2>
                    {sectionValidation.consent && !openSections.consent && <NotificationIcon />}
                </div>
                <ChevronIcon isOpen={openSections.consent} />
            </button>
            <div id="consent-section" className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections.consent ? 'max-h-[1000px] opacity-100 mt-6 pt-6 border-t border-[#005ca0]' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4">
                    <div className="flex items-start">
                        <input type="checkbox" id="ackPolicies" required checked={formData.ackPolicies} onChange={e => handleFormChange('ackPolicies', e.target.checked)} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                        <label htmlFor="ackPolicies" className="ml-3 text-sm text-white">I have read and agree to E4E Relief’s Privacy Policy and Cookie Policy. <span className="text-red-400">*</span></label>
                    </div>
                    <div className="flex items-start">
                        <input type="checkbox" id="commConsent" required checked={formData.commConsent} onChange={e => handleFormChange('commConsent', e.target.checked)} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                        <label htmlFor="commConsent" className="ml-3 text-sm text-white">I consent to receive emails and text messages regarding my application. <span className="text-red-400">*</span></label>
                    </div>
                    <div className="flex items-start">
                        <input type="checkbox" id="infoCorrect" required checked={formData.infoCorrect} onChange={e => handleFormChange('infoCorrect', e.target.checked)} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                        <label htmlFor="infoCorrect" className="ml-3 text-sm text-white">All information I have provided is accurate. <span className="text-red-400">*</span></label>
                    </div>
                </div>
            </div>
        </fieldset>

        <div className="flex justify-center mt-8 flex-col items-center">
            {errors.length > 0 && (
                <div className="bg-red-800/50 border border-red-600 text-red-200 p-4 rounded-md mb-4 w-full max-w-md text-sm">
                    <p className="font-bold mb-2">Please correct the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => <li key={index}>{error}</li>)}
                    </ul>
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