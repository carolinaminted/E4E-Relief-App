export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  ERROR = 'error',
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// Fix: Define and export UserProfile interface to be shared across components.
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Application {
  id: string;
  hireDate: string;
  event: string;
  requestedAmount: number;
  submittedDate: string;
  status: 'Submitted';
}