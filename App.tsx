import React, { useState } from 'react';
import HomePage from './components/HomePage';
import ChatbotWidget from './components/ChatbotWidget';
import ApplyPage from './components/ApplyPage';
import ProfilePage from './components/ProfilePage';
import SupportPage from './components/SupportPage';
import type { Application } from './types';

type Page = 'home' | 'apply' | 'profile' | 'support';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [applications, setApplications] = useState<Application[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const navigate = (page: Page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), 3000);
  };

  const handleApplicationSubmit = (newApplication: Omit<Application, 'id' | 'submittedDate' | 'status'>) => {
    const submittedApplication: Application = {
      ...newApplication,
      id: new Date().toISOString(),
      submittedDate: new Date().toLocaleDateString(),
      status: 'Submitted',
    };
    setApplications(prev => [submittedApplication, ...prev]);
    navigate('profile');
    showSnackbar('Application submitted successfully!');
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'apply':
        return <ApplyPage navigate={navigate} onSubmit={handleApplicationSubmit} />;
      case 'profile':
        return <ProfilePage navigate={navigate} applications={applications} />;
      case 'support':
        return <SupportPage navigate={navigate} />;
      case 'home':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white font-sans">
      <header className="bg-slate-900/70 backdrop-blur-md p-4 border-b border-slate-700 shadow-lg sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 cursor-pointer" onClick={() => navigate('home')}>
          E4E Relief POC
        </h1>
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
