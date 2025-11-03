
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import type { Application, Address, UserProfile, ApplicationFormData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const addressSchema = {
    type: Type.OBJECT,
    properties: {
        country: { type: Type.STRING, description: "The country of the address." },
        street1: { type: Type.STRING, description: "The primary street line of the address." },
        street2: { type: Type.STRING, description: "The secondary street line (e.g., apartment number)." },
        city: { type: Type.STRING, description: "The city of the address." },
        state: { type: Type.STRING, description: "The state or province of the address." },
        zip: { type: Type.STRING, description: "The ZIP or postal code of the address." },
    }
};

const updateUserProfileTool: FunctionDeclaration = {
  name: 'updateUserProfile',
  description: 'Updates the user profile information based on details provided in the conversation. Can be used for one or more fields at a time.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      firstName: { type: Type.STRING, description: 'The user\'s first name.' },
      middleName: { type: Type.STRING, description: 'The user\'s middle name.' },
      lastName: { type: Type.STRING, description: 'The user\'s last name.' },
      suffix: { type: Type.STRING, description: 'A suffix for the user\'s name, like Jr. or III.' },
      mobileNumber: { type: Type.STRING, description: 'The user\'s mobile phone number.' },
      primaryAddress: { ...addressSchema, description: "The user's primary residential address." },
      employmentStartDate: { type: Type.STRING, description: 'The date the user started their employment, in YYYY-MM-DD format.' },
      householdIncome: { type: Type.NUMBER, description: 'The user\'s estimated annual household income as a number.' },
      householdSize: { type: Type.NUMBER, description: 'The number of people in the user\'s household.' },
      homeowner: { type: Type.STRING, description: 'Whether the user owns their home.', enum: ['Yes', 'No'] },
    },
  },
};

const startOrUpdateApplicationDraftTool: FunctionDeclaration = {
  name: 'startOrUpdateApplicationDraft',
  description: 'Creates or updates a draft for a relief application with event-specific details.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      event: { type: Type.STRING, description: 'The type of event the user is applying for relief from.', enum: ['Flood', 'Tornado', 'Tropical Storm/Hurricane', 'Wildfire'] },
      requestedAmount: { type: Type.NUMBER, description: 'The amount of financial relief the user is requesting.' },
    },
  },
};


const applicationContext = `
You are the Relief Assistant, an expert AI chatbot for the 'E4E Relief' application.

Your **PRIMARY GOAL** is to proactively help users start or update their relief application by having a natural conversation. Listen for key pieces of information, and when you have them, use your available tools to update the application draft.

**Your Capabilities & Tools**:
- You can update a user's profile information using the \`updateUserProfile\` tool.
- You can start or update an application draft with event details using the \`startOrUpdateApplicationDraft\` tool.
- You can answer general questions about the application process, pages (Home, Apply, Profile, Support), and how to get support.

**Conversational Flow**:
1.  **Listen and Extract**: When a user provides information (e.g., "I'm John Doe, I live in Charlotte, NC, was affected by the recent flood and need $1500"), extract the entities (\`firstName: "John"\`, \`lastName: "Doe"\`, \`primaryAddress: { city: "Charlotte", state: "NC" }\`, \`event: "Flood"\`, \`requestedAmount: 1500\`).
2.  **Use Your Tools**: Call the appropriate tool(s) with the extracted information. You can call multiple tools at once if the user provides enough information.
3.  **Confirm Your Actions**: After you call a tool, you MUST confirm what you've done. For example: "Thanks, John. I've updated your name and location, and started a draft application for the 'Flood' event with a requested amount of $1,500."
4.  **Ask Clarifying Questions**: If information is missing, ask for it. For example, if a user says "I was in a tornado," respond with something like: "I'm sorry to hear that. I've noted the event as 'Tornado'. How much financial assistance are you requesting?"
5.  **Be Helpful**: If the user just wants to ask a question, answer it based on the application context below.

---
**Application Context for Q&A**:
- **Purpose**: The app allows users to apply for financial assistance during times of need.
- **Support Info**: Email is support@e4erelief.example, Phone is (800) 555-0199.

**Response Style**:
- Your answers MUST be short and concise. Get straight to the point.
- When you provide a list of items, you MUST format it as a clean, bulleted list using hyphens.
- Do NOT use asterisks. Keep the text clean.
---
`;


export function createChatSession(applications?: Application[]): Chat {
  let dynamicContext = applicationContext;

  if (applications && applications.length > 0) {
    const applicationList = applications.map(app => 
      `Application ID: ${app.id}\nEvent: ${app.event}\nAmount: $${app.requestedAmount}\nSubmitted: ${app.submittedDate}\nStatus: ${app.status}`
    ).join('\n---\n');

    dynamicContext += `
**User's Application History**:
You have access to the user's submitted applications. If they ask about them, use this data.
${applicationList}
`;
  } else {
    dynamicContext += `\nThe user currently has no submitted applications.`;
  }
  
  const model = 'gemini-2.5-flash';
  return ai.chats.create({
    model: model,
    config: {
      systemInstruction: dynamicContext,
    },
    tools: [{ functionDeclarations: [updateUserProfileTool, startOrUpdateApplicationDraftTool] }],
  });
}

export async function evaluateApplicationEligibility(
  appData: { 
    id: string; 
    employmentStartDate: string; 
    event: string; 
    requestedAmount: number;
    currentTwelveMonthRemaining: number;
    currentLifetimeRemaining: number;
  }
): Promise<{ 
    decision: 'Awarded' | 'Declined'; 
    decisionedDate: string;
    newTwelveMonthRemaining: number;
    newLifetimeRemaining: number;
}> {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  const eligibilityDecisionSchema = {
    type: Type.OBJECT,
    properties: {
        decision: { type: Type.STRING, enum: ['Awarded', 'Declined'] },
        newTwelveMonthRemaining: { type: Type.NUMBER, description: "The updated 12-month grant amount remaining." },
        newLifetimeRemaining: { type: Type.NUMBER, description: "The updated lifetime grant amount remaining." }
    },
    required: ["decision", "newTwelveMonthRemaining", "newLifetimeRemaining"]
  };

  const prompt = `
    Analyze the following application details based on the strict eligibility rules and return a JSON object with the decision and updated remaining grant amounts.

    **Eligibility Rules:**
    1. Event: Must be exactly "Tornado" or "Flood".
    2. Employment Start Date: Must be a date on or before today's date (${today}).
    3. Requested Amount: Must be less than or equal to the current 12 Month Remaining amount (${appData.currentTwelveMonthRemaining}).
    4. Requested Amount: Must be less than or equal to 10000.

    **Remaining Grant Amount Update Rules:**
    - If the decision is "Awarded", calculate the new remaining amounts by subtracting the 'Requested Amount' from the current remaining amounts.
    - If the decision is "Declined", the new remaining amounts should be the same as the current remaining amounts.

    **Applicant Details:**
    - Application ID: ${appData.id}
    - Employment Start Date: ${appData.employmentStartDate}
    - Event: ${appData.event}
    - Requested Amount: ${appData.requestedAmount}
    - Current 12 Month Remaining: ${appData.currentTwelveMonthRemaining}
    - Current Lifetime Remaining: ${appData.currentLifetimeRemaining}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: eligibilityDecisionSchema,
        },
    });
    
    const result = JSON.parse(response.text.trim());

    return { 
        decision: result.decision, 
        decisionedDate: today,
        newTwelveMonthRemaining: result.newTwelveMonthRemaining,
        newLifetimeRemaining: result.newLifetimeRemaining
    };

  } catch (error) {
    console.error("AI eligibility check failed:", error);
    // Default to a safe status in case of API error
    return { 
        decision: 'Declined', 
        decisionedDate: today,
        newTwelveMonthRemaining: appData.currentTwelveMonthRemaining,
        newLifetimeRemaining: appData.currentLifetimeRemaining
    };
  }
}

const addressJsonSchema = {
    type: Type.OBJECT,
    properties: {
        street1: { type: Type.STRING, description: "The primary street line, including street number and name. Formatted in Title Case (e.g., '123 Main St')." },
        street2: { type: Type.STRING, description: "The secondary street line (e.g., apartment, suite, or unit number). Formatted in Title Case (e.g., 'Apt 4B')." },
        city: { type: Type.STRING, description: "The city, formatted in Title Case (e.g., 'New York')." },
        state: { type: Type.STRING, description: "The state or province. For US addresses, use the uppercase 2-letter abbreviation (e.g., 'CA')." },
        zip: { type: Type.STRING, description: "The ZIP or postal code." },
        country: { type: Type.STRING, description: "The country, formatted in Title Case (e.g., 'United States')." },
    },
    required: ["street1", "city", "state", "zip", "country"]
};

export async function parseAddressWithGemini(addressString: string): Promise<Partial<Address>> {
  if (!addressString) return {};

  const prompt = `
    Parse the provided address string into a structured JSON object.
    Rules:
    1. For addresses in the United States, validate and correct any misspellings in the street name, city, or state.
    2. Standardize capitalization:
       - Street names and city should be in Title Case (e.g., "Main Street", "San Francisco").
       - The state for US addresses must be a 2-letter uppercase abbreviation (e.g., "CA").
    3. Omit any keys for address components that are not present in the original string (like \`street2\`).
    
    Address to parse: "${addressString}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: addressJsonSchema,
      },
    });

    const jsonString = response.text.trim();
    if (jsonString) {
      const parsed = JSON.parse(jsonString);
      // Filter out null values before returning
      Object.keys(parsed).forEach(key => {
        if (parsed[key] === null) {
          delete parsed[key];
        }
      });
      return parsed as Partial<Address>;
    }
    return {};
  } catch (error) {
    console.error("Gemini address parsing failed:", error);
    throw new Error("Failed to parse address with AI.");
  }
}

const applicationDetailsJsonSchema = {
    type: Type.OBJECT,
    properties: {
        profileData: {
            type: Type.OBJECT,
            properties: {
                firstName: { type: Type.STRING, description: 'The user\'s first name.' },
                lastName: { type: Type.STRING, description: 'The user\'s last name.' },
                primaryAddress: { ...addressSchema, description: "The user's primary residential address." },
                employmentStartDate: { type: Type.STRING, description: 'The date the user started their employment, in YYYY-MM-DD format.' },
                eligibilityType: { type: Type.STRING, description: 'The user\'s employment type.', enum: ['Full-time', 'Part-time', 'Contractor'] },
                householdIncome: { type: Type.NUMBER, description: 'The user\'s estimated annual household income as a number.' },
                householdSize: { type: Type.NUMBER, description: 'The number of people in the user\'s household.' },
                homeowner: { type: Type.STRING, description: 'Whether the user owns their home.', enum: ['Yes', 'No'] },
                mobileNumber: { type: Type.STRING, description: "The user's mobile phone number." },
                preferredLanguage: { type: Type.STRING, description: "The user's preferred language for communication." },
            }
        },
        eventData: {
            type: Type.OBJECT,
            properties: {
                event: { type: Type.STRING, description: 'The type of event the user is applying for relief from.', enum: ['Flood', 'Tornado', 'Tropical Storm/Hurricane', 'Wildfire'] },
                requestedAmount: { type: Type.NUMBER, description: 'The amount of financial relief the user is requesting.' },
            }
        }
    }
};

export async function parseApplicationDetailsWithGemini(
  description: string
): Promise<Partial<ApplicationFormData>> {
  if (!description) return {};

  const prompt = `
    Parse the user's description of their situation into a structured JSON object for a relief application.
    Extract any mentioned details that match the schema, including personal info, address, mobile number, preferred language, event details, and other profile information like employment start date, household size/income, and home ownership status.
    
    Rules for address parsing:
    1. For addresses in the United States, validate and correct any misspellings in the street name, city, or state.
    2. Standardize capitalization:
       - Street names and city should be in Title Case (e.g., "Main Street", "San Francisco").
       - The state for US addresses must be a 2-letter uppercase abbreviation (e.g., "CA").
    3. Omit any keys for address components that are not present in the original string (like \`street2\`).

    Rules for other fields:
    1. employmentStartDate: Must be in YYYY-MM-DD format. Infer the year if not specified (assume current year).
    2. householdIncome: Extract as a number, ignoring currency symbols or commas.
    3. homeowner: Should be "Yes" or "No".
    4. mobileNumber: Extract any phone number mentioned by the user.
    5. preferredLanguage: Extract any preferred language for communication mentioned by the user.

    User's description: "${description}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: applicationDetailsJsonSchema,
      },
    });

    const jsonString = response.text.trim();
    if (jsonString) {
      const parsed = JSON.parse(jsonString);
      // Clean up nulls
      if (parsed.profileData) {
        Object.keys(parsed.profileData).forEach(key => {
            if (parsed.profileData[key] === null) delete parsed.profileData[key];
        });
        if (parsed.profileData.primaryAddress) {
            Object.keys(parsed.profileData.primaryAddress).forEach(key => {
                if (parsed.profileData.primaryAddress[key] === null) delete parsed.profileData.primaryAddress[key];
            });
        }
      }
      if (parsed.eventData) {
          Object.keys(parsed.eventData).forEach(key => {
            if (parsed.eventData[key] === null) delete parsed.eventData[key];
        });
      }
      return parsed as Partial<ApplicationFormData>;
    }
    return {};
  } catch (error) {
    console.error("Gemini application details parsing failed:", error);
    throw new Error("Failed to parse application details with AI.");
  }
}