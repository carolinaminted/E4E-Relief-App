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

export interface EventData {
    // 201
    event: string;
    // 202
    otherEvent?: string;
    // 203
    eventDate: string;
    // 204
    evacuated: 'Yes' | 'No' | '';
    // 205
    evacuatingFromPrimary: 'Yes' | 'No' | '';
    // 206
    evacuationReason?: string;
    // 207
    stayedWithFamilyOrFriend: 'Yes' | 'No' | '';
    // 208
    evacuationStartDate: string;
    // 209
    evacuationNights: number | '';
    // 210
    powerLoss: 'Yes' | 'No' | '';
    // 211
    powerLossDays: number | '';
    // 212
    additionalDetails?: string;
    requestedAmount: number;
}


export interface Application {
  id: string;
  // User profile snapshot at time of submission
  profileSnapshot: UserProfile;
  // --- Event Details
  event: string;
  otherEvent?: string;
  eventDate?: string;
  evacuated?: 'Yes' | 'No';
  evacuatingFromPrimary?: 'Yes' | 'No';
  evacuationReason?: string;
  stayedWithFamilyOrFriend?: 'Yes' | 'No';
  evacuationStartDate?: string;
  evacuationNights?: number;
  powerLoss?: 'Yes' | 'No';
  powerLossDays?: number;
  additionalDetails?: string;
  requestedAmount: number;
  // --- Metadata
  submittedDate: string;
  status: 'Submitted' | 'Awarded' | 'Declined';
  reasons?: string[]; // Reasons for the decision (e.g., for Decline or Review)
  decisionedDate: string;
  twelveMonthGrantRemaining: number;
  lifetimeGrantRemaining: number;
  // --- Agreements from final page
  shareStory: boolean;
  receiveAdditionalInfo: boolean;
}

export interface ApplicationFormData {
  profileData: UserProfile;
  eventData: EventData;
  agreementData: {
    shareStory: boolean | null;
    receiveAdditionalInfo: boolean | null;
  };
}

export interface EligibilityDecision {
  decision: 'Approved' | 'Denied' | 'Review';
  reasons: string[];
  policy_hits: { rule_id: string; passed: boolean; detail: string }[];
  recommended_award: number;
  remaining_12mo: number;
  remaining_lifetime: number;
  normalized: {
    event: string;
    eventDate: string;
    evacuated: 'Yes' | 'No' | '';
    powerLossDays: number;
  };
  decisionedDate: string;
}

// --- Token Usage Analytics Types ---

export interface TokenEvent {
  id: string;
  sessionId: string;
  userId: string; // Corresponds to UserProfile.email
  timestamp: string; // ISO 8601
  feature: 'AI Assistant' | 'Address Parsing' | 'Application Parsing' | 'Final Decision';
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  environment: 'Production' | 'Development';
  account: string; // Could be a tenant ID
}

export interface TokenUsageTableRow {
  user: string;
  session: string;
  input: number;
  cached: number;
  output: number;
  total: number;
  cost: number;
}

export interface TopSessionData {
  sessionId: string;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface DailyUsageData {
  date: string; // YYYY-MM-DD
  totalTokens: number;
}

export interface ModelPricing {
  [modelName: string]: {
    input: number; // Cost per 1000 tokens
    output: number; // Cost per 1000 tokens
  };
}

export interface TokenUsageFilters {
    account: string;
    dateRange: { start: string, end: string };
    feature: string;
    user: string;
    model: string;
    environment: string;
}