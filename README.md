# E4E Relief — Model App Overview

## What this app is
A browser-based reference app that demonstrates the core journey for an employee relief program:
- Register or sign in
- Apply for relief via a guided, multi‑step form
- Review prior applications
- Update a personal profile
- Get help and chat with an AI assistant

No backend is required. Data is seeded in-memory for demo purposes.

## Who it’s for
- **Business stakeholders** validating flows and copy
- **Design and product** teams reviewing IA and page behavior
- **Engineering** using it as a working blueprint before wiring real APIs

## Key user flows
1. **Sign in / Register**  
   Simple email + password stub with local session.

2. **Apply for Relief**  
   Guided flow with clear sections:
   - Contact & Address
   - Event details and requested amount
   - Expenses summary
   - Terms & final acknowledgments  
   Submission yields a success screen and an entry in **My Applications**.

3. **My Applications**  
   List of past submissions with status badges. Open a submission to see a detail modal.

4. **Profile**  
   Edit personal details, preferred language, and addresses with helpers (country search, address tips).

5. **Support**  
   Static help and contact info area, meant to be replaced with your support channels.

6. **AI Assistant**  
   Docked chatbot answering “how do I…” questions about the flow. The assistant can also run a basic **eligibility evaluation** using the configured AI model.

## What is *not* included
- No real authentication provider
- No persistence beyond the page session
- No APIs to Dynamics 365 / Dataverse
- No PII handling requirements yet—this is a demo model

---

## Technical Notes (for engineers)

**Stack**
- React 19 + TypeScript
- Vite for dev/build
- `@google/genai` for AI assistant and eligibility check

**Structure**
```
App.tsx                      # Navigation and app‑level state
types.ts                     # Core domain models
services/geminiService.ts    # AI client + tool schema for eligibility
components/                  # Page and UI components
  LoginPage.tsx              # Stubbed auth screens
  RegisterPage.tsx
  HomePage.tsx               # Entry tiles to Apply, Profile, Applications, Support
  ApplyPage.tsx              # Multi‑step controller for Apply flow
  ApplyContactPage.tsx       # Large form for contact details
  ApplyEventPage.tsx
  ApplyExpensesPage.tsx
  ApplyTermsPage.tsx
  SubmissionSuccessPage.tsx
  ApplicationDetailModal.tsx # Read‑only view of a submission
  ProfilePage.tsx            # Full profile editor
  SupportPage.tsx
  ChatbotWidget.tsx          # Docked chat assistant UI
  ChatWindow.tsx / ChatMessageBubble.tsx / ChatInput.tsx
data/                        # Country list, seed data
utils/formatting.ts          # Formatting helpers
index.tsx / index.html       # Vite entry
```

**Domain models** (`types.ts`)
- `UserProfile` with `Address` value object
- `Application` with status and snapshot of the profile at submit time
- Chat types: `ChatMessage`, `MessageRole`

**State & navigation**
- Centralized in `App.tsx` using React state.
- `currentPage` enum instead of a router for simplicity.
- `userProfiles` and `applications` are in‑memory keyed by email.

**Eligibility evaluation**
- Implemented in `services/geminiService.ts` with a **function/tool schema** over `@google/genai`.
- The model returns a structured result that the UI uses for feedback.

**Security footnotes**
- Demo only. No secure storage, no real auth, no persistence.
- **Env var naming**: code reads `process.env.API_KEY` but the template `.env.local` uses `GEMINI_API_KEY`. Pick one. With Vite, prefer `VITE_GEMINI_API_KEY` and access via `import.meta.env.VITE_GEMINI_API_KEY`.

**Run locally**
1. `npm install`
2. Set your API key:
   - Quick fix: rename `.env.local` entry to `API_KEY=<your key>` **or**
   - Recommended: `VITE_GEMINI_API_KEY=<your key>` and update `services/geminiService.ts` to use `import.meta.env.VITE_GEMINI_API_KEY`
3. `npm run dev`

**Roadmap to production**
- Replace stub auth with OIDC/OAuth2 (AD B2C) using PKCE
- Use TanStack Query, error normalization, retry/backoff
- Wire Dataverse/D365 via REST or GraphQL gateway
- Add secure storage and real persistence
- Replace in‑app state nav with React Navigation equivalent for React Native or React Router for web
- Add analytics, a11y checks, tests (unit, RTL, E2E), CI/CD
- Map these flows into your provider‑agnostic adapters per E4E architecture
