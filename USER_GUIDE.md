# E4E Relief — User Guide

## Getting started
- Open the app in your browser.
- Choose **Register** to create an account or **Sign in** if you already have one.
- After signing in, the **Home** screen shows tiles for the main actions.

<img width="334" height="602" alt="image" src="https://github.com/user-attachments/assets/61007eb0-e080-421d-865e-32cd926a243f" />
<img width="334" height="604" alt="image" src="https://github.com/user-attachments/assets/639aab15-e872-4842-9a89-0528af5150a6" />


## Home
- **Apply for Relief**: start a new application.
- **My Applications**: view status of past submissions.
- **Profile**: update your personal details, address, and consent acknowledgements.
- **Support**: read help content and ways to contact support.
- The **Relief Assistant** icon opens the AI assistant for quick questions, filling out applications, and updating contact information.

Home Page:

<img width="339" height="609" alt="image" src="https://github.com/user-attachments/assets/8815c8c7-5d81-491a-a9f9-b2d04318b417" />


## Apply for Relief
The application is a guided, step‑by‑step form. Your progress is saved in the session.

1. **Contact & Address**
   - Enter your name, email, phone, and residential address.
   - Use the **Country** picker to quickly filter and select your country.
   - Address tips are available via the helper component.

2. **Event & Request**
   - Select the event type and describe the impact.
   - Enter the **requested amount** you need assistance with.

3. **Expenses**
   - Provide estimated costs or categories. Totals are shown where applicable.

4. **Terms & Acknowledgments**
   - Read and accept required terms.
   - Optional choices: share your story and receive additional information.

5. **Submit**
   - You will see a **Submission Success** page.
   - Your application will appear in **My Applications** with a status.

Apply for Relief Page:

<img width="340" height="610" alt="image" src="https://github.com/user-attachments/assets/f42bec46-6b37-4197-9758-6d21eedf51c2" />


## My Applications Page
- View a list of all your submissions with status (Submitted, Awarded, Declined).
- Select an entry to open a **detail view** showing what you submitted.
- Use this area to confirm what the organization received.

<img width="324" height="615" alt="image" src="https://github.com/user-attachments/assets/a19f966e-301d-4dcb-9e51-32f5097a6228" />


## Profile Page
- Update name, preferred language, and contact details.
- Edit your addresses. The **Country** picker supports searching.
- Save to keep changes for your current session.


## Support Page
- Read guidance on eligibility, timelines, and contact options.
- This page is a placeholder and can be replaced with your organization’s content and links.

<img width="342" height="617" alt="image" src="https://github.com/user-attachments/assets/450f1dd3-a0be-476c-b892-8c7346f8381b" />


## Relief Assistant (AI Assistant)
- Open the chat from the floating widget.
- Ask “how do I…” questions about the process.
- The assistant can perform a simple **eligibility check** and explain the result.
- Responses are for guidance of the program.
- Provide information to prefillout application information.

<img width="335" height="609" alt="image" src="https://github.com/user-attachments/assets/a8f64df1-c745-4cc7-8ef9-8a19945415c7" />


## AI Decisioning and Instant Grant Eligibility

When a user completes the **Apply for Relief** form and clicks **Submit**, the application triggers the **AI Decisioning Service**.  
This service evaluates the applicant’s data against fund-specific eligibility rules and renders a decision in real time.

### Flow Overview
1. **Form Submission**
   - The user’s completed application (contact, event, expenses, acknowledgments) is serialized into a structured payload.
   - This payload includes user metadata and contextual fund information.

2. **AI Eligibility Evaluation**
   - The payload is passed to the AI Decisioning module (`geminiService.ts` or equivalent).
   - The module constructs a structured request aligned with the **eligibility evaluation schema**:
     ```ts
     {
       "tool": "EligibilityEvaluation",
       "input": {
         "fund_id": "<fund-uuid>",
         "country": "US",
         "event_type": "Hurricane",
         "requested_amount": 1200,
         "time_since_event": "5 days",
         "prior_awards": 0
       }
     }
     ```
   - The AI model (e.g., Gemini or GPT) uses fund policy rules and prior case patterns to assess:
     - Applicant eligibility (yes/no + reasoning)
     - Decision type (approve, deny, review)
     - Suggested grant amount (if approved)
     - Policy rationale (text summary for auditing)

3. **Decision Output**
   - The AI returns a structured JSON response:
     ```json
     {
       "eligible": true,
       "decision": "Approved",
       "recommended_award": 1000,
       "reasoning": "Applicant meets criteria and has no prior awards."
     }
     ```
   - The UI displays an instant confirmation banner summarizing the result.
   - The result is logged with the application record for auditing.

4. **Post-Decision Handling**
   - If approved: the app can initiate a **payment creation** record in Dynamics 365 via API.
   - If pending review: it flags the record for manual approval by case workers.
   - If denied: it provides a clear explanation to the applicant, referencing relevant criteria.

  
<img width="333" height="615" alt="image" src="https://github.com/user-attachments/assets/a323002c-28b4-4495-bb27-7b2afc24c162" />
<img width="339" height="605" alt="image" src="https://github.com/user-attachments/assets/0361b00d-7d99-4189-8b49-03d7536d389c" />
<img width="324" height="611" alt="image" src="https://github.com/user-attachments/assets/e5fca3f2-3c6c-4d52-8576-9a69efa6412a" />


### Key Advantages
- **Instant Eligibility Feedback** — applicants know their outcome immediately.
- **Consistent Rule Enforcement** — AI applies the same logic for all applicants.
- **Transparent Reasoning** — every decision carries human-readable justification.
- **Audit Ready** — results are logged for compliance and reporting.


# Integration Overview — Azure AD B2C + Dataverse

## High-Level Plan

1. **Authentication**
   - Use **Azure AD B2C** with **OIDC + PKCE** for secure sign-in and sign-up.
   - Each B2C user is mapped to a **Dataverse Contact** by storing the B2C `oid` (Object ID) on the Contact record.

2. **Backend API Layer**
   - Introduce a **thin backend API** (Azure Function or App Service) as the single integration point between the mobile app and Dataverse.
   - This API validates B2C access tokens, executes business logic, and prevents client-side exposure of secrets.

3. **Token Flow**
   - **Frontend → API**: Authenticated using **B2C access tokens**.
   - **API → Dataverse**: Authenticated using a **Dataverse Application User** (via Azure AD app registration with client credentials).

4. **Data Integration**
   - Replace all mock or local state with **live Dataverse data**:
     - **Contacts** for user profiles.
     - **Applications** for relief submissions.
     - **Awards** for grant outcomes.
   - Use **TanStack Query** to manage cache, sync, and optimistic updates.

5. **AI Decisioning**
   - Run **AI eligibility and grant decisioning** server-side within the API before saving an Application.
   - Store decision outcome, reasoning, and audit trail directly in Dataverse.

6. **Security & Configuration**
   - Store tokens securely in **Keychain/Keystore**.
   - Keep environment variables and API endpoints in a **.env file**.
   - Avoid embedding secrets in mobile code.
   - Enforce **least-privilege roles** and **data access controls** in Dataverse.

7. **Deployment & CI/CD**
   - Implement automated build and release pipelines to:
     - Build and deploy the React Native app.
     - Deploy the API to Azure.
     - Run integration and regression tests against a **UAT Dataverse** environment.

8. **Observability & Reliability**
   - Add **structured logs**, **correlation IDs**, and **error telemetry**.
   - AI decision logs with updates on cases with artifacts used to make the eligibility award or decline decision
   - Provide **user-friendly error messages** for predictable recovery and smoother UX.



## Tips
- This demo does not persist data across refreshes.
- If you see “missing API key,” add your AI key via the environment file.
- Keep your browser tab open during an application session to avoid losing inputs.
