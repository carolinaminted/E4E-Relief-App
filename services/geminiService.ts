
import { GoogleGenAI, Chat } from "@google/genai";
import type { Application } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const applicationContext = `
You are the E4E Relief Assistant, an expert AI chatbot for the 'E4E Relief POC' application. Your primary goal is to provide helpful, accurate, and context-aware information to users about the app.

Here is the essential information about the application:

- **Main Purpose**: The app allows users to apply for financial assistance during times of need.
- **Key Pages**: The app has a Home page, an Apply page, a Profile page, and a Support page.

- **"Apply for Relief" Form Questions**: When a user fills out an application, they MUST provide the following three pieces of information:
  1.  **Hire Date**: The date the user was hired.
  2.  **Event**: The reason for the aid request. Available options are "Flood", "Tornado", "Tropical Storm/Hurricane", and "Wildfire".
  3.  **Requested Relief Payment**: The specific dollar amount the user is requesting.

- **Support Page Information**:
  - **Support Email**: support@e4erelief.example
  - **Support Phone**: (800) 555-0199

When a user asks a question, you MUST use the information above to form your answer.

**Example Scenario**:
- If a user asks: "What questions are on the application?"
- Your correct response should be: "The application asks for your Hire Date, the Event or reason for the request (like a Flood or Wildfire), and the Requested Relief Payment amount."
`;


export function createChatSession(): Chat {
  const model = 'gemini-2.5-flash';
  return ai.chats.create({
    model: model,
    config: {
      systemInstruction: applicationContext,
    },
  });
}

export async function evaluateApplicationEligibility(appData: Omit<Application, 'status' | 'submittedDate'>): Promise<'Awarded' | 'Declined'> {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  const prompt = `
    Analyze the following application details based on the strict eligibility rules and return only a single word: "Awarded" or "Declained". Do not provide any other text or explanation.

    **Eligibility Rules:**
    1. Event: Must be exactly "Tornado" or "Flood".
    2. Hire Date: Must be a date on or before today's date (${today}).
    3. Requested Amount: Must be less than or equal to 10000.

    **Applicant Details:**
    - Application ID: ${appData.id}
    - Hire Date: ${appData.hireDate}
    - Event: ${appData.event}
    - Requested Amount: ${appData.requestedAmount}

    **Decision:**
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    const decision = response.text.trim();
    if (decision === 'Awarded' || decision === 'Declined') {
      return decision;
    }
    // Fallback if the model returns unexpected text
    return 'Declined';
  } catch (error) {
    console.error("AI eligibility check failed:", error);
    // Default to a safe status in case of API error
    return 'Declined';
  }
}
