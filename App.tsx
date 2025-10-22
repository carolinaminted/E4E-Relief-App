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
      hireDate: '2020-05-15',
      event: 'Flood',
      requestedAmount: 2500,
      submittedDate: '2023-08-12',
      status: 'Awarded',
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
    setLastSubmittedApp(newApplication);
    setPage('submissionSuccess');

  }, [currentUser]);

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
  
  const renderPage = () => {
    if (!currentUser) {
      switch (page) {
        case 'register':
          return <RegisterPage onRegister={handleRegister} switchToLogin={() => setPage('login')} />;
        default:
          return <LoginPage onLogin={handleLogin} switchToRegister={() => setPage('register')} />;
      }
    }
    
    switch (page) {
      case 'apply':
        return <ApplyPage navigate={navigate} onSubmit={handleApplicationSubmit} />;
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
          <button onClick={() => navigate('home')} className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#003a70] focus:ring-[#ff8400] rounded-md p-1" aria-label="Go to Home page">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#edda26]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">
              E4E Relief
            </h1>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-200">Welcome, {currentUser.firstName}</span>
            <button onClick={handleLogout} className="bg-[#ff8400]/80 hover:bg-[#ff8400] text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors duration-200">
              Logout
            </button>
          </div>
        </header>
      )}

      <main className={`flex-1 flex flex-col ${!currentUser ? 'items-center justify-center' : ''}`}>
        {renderPage()}
      </main>

      {currentUser && <ChatbotWidget applications={userApplications} />}
    </div>
  );
}

export default App;