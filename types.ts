export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  ERROR = 'error',
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Application {
  id: string;
  // User info at time of submission
  firstName: string;
  lastName: string;
  email: string;
  // ---
  hireDate: string;
  event: string;
  requestedAmount: number;
  submittedDate: string;
  status: 'Submitted' | 'Awarded' | 'Declined';
  // New fields
  shareStory: boolean;
  receiveAdditionalInfo: boolean;
}
