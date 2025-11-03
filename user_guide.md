# E4E Relief — User Guide

## Getting started
- Open the app in your browser.
- Choose **Register** to create an account or **Sign in** if you already have one.
- After signing in, the **Home** screen shows tiles for the main actions.

<img width="334" height="602" alt="image" src="https://github.com/user-attachments/assets/61007eb0-e080-421d-865e-32cd926a243f" />
<img width="334" height="604" alt="image" src="https://github.com/user-attachments/assets/639aab15-e872-4842-9a89-0528af5150a6" />


## Home
- **Apply for Relief**: start a new application.
- **My Profile**: view your application history and manage your personal details.
- **Support**: find contact information and answers to questions.
- The **Relief Assistant** icon opens the AI assistant for quick questions and help filling out your application.

Home Page:

<img width="339" height="609" alt="image" src="https://github.com/user-attachments/assets/8815c8c7-5d81-491a-a9f9-b2d04318b417" />


## Apply for Relief
The application is a guided, step‑by‑step form. Your progress is saved in the session.

1. **Contact & Address**
   - Use the **AI Application Starter** to describe your situation in plain text and let the AI pre-fill your form.
   - Or, fill in your name, email, phone, and residential address manually.
   - Use the **Country** picker to quickly filter and select your country.

2. **Event & Request**
   - Select the event type and provide details about the impact.
   - Enter the **requested amount** you need assistance with.

3. **Expenses**
   - This section is a placeholder for future itemized expense tracking.

4. **Terms & Acknowledgments**
   - Read and accept required terms.
   - Optional choices: share your story and receive additional information.

5. **Submit**
   - You will see a **Submission Success** page with your application ID.
   - Your application will immediately appear in your **Profile** with a decision.

Apply for Relief Page:

<img width="340" height="610" alt="image" src="https://github.com/user-attachments/assets/f42bec46-6b37-4197-9758-6d21eedf51c2" />
<img width="325" height="617" alt="image" src="https://github.com/user-attachments/assets/8fff68c5-edc3-4858-989d-dac899423d43" />
<img width="321" height="621" alt="image" src="https://github.com/user-attachments/assets/0fc04d3d-f463-4cf7-80b2-15e2b4f4634d" />
<img width="326" height="619" alt="image" src="https://github.com/user-attachments/assets/7c0bb3f8-b964-434c-be08-bb99c7481c06" />
<img width="316" height="615" alt="image" src="https://github.com/user-attachments/assets/766a3be0-bba5-49e8-a709-c0edf5fc3de4" />
<img width="330" height="612" alt="image" src="https://github.com/user-attachments/assets/adb16fc7-3250-43b8-b3ae-9f432e4bdf52" />
<img width="331" height="614" alt="image" src="https://github.com/user-attachments/assets/98651770-a6b3-4ce3-adbc-f9173ed91589" />
<img width="316" height="601" alt="image" src="https://github.com/user-attachments/assets/937d8fb4-412d-4301-a74d-48f8deda9e34" />
<img width="335" height="614" alt="image" src="https://github.com/user-attachments/assets/d5400bf7-8893-476b-a9c6-a0cd54c4872d" />
<img width="328" height="609" alt="image" src="https://github.com/user-attachments/assets/3c196b2b-0a80-4d2a-bc97-ee593af263ad" />
<img width="320" height="606" alt="image" src="https://github.com/user-attachments/assets/1d8c2d23-c35c-4ec4-b31a-1863f73c3ca0" />
<img width="336" height="606" alt="image" src="https://github.com/user-attachments/assets/e4f3dc91-24a2-49a3-9948-0d1f0afd1161" />


## My Applications Page
- View a list of all your submissions with status (Submitted, Awarded, Declined).
- Select an entry to open a **detail view** showing what you submitted.
- Use this area to confirm what the organization received.

<img width="324" height="600" alt="image" src="https://github.com/user-attachments/assets/95ebd3b3-9132-4826-9fa6-37461bc6cfc9" />
<img width="332" height="622" alt="image" src="https://github.com/user-attachments/assets/16133a5c-a0a4-4985-9122-f4377e7a2d3f" />

## Profile Page
- View a list of all your submissions with their status (Submitted, Awarded, Declined).
- Select an entry to open a **detail view** showing what you submitted and the reasons for the decision.
- Update your name, preferred language, and other contact details.
- Edit your addresses.

<img width="330" height="612" alt="image" src="https://github.com/user-attachments/assets/a9d7a406-90ef-416b-ada7-c33b28e35046" />
<img width="327" height="615" alt="image" src="https://github.com/user-attachments/assets/5b9c4cf4-a5b5-43c3-96c9-56d3e5db9524" />


## Support Page
- Read guidance on eligibility, timelines, and contact options.
- This page is a placeholder and can be replaced with your organization’s content and links.

<img width="342" height="617" alt="image" src="https://github.com/user-attachments/assets/450f1dd3-a0be-476c-b892-8c7346f8381b" />


## Relief Assistant (AI Assistant)
- Open the chat from the floating widget on the bottom left.
- Ask questions about the application process.
- Provide information like "I was affected by the flood and need $1500" to have the AI pre-fill your application draft.
- Ask about past applications, including why one might have been declined.

<img width="339" height="605" alt="image" src="https://github.com/user-attachments/assets/257a27df-1cb7-41d3-937a-7756a3eb8616" />


## Instant, Rules-Based Decisioning

When a user completes the **Apply for Relief** form and clicks **Submit**, the application is processed by a **deterministic, rules-based engine** that provides an immediate decision.

### Flow Overview
1. **Form Submission**
   - The user’s completed application data is sent to the eligibility engine.

2. **Rules Evaluation**
   - The engine, a TypeScript function, programmatically checks the application against a hard-coded set of business rules (e.g., event date recency, requested amount vs. remaining limits, conditional field completion).
   - This process is extremely fast and consistent.

3. **Decision Output**
   - The engine returns a structured JSON response:
     ```json
     {
       "decision": "Approved",
       "reasons": ["Application meets all automatic approval criteria."],
       "recommended_award": 1000,
       "policy_hits": [{"rule_id":"R1","passed":true,"detail":"..."}]
     }
     ```
   - The UI displays an instant confirmation and summarizes the result.
   - The full decision, including the reasons, is logged with the application record for auditing and can be viewed by the user in their profile.

4. **Post-Decision Handling**
   - **Approved**: The application status is set to 'Awarded'.
   - **Pending Review**: The status is set to 'Submitted', indicating it needs manual review.
   - **Denied**: The status is 'Declined', and the specific reasons are provided to the applicant.
  
<img width="333" height="615" alt="image" src="https://github.com/user-attachments/assets/a323002c-28b4-4495-bb27-7b2afc24c162" />
<img width="339" height="605" alt="image" src="https://github.com/user-attachments/assets/0361b00d-7d99-4189-8b49-03d7536d389c" />
<img width="324" height="611" alt="image" src="https://github.com/user-attachments/assets/e5fca3f2-3c6c-4d52-8576-9a69efa6412a" />


### Key Advantages
- **Instant Feedback** — Applicants know their outcome immediately without waiting.
- **Consistency & Fairness** — The rules engine applies the exact same logic to every applicant, ensuring equitable decisions.
- **Transparent Reasoning** — Every decision is accompanied by clear, human-readable justifications.
- **Audit Ready** — Decision results, including which rules were checked, are logged for compliance and reporting.


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

5. **AI & Decisioning**
   - Run **AI-powered tasks** (like address parsing or form pre-filling) server-side within the API.
   - The final **eligibility and grant decisioning** uses the deterministic rules-engine before saving an Application.
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
   - Decision logs with updates on cases with artifacts used to make the eligibility award or decline decision.
   - Provide **user-friendly error messages** for predictable recovery and smoother UX.



## Tips
- This demo does not persist data across refreshes.
- If you see “missing API key,” add your AI key via the environment file.
- Keep your browser tab open during an application session to avoid losing inputs.
