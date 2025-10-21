import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import ChatbotWidget from './components/ChatbotWidget';
import ApplyPage from './components/ApplyPage';
import ProfilePage from './components/ProfilePage';
import SupportPage from './components/SupportPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import type { Application } from './types';

type Page = 'home' | 'apply' | 'profile' | 'support';
type AuthView = 'login' | 'register';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserData {
  profile: UserProfile;
  password?: string; // Stored for simulation purposes
  applications: Application[];
}

interface UserDatabase {
  [email: string]: UserData;
}

const defaultUserProfile: UserProfile = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com'
};

// Helper to get the DB from localStorage
const getUserDb = (): UserDatabase => {
  const db = localStorage.getItem('userProfilesDb');
  return db ? JSON.parse(db) : {};
};

// Helper to save the DB to localStorage
const saveUserDb = (db: UserDatabase) => {
  localStorage.setItem('userProfilesDb', JSON.stringify(db));
};

const App: React.FC = () => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('currentUserEmail');
  });

  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    // Load user data if there's a logged-in user
    if (currentUserEmail) {
      const db = getUserDb();
      const userData = db[currentUserEmail];
      if (userData) {
        setUserProfile(userData.profile);
        setApplications(userData.applications || []);
      } else {
        // Data inconsistency, log out
        handleLogout();
      }
    } else {
      setUserProfile(null);
      setApplications([]);
    }
  }, [currentUserEmail]);
  
  const navigate = (page: Page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), 3000);
  };

  const handleApplicationSubmit = (newApplication: Omit<Application, 'id' | 'submittedDate' | 'status'>) => {
    if (!currentUserEmail) return;

    const submittedApplication: Application = {
      ...newApplication,
      id: new Date().toISOString(),
      submittedDate: new Date().toLocaleDateString(),
      status: 'Submitted',
    };
    
    const db = getUserDb();
    const newApplications = [submittedApplication, ...(db[currentUserEmail].applications || [])];
    db[currentUserEmail].applications = newApplications;
    saveUserDb(db);
    
    setApplications(newApplications);
    navigate('profile');
    showSnackbar('Application submitted successfully!');
  };
  
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    if (!currentUserEmail) return;

    const db = getUserDb();
    if (db[currentUserEmail]) {
      db[currentUserEmail].profile = updatedProfile;
      saveUserDb(db);
      setUserProfile(updatedProfile);
      showSnackbar('Profile updated successfully!');
    }
  };

  const handleLogin = (email: string, password: string): boolean => {
    const db = getUserDb();
    const userData = db[email];
    if (userData && userData.password === password) {
      localStorage.setItem('currentUserEmail', email);
      setCurrentUserEmail(email);
      return true;
    }
    return false;
  };

  const handleRegister = (email: string, password: string): boolean => {
    const db = getUserDb();
    if (db[email]) {
      return false; // User already exists
    }
    
    db[email] = {
      password: password,
      profile: {
        ...defaultUserProfile,
        email: email,
      },
      applications: [],
    };
    saveUserDb(db);
    
    // Automatically log in after registration
    localStorage.setItem('currentUserEmail', email);
    setCurrentUserEmail(email);
    return true;
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currentUserEmail');
    setCurrentUserEmail(null);
    setCurrentPage('home');
    setAuthView('login');
  };

  if (!currentUserEmail || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans p-4">
        {authView === 'login' ? (
          <LoginPage onLogin={handleLogin} switchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onRegister={handleRegister} switchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'apply':
        return <ApplyPage navigate={navigate} onSubmit={handleApplicationSubmit} />;
      case 'profile':
        return <ProfilePage navigate={navigate} applications={applications} userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
      case 'support':
        return <SupportPage navigate={navigate} />;
      case 'home':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white font-sans">
      <header className="bg-slate-900/70 backdrop-blur-md p-4 border-b border-slate-700 shadow-lg sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 cursor-pointer" onClick={() => navigate('home')}>
          Welcome, {userProfile.firstName}
        </h1>
        <button 
          onClick={handleLogout}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 text-sm"
        >
          Sign Out
        </button>
      </header>
      <main className="flex-1">
        {renderPage()}
      </main>
      
      {snackbarMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
          {snackbarMessage}
        </div>
      )}

      <ChatbotWidget />

      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, 10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
