import React, { useState } from 'react';
import type { UserProfile, Address } from '../types';
import CountrySelector from './CountrySelector';
import AddressHelper from './AddressHelper';
import SearchableSelector from './SearchableSelector';
import { employmentTypes, languages } from '../data/appData';

interface ApplyContactPageProps {
  formData: UserProfile;
  updateFormData: (data: Partial<UserProfile>) => void;
  nextStep: () => void;
}

// Re-usable form components with updated styling
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, required?: boolean, error?: string }> = ({ label, id, required, error, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input id={id} {...props} className={`w-full bg-transparent border-0 border-b p-2 text-white focus:outline-none focus:ring-0 ${error ? 'border-red-500' : 'border-[#005ca0] focus:border-[#ff8400]'} disabled:bg-transparent disabled:border-b disabled:border-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed`} />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);


const FormRadioGroup: React.FC<{ legend: string, name: string, options: string[], value: string, onChange: (value: any) => void, required?: boolean, error?: string }> = ({ legend, name, options, value, onChange, required, error }) => (
    <div>
        <p className={`block text-sm font-medium text-white mb-1 ${error ? 'text-red-400' : ''}`}>
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
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);


const AddressFields: React.FC<{ address: Address, onUpdate: (field: keyof Address, value: string) => void, onBulkUpdate: (parsedAddress: Partial<Address>) => void, prefix: string, errors: Record<string, string> }> = ({ address, onUpdate, onBulkUpdate, prefix, errors }) => (
    <>
        <AddressHelper onAddressParsed={onBulkUpdate} variant="underline" />
        <CountrySelector id={`${prefix}Country`} required value={address.country} onUpdate={value => onUpdate('country', value)} variant="underline" error={errors.country} />
        <FormInput label="Street 1" id={`${prefix}Street1`} required value={address.street1} onChange={e => onUpdate('street1', e.target.value)} error={errors.street1} />
        <FormInput label="Street 2" id={`${prefix}Street2`} value={address.street2 || ''} onChange={e => onUpdate('street2', e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="City" id={`${prefix}City`} required value={address.city} onChange={e => onUpdate('city', e.target.value)} error={errors.city} />
            <FormInput label="State or Province" id={`${prefix}State`} required value={address.state} onChange={e => onUpdate('state', e.target.value)} error={errors.state} />
            <FormInput label="ZIP/Postal Code" id={`${prefix}Zip`} required value={address.zip} onChange={e => onUpdate('zip', e.target.value)} error={errors.zip} />
        </div>
    </>
);

const ApplyContactPage: React.FC<ApplyContactPageProps> = ({ formData, updateFormData, nextStep }) => {
  const [errors, setErrors] = useState<Record<string, any>>({});
  
  const handleFormUpdate = (data: Partial<UserProfile>) => {
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

  const handleAddressChange = (addressType: 'primaryAddress' | 'mailingAddress', field: keyof Address, value: string) => {
    const updatedAddress = {
        ...(formData[addressType] || { country: '', street1: '', city: '', state: '', zip: '' }),
        [field]: value
    };
    updateFormData({ [addressType]: updatedAddress });

    const errorKey = `${addressType}.${field}`;
     if (errors[addressType]?.[field]) {
        setErrors(prev => {
            const newAddrErrors = { ...prev[addressType] };
            delete newAddrErrors[field];
            return { ...prev, [addressType]: newAddrErrors };
        });
    }
  };

  const handleAddressBulkChange = (addressType: 'primaryAddress' | 'mailingAddress', parsedAddress: Partial<Address>) => {
    updateFormData({
        [addressType]: {
            ...(formData[addressType] || { country: '', street1: '', city: '', state: '', zip: '' }),
            ...parsedAddress,
        }
    });
     // Clear related errors
    if (errors[addressType]) {
        setErrors(prev => ({...prev, [addressType]: {}}));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, any> = {};

    // Contact Info
    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last name is required.';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required.';

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
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  return (
    <div className="space-y-10">
        
        {/* 1a Contact Information */}
        <section>
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4 border-b border-[#005ca0] pb-2">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <FormInput label="First Name" id="firstName" required value={formData.firstName} onChange={e => handleFormUpdate({ firstName: e.target.value })} error={errors.firstName} />
            <FormInput label="Middle Name(s)" id="middleName" value={formData.middleName || ''} onChange={e => handleFormUpdate({ middleName: e.target.value })} />
            <FormInput label="Last Name" id="lastName" required value={formData.lastName} onChange={e => handleFormUpdate({ lastName: e.target.value })} error={errors.lastName} />
            <FormInput label="Suffix" id="suffix" value={formData.suffix || ''} onChange={e => handleFormUpdate({ suffix: e.target.value })} />
            <FormInput label="Email" id="email" required value={formData.email} disabled />
            <FormInput label="Mobile Number" id="mobileNumber" required value={formData.mobileNumber} onChange={e => handleFormUpdate({ mobileNumber: e.target.value })} error={errors.mobileNumber} />
          </div>
        </section>

        {/* 1b Primary Address */}
        <section>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4 border-b border-[#005ca0] pb-2">
                Primary Address
            </h2>
            <div className="space-y-6 pt-4">
                <AddressFields address={formData.primaryAddress} onUpdate={(field, value) => handleAddressChange('primaryAddress', field, value)} onBulkUpdate={(parsed) => handleAddressBulkChange('primaryAddress', parsed)} prefix="primary" errors={errors.primaryAddress || {}} />
            </div>
        </section>
        
        {/* 1c Additional Details */}
        <section>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4 border-b border-[#005ca0] pb-2">
                Additional Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <FormInput type="date" label="Employment Start Date" id="employmentStartDate" required value={formData.employmentStartDate} onChange={e => handleFormUpdate({ employmentStartDate: e.target.value })} error={errors.employmentStartDate} />
                <SearchableSelector
                    label="Eligibility Type"
                    id="eligibilityType"
                    required
                    value={formData.eligibilityType}
                    options={employmentTypes}
                    onUpdate={value => handleFormUpdate({ eligibilityType: value as UserProfile['eligibilityType'] })}
                    variant="underline"
                    error={errors.eligibilityType}
                />
                <FormInput type="number" label="Estimated Annual Household Income" id="householdIncome" required value={formData.householdIncome} onChange={e => handleFormUpdate({ householdIncome: parseFloat(e.target.value) || '' })} error={errors.householdIncome} />
                <FormInput type="number" label="Number of people in household" id="householdSize" required value={formData.householdSize} onChange={e => handleFormUpdate({ householdSize: parseInt(e.target.value, 10) || '' })} error={errors.householdSize} />
                <FormRadioGroup legend="Do you own your own home?" name="homeowner" options={['Yes', 'No']} value={formData.homeowner} onChange={value => handleFormUpdate({ homeowner: value })} required error={errors.homeowner} />
                <SearchableSelector
                    label="Preferred Language"
                    id="preferredLanguage"
                    value={formData.preferredLanguage || ''}
                    options={languages}
                    onUpdate={value => handleFormUpdate({ preferredLanguage: value })}
                    variant="underline"
                />
            </div>
        </section>

        {/* 1d Mailing Address */}
        <section>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4 border-b border-[#005ca0] pb-2">
                Mailing Address
            </h2>
            <div className="space-y-4 pt-4">
              <FormRadioGroup legend="Mailing Address Same as Primary?" name="isMailingAddressSame" options={['Yes', 'No']} value={formData.isMailingAddressSame ? 'Yes' : 'No'} onChange={value => handleFormUpdate({ isMailingAddressSame: value === 'Yes' })} />
              {!formData.isMailingAddressSame && (
                  <div className="pt-4 mt-4 border-t border-[#002a50] space-y-6">
                  <AddressFields address={formData.mailingAddress || { country: '', street1: '', city: '', state: '', zip: '' }} onUpdate={(field, value) => handleAddressChange('mailingAddress', field, value)} onBulkUpdate={(parsed) => handleAddressBulkChange('mailingAddress', parsed)} prefix="mailing" errors={errors.mailingAddress || {}}/>
                  </div>
              )}
            </div>
        </section>

        {/* 1e Consent and Acknowledgement */}
        <section>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4 border-b border-[#005ca0] pb-2">
                Consent & Acknowledgement
            </h2>
            <div className="space-y-3 pt-4">
                {errors.ackPolicies && <p className="text-red-400 text-xs">{errors.ackPolicies}</p>}
                <div className="flex items-start">
                    <input type="checkbox" id="ackPolicies" required checked={formData.ackPolicies} onChange={e => handleFormUpdate({ ackPolicies: e.target.checked })} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                    <label htmlFor="ackPolicies" className="ml-3 text-sm text-white">I have read and agree to E4E Relief’s Privacy Policy and Cookie Policy. <span className="text-red-400">*</span></label>
                </div>
                 {errors.commConsent && <p className="text-red-400 text-xs">{errors.commConsent}</p>}
                <div className="flex items-start">
                    <input type="checkbox" id="commConsent" required checked={formData.commConsent} onChange={e => handleFormUpdate({ commConsent: e.target.checked })} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                    <label htmlFor="commConsent" className="ml-3 text-sm text-white">I consent to receive emails and text messages regarding my application. <span className="text-red-400">*</span></label>
                </div>
                 {errors.infoCorrect && <p className="text-red-400 text-xs">{errors.infoCorrect}</p>}
                <div className="flex items-start">
                    <input type="checkbox" id="infoCorrect" required checked={formData.infoCorrect} onChange={e => handleFormUpdate({ infoCorrect: e.target.checked })} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                    <label htmlFor="infoCorrect" className="ml-3 text-sm text-white">All information I have provided is accurate. <span className="text-red-400">*</span></label>
                </div>
            </div>
        </section>
      
      <div className="flex justify-end pt-4">
        <button onClick={handleNext} className="bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-6 rounded-md transition-colors duration-200">
          Next
        </button>
      </div>
    </div>
  );
};

export default ApplyContactPage;