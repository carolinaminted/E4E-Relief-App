import React, { useState } from 'react';
import type { Application } from '../types';

interface ProfilePageProps {
  navigate: (page: 'home') => void;
  applications: Application[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ navigate, applications }) => {
  const [firstName, setFirstName] = useState('Jane');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('home')} className="text-blue-400 hover:text-blue-300 mb-6">&larr; Back to Home</button>
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">My Profile</h1>

      <section className="bg-slate-800 p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Contact Information</h2>
        <form className="space-y-4">
           <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
            <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
            <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white" />
          </div>
           <div className="pt-2">
            <button type="submit" onClick={(e) => e.preventDefault()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">Save Changes</button>
          </div>
        </form>
      </section>

      <section className="bg-slate-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">My Applications</h2>
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map(app => (
              <div key={app.id} className="bg-slate-700 p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{app.event}</p>
                  <p className="text-sm text-slate-400">Submitted: {app.submittedDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-teal-300">${app.requestedAmount.toFixed(2)}</p>
                  <p className="text-sm text-slate-400">Status: <span className="font-medium text-yellow-400">{app.status}</span></p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">You have not submitted any applications yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
