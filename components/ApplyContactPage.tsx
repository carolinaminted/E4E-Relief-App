import React from 'react';
import type { UserProfile, Address } from '../types';

interface ApplyContactPageProps {
  formData: UserProfile;
  updateFormData: (data: Partial<UserProfile>) => void;
  nextStep: () => void;
}

// Re-usable form components to avoid repetition
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

const ApplyContactPage: React.FC<ApplyContactPageProps> = ({ formData, updateFormData, nextStep }) => {
  
  const handleAddressChange = (addressType: 'primaryAddress' | 'mailingAddress', field: keyof Address, value: string) => {
    updateFormData({
        [addressType]: {
            ...formData[addressType],
            [field]: value
        }
    });
  };

  return (
    <div className="space-y-8">
        
        {/* 1a Contact Information */}
        <div className="relative border border-[#005ca0] rounded-lg p-4 pt-6">
          <h2 className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#004b8d] px-2 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] whitespace-nowrap">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="First Name" id="firstName" required value={formData.firstName} onChange={e => updateFormData({ firstName: e.target.value })} />
            <FormInput label="Middle Name(s)" id="middleName" value={formData.middleName || ''} onChange={e => updateFormData({ middleName: e.target.value })} />
            <FormInput label="Last Name" id="lastName" required value={formData.lastName} onChange={e => updateFormData({ lastName: e.target.value })} />
            <FormInput label="Suffix" id="suffix" value={formData.suffix || ''} onChange={e => updateFormData({ suffix: e.target.value })} />
            <FormInput label="Email" id="email" required value={formData.email} disabled />
            <FormInput label="Mobile Number" id="mobileNumber" required value={formData.mobileNumber} onChange={e => updateFormData({ mobileNumber: e.target.value })} />
          </div>
        </div>

        {/* 1b Primary Address */}
        <div className="relative border border-[#005ca0] rounded-lg p-4 pt-6">
            <h2 className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#004b8d] px-2 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] whitespace-nowrap">
                Primary Address
            </h2>
            <div className="space-y-4">
                <AddressFields address={formData.primaryAddress} onUpdate={(field, value) => handleAddressChange('primaryAddress', field, value)} prefix="primary" />
            </div>
        </div>
        
        {/* 1c Additional Details */}
        <div className="relative border border-[#005ca0] rounded-lg p-4 pt-6">
            <h2 className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#004b8d] px-2 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] whitespace-nowrap">
                Additional Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput type="date" label="Employment Start Date" id="employmentStartDate" required value={formData.employmentStartDate} onChange={e => updateFormData({ employmentStartDate: e.target.value })} />
                <FormSelect label="Eligibility Type" id="eligibilityType" required value={formData.eligibilityType} onChange={e => updateFormData({ eligibilityType: e.target.value as UserProfile['eligibilityType'] })}>
                    <option value="" disabled>Select...</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contractor">Contractor</option>
                </FormSelect>
                <FormInput type="number" label="Estimated Annual Household Income" id="householdIncome" required value={formData.householdIncome} onChange={e => updateFormData({ householdIncome: parseFloat(e.target.value) || '' })} />
                <FormInput type="number" label="Number of people in household" id="householdSize" required value={formData.householdSize} onChange={e => updateFormData({ householdSize: parseInt(e.target.value, 10) || '' })} />
                <FormRadioGroup legend="Do you own your own home?" name="homeowner" options={['Yes', 'No']} value={formData.homeowner} onChange={value => updateFormData({ homeowner: value })} required />
                <FormSelect label="Preferred Language" id="preferredLanguage" value={formData.preferredLanguage || 'English'} onChange={e => updateFormData({ preferredLanguage: e.target.value as UserProfile['preferredLanguage'] })}>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                </FormSelect>
            </div>
        </div>

        {/* 1d Mailing Address */}
        <div className="relative border border-[#005ca0] rounded-lg p-4 pt-6">
            <h2 className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#004b8d] px-2 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] whitespace-nowrap">
                Mailing Address
            </h2>
            <div className="space-y-4">
              <FormRadioGroup legend="Mailing Address Same as Primary?" name="isMailingAddressSame" options={['Yes', 'No']} value={formData.isMailingAddressSame ? 'Yes' : 'No'} onChange={value => updateFormData({ isMailingAddressSame: value === 'Yes' })} />
              {!formData.isMailingAddressSame && (
                  <div className="pt-4 mt-4 border-t border-[#002a50] space-y-4">
                  <AddressFields address={formData.mailingAddress || { country: '', street1: '', city: '', state: '', zip: '' }} onUpdate={(field, value) => handleAddressChange('mailingAddress', field, value)} prefix="mailing" />
                  </div>
              )}
            </div>
        </div>

        {/* 1e Consent and Acknowledgement */}
        <div className="relative border border-[#005ca0] rounded-lg p-4 pt-6">
            <h2 className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#004b8d] px-2 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] whitespace-nowrap">
                Consent & Acknowledgement
            </h2>
            <div className="space-y-3">
                <div className="flex items-start">
                    <input type="checkbox" id="ackPolicies" required checked={formData.ackPolicies} onChange={e => updateFormData({ ackPolicies: e.target.checked })} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                    <label htmlFor="ackPolicies" className="ml-3 text-sm text-white">I have read and agree to E4E Relief’s Privacy Policy and Cookie Policy. <span className="text-red-400">*</span></label>
                </div>
                <div className="flex items-start">
                    <input type="checkbox" id="commConsent" required checked={formData.commConsent} onChange={e => updateFormData({ commConsent: e.target.checked })} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                    <label htmlFor="commConsent" className="ml-3 text-sm text-white">I consent to receive emails and text messages regarding my application. <span className="text-red-400">*</span></label>
                </div>
                <div className="flex items-start">
                    <input type="checkbox" id="infoCorrect" required checked={formData.infoCorrect} onChange={e => updateFormData({ infoCorrect: e.target.checked })} className="h-4 w-4 text-[#ff8400] bg-gray-700 border-gray-600 rounded focus:ring-[#ff8400] mt-1" />
                    <label htmlFor="infoCorrect" className="ml-3 text-sm text-white">All information I have provided is accurate. <span className="text-red-400">*</span></label>
                </div>
            </div>
        </div>
      
      <div className="flex justify-end pt-4">
        <button onClick={nextStep} className="bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-6 rounded-md transition-colors duration-200">
          Next
        </button>
      </div>
    </div>
  );
};

export default ApplyContactPage;