
import React, { useState, useCallback, useMemo } from 'react';
import type { UserProfile, Application } from './types';
import { evaluateApplicationEligibility } from './services/geminiService';
// FIX: Corrected the import path for ApplicationFormData. It should be imported from './types' instead of a component file.
import type { ApplicationFormData } from './types';

// Page Components
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import ApplyPage from './components/ApplyPage';
import ProfilePage from './components/ProfilePage';
import SupportPage from './components/SupportPage';
import SubmissionSuccessPage from './components/SubmissionSuccessPage';
import ChatbotWidget from './components/ChatbotWidget';

type Page = 'login' | 'register' | 'home' | 'apply' | 'profile' | 'support' | 'submissionSuccess';

// --- MOCK DATABASE ---
const initialUsers: Record<string, UserProfile & { passwordHash: string }> = {
  'user@example.com': {
    // 1a
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    mobileNumber: '555-123-4567',
    // 1b
    primaryAddress: {
      country: 'United States',
      street1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
    },
    // 1c
    employmentStartDate: '2020-05-15',
    eligibilityType: 'Full-time',
    householdIncome: 75000,
    householdSize: 4,
    homeowner: 'Yes',
    preferredLanguage: 'English',
    // 1d
    isMailingAddressSame: true,
    // 1e
    ackPolicies: true,
    commConsent: true,
    infoCorrect: true,
    // Auth
    passwordHash: 'password123', // In a real app, this would be a hash
  },
};

const initialApplications: Record<string, Application[]> = {
  'user@example.com': [
    {
      id: 'APP-1001',
      profileSnapshot: initialUsers['user@example.com'], // Snapshot of the user profile
      event: 'Flood',
      requestedAmount: 2500,
      submittedDate: '2023-08-12',
      status: 'Awarded',
      decisionedDate: '2023-08-12',
      twelveMonthGrantRemaining: 7500,
      lifetimeGrantRemaining: 47500,
      shareStory: true,
      receiveAdditionalInfo: false,
    },
  ],
};

const createNewUserProfile = (
    firstName: string,
    lastName: string,
    email: string
): UserProfile => ({
    firstName,
    lastName,
    email,
    mobileNumber: '',
    primaryAddress: { country: '', street1: '', city: '', state: '', zip: '' },
    employmentStartDate: '',
    eligibilityType: '',
    householdIncome: '',
    householdSize: '',
    homeowner: '',
    isMailingAddressSame: true,
    ackPolicies: false,
    commConsent: false,
    infoCorrect: false,
});


// --- END MOCK DATABASE ---

function App() {
  const [page, setPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState(initialUsers);
  const [applications, setApplications] = useState(initialApplications);
  const [lastSubmittedApp, setLastSubmittedApp] = useState<Application | null>(null);
  const [applicationDraft, setApplicationDraft] = useState<Partial<ApplicationFormData> | null>(null);


  const userApplications = useMemo(() => {
    if (currentUser) {
      return applications[currentUser.email] || [];
    }
    return [];
  }, [currentUser, applications]);

  const handleLogin = useCallback((email: string, password: string): boolean => {
    const user = users[email];
    if (user && user.passwordHash === password) {
      const { passwordHash, ...profile } = user;
      setCurrentUser(profile);
      setPage('home');
      return true;
    }
    return false;
  }, [users]);
  
  const handleRegister = useCallback((firstName: string, lastName: string, email: string, password: string): boolean => {
    if (users[email]) {
      return false; // User already exists
    }
    const newUserProfile = createNewUserProfile(firstName, lastName, email);
    const newUser = {
      ...newUserProfile,
      passwordHash: password,
    };
    setUsers(prev => ({ ...prev, [email]: newUser }));
    setApplications(prev => ({ ...prev, [email]: [] }));
    setCurrentUser(newUserProfile);
    setPage('home');
    return true;
  }, [users]);

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
  };
  
  const navigate = useCallback((targetPage: Page) => {
    setPage(targetPage);
  }, []);
  
  const handleProfileUpdate = useCallback((updatedProfile: UserProfile) => {
    if (!currentUser) return;

    setCurrentUser(updatedProfile);
    setUsers(prev => {
        const currentUserData = prev[currentUser.email];
        if (currentUserData) {
            return {
                ...prev,
                [currentUser.email]: {
                    ...currentUserData, // a.k.a. passwordHash
                    ...updatedProfile,
                }
            };
        }
        return prev;
    });
    // Maybe show a success message
  }, [currentUser]);

  const handleApplicationSubmit = useCallback(async (appFormData: ApplicationFormData) => {
    if (!currentUser) return;
    
    const tempId = `APP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Determine current grant remaining amounts from the last application or defaults
    const usersPastApplications = applications[currentUser.email] || [];
    const lastApplication = usersPastApplications.length > 0 ? usersPastApplications[usersPastApplications.length - 1] : null;
    
    const initialTwelveMonthMax = 10000;
    const initialLifetimeMax = 50000;

    const currentTwelveMonthRemaining = lastApplication ? lastApplication.twelveMonthGrantRemaining : initialTwelveMonthMax;
    const currentLifetimeRemaining = lastApplication ? lastApplication.lifetimeGrantRemaining : initialLifetimeMax;

    // Call the AI service to get the status, decision date, and new grant remaining amounts
    const { decision, decisionedDate, newTwelveMonthRemaining, newLifetimeRemaining } = await evaluateApplicationEligibility({
        id: tempId,
        employmentStartDate: appFormData.profileData.employmentStartDate,
        event: appFormData.eventData.event,
        requestedAmount: appFormData.eventData.requestedAmount,
        currentTwelveMonthRemaining: currentTwelveMonthRemaining,
        currentLifetimeRemaining: currentLifetimeRemaining,
    });

    const newApplication: Application = {
      id: tempId,
      profileSnapshot: appFormData.profileData,
      event: appFormData.eventData.event,
      requestedAmount: appFormData.eventData.requestedAmount,
      submittedDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
      status: decision,
      decisionedDate: decisionedDate,
      twelveMonthGrantRemaining: newTwelveMonthRemaining,
      lifetimeGrantRemaining: newLifetimeRemaining,
      shareStory: appFormData.agreementData.shareStory ?? false,
      receiveAdditionalInfo: appFormData.agreementData.receiveAdditionalInfo ?? false,
    };

    setApplications(prev => ({
      ...prev,
      [currentUser.email]: [...(prev[currentUser.email] || []), newApplication],
    }));
    
    // If the user updated their profile in the application, update their main profile too
    if (JSON.stringify(appFormData.profileData) !== JSON.stringify(currentUser)) {
        handleProfileUpdate(appFormData.profileData);
    }
    
    setApplicationDraft(null); // Clear the draft after submission
    setLastSubmittedApp(newApplication);
    setPage('submissionSuccess');

  }, [currentUser, handleProfileUpdate, applications]);
  
  const handleChatbotAction = useCallback((functionName: string, args: any) => {
    console.log(`Executing tool: ${functionName}`, args);
    setApplicationDraft(prevDraft => {
        const newDraft = { ...prevDraft };

        if (functionName === 'updateUserProfile') {
            // FIX: Cast prevProfile to Partial<UserProfile> to allow safe access to nested properties like primaryAddress
            const prevProfile: Partial<UserProfile> = prevDraft?.profileData || {};
            const newProfile = { ...prevProfile, ...args };

            // Deep merge for nested address object
            if (args.primaryAddress) {
                newProfile.primaryAddress = {
                    ...(prevProfile.primaryAddress || {}),
                    ...args.primaryAddress
                };
            }
            newDraft.profileData = newProfile as UserProfile;
        }

        if (functionName === 'startOrUpdateApplicationDraft') {
            newDraft.eventData = { ...(prevDraft?.eventData || {}), ...args };
        }
        return newDraft;
    });
  }, []);

  const renderPage = () => {
    if (!currentUser) {
      return (
        <>
          {/* Logo container with a fixed proportion of the viewport height */}
          <div className="w-full flex justify-center items-center h-[35vh]">
            <img 
              src="https://gateway.pinata.cloud/ipfs/bafybeihjhfybcxtlj6r4u7c6jdgte7ehcrctaispvtsndkvgc3bmevuvqi" 
              alt="E4E Relief Logo" 
              className="mx-auto h-48 w-auto"
            />
          </div>
          
          {/* Form container */}
          <div className="w-full max-w-md">
            {page === 'register' ? (
              <RegisterPage onRegister={handleRegister} switchToLogin={() => setPage('login')} />
            ) : (
              <LoginPage onLogin={handleLogin} switchToRegister={() => setPage('register')} />
            )}
          </div>
        </>
      );
    }
    
    switch (page) {
      case 'apply':
        return <ApplyPage navigate={navigate} onSubmit={handleApplicationSubmit} userProfile={currentUser} applicationDraft={applicationDraft} />;
      case 'profile':
        return <ProfilePage navigate={navigate} applications={userApplications} userProfile={currentUser} onProfileUpdate={handleProfileUpdate} />;
      case 'support':
        return <SupportPage navigate={navigate} />;
      case 'submissionSuccess':
        if (!lastSubmittedApp) return <HomePage navigate={navigate} />;
        return <SubmissionSuccessPage application={lastSubmittedApp} onGoToProfile={() => setPage('profile')} />;
      case 'home':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="bg-[#003a70] text-white min-h-screen font-sans flex flex-col">
      {currentUser && (
        <header className="bg-[#004b8d]/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-md sticky top-0 z-30 border-b border-[#002a50]">
          <button onClick={() => navigate('home')} className="flex items-center transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#003a70] focus:ring-[#ff8400] rounded-md p-1" aria-label="Go to Home page">
            <img
              src="https://gateway.pinata.cloud/ipfs/bafybeihjhfybcxtlj6r4u7c6jdgte7ehcrctaispvtsndkvgc3bmevuvqi"
              alt="E4E Relief Logo"
              className="h-10 w-auto"
            />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-200">Welcome, {currentUser.firstName}</span>
            <button onClick={handleLogout} className="bg-[#ff8400]/80 hover:bg-[#ff8400] text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors duration-200">
              Logout
            </button>
          </div>
        </header>
      )}

      <main className={`flex-1 flex flex-col ${!currentUser ? 'items-center' : ''}`}>
        {renderPage()}
      </main>

      {currentUser && <ChatbotWidget applications={userApplications} onChatbotAction={handleChatbotAction} />}
    </div>
  );
}

export default App;