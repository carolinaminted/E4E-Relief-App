import React, { useState, useCallback, useMemo } from 'react';
import type { UserProfile, Application } from './types';
import { evaluateApplicationEligibility } from './services/geminiService';

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
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    passwordHash: 'password123', // In a real app, this would be a hash
  },
};

const initialApplications: Record<string, Application[]> = {
  'user@example.com': [
    {
      id: 'APP-1001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      hireDate: '2020-05-15',
      event: 'Flood',
      requestedAmount: 2500,
      submittedDate: '2023-08-12',
      status: 'Awarded',
      shareStory: true,
      receiveAdditionalInfo: false,
    },
  ],
};
// --- END MOCK DATABASE ---

function App() {
  const [page, setPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState(initialUsers);
  const [applications, setApplications] = useState(initialApplications);
  const [lastSubmittedApp, setLastSubmittedApp] = useState<Application | null>(null);

  const userApplications = useMemo(() => {
    if (currentUser) {
      return applications[currentUser.email] || [];
    }
    return [];
  }, [currentUser, applications]);

  const handleLogin = useCallback((email: string, password: string): boolean => {
    const user = users[email];
    if (user && user.passwordHash === password) {
      setCurrentUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      setPage('home');
      return true;
    }
    return false;
  }, [users]);
  
  const handleRegister = useCallback((firstName: string, lastName: string, email: string, password: string): boolean => {
    if (users[email]) {
      return false; // User already exists
    }
    const newUser = {
      firstName,
      lastName,
      email,
      passwordHash: password,
    };
    setUsers(prev => ({ ...prev, [email]: newUser }));
    setApplications(prev => ({ ...prev, [email]: [] }));
    setCurrentUser({ firstName, lastName, email });
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
                    ...currentUserData,
                    firstName: updatedProfile.firstName,
                    lastName: updatedProfile.lastName,
                }
            };
        }
        return prev;
    });
    // Maybe show a success message
  }, [currentUser]);

  const handleApplicationSubmit = useCallback(async (newApplicationData: Omit<Application, 'id' | 'submittedDate' | 'status'>) => {
    if (!currentUser) return;
    
    const tempId = `APP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const appForEvaluation = { ...newApplicationData, id: tempId };

    // Call the AI service to get the status
    const decision = await evaluateApplicationEligibility(appForEvaluation);

    const newApplication: Application = {
      ...newApplicationData,
      id: tempId,
      submittedDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
      status: decision,
    };

    setApplications(prev => ({
      ...prev,
      [currentUser.email]: [...(prev[currentUser.email] || []), newApplication],
    }));
    
    // If the user updated their name in the application, update their profile too
    if (newApplicationData.firstName !== currentUser.firstName || newApplicationData.lastName !== currentUser.lastName) {
        handleProfileUpdate({
            firstName: newApplicationData.firstName,
            lastName: newApplicationData.lastName,
            email: currentUser.email,
        });
    }

    setLastSubmittedApp(newApplication);
    setPage('submissionSuccess');

  }, [currentUser, handleProfileUpdate]);

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
        return <ApplyPage navigate={navigate} onSubmit={handleApplicationSubmit} userProfile={currentUser} />;
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
        <header className="bg-[#004b8d]/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-md sticky top-0 z-40 border-b border-[#002a50]">
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

      {currentUser && <ChatbotWidget applications={userApplications} />}
    </div>
  );
}

export default App;
