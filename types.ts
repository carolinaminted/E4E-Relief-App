export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  ERROR = 'error',
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface Address {
  country: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface UserProfile {
  // 1a Contact Information
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string; // Stays as the unique identifier
  mobileNumber: string;

  // 1b Primary Address
  primaryAddress: Address;

  // 1c Additional Details
  employmentStartDate: string;
  eligibilityType: 'Full-time' | 'Part-time' | 'Contractor' | '';
  householdIncome: number | '';
  householdSize: number | '';
  homeowner: 'Yes' | 'No' | '';
  preferredLanguage?: string;

  // 1d Mailing Address
  isMailingAddressSame: boolean;
  mailingAddress?: Address;

  // 1e Consent and Acknowledgement
  ackPolicies: boolean;
  commConsent: boolean;
  infoCorrect: boolean;
}


export interface Application {
  id: string;
  // User profile snapshot at time of submission
  profileSnapshot: UserProfile;
  // --- Event Details
  event: string;
  requestedAmount: number;
  // --- Metadata
  submittedDate: string;
  status: 'Submitted' | 'Awarded' | 'Declined';
  // --- Agreements from final page
  shareStory: boolean;
  receiveAdditionalInfo: boolean;
}