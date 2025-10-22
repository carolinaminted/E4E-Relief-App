import React, { useState } from 'react';
import type { Application, UserProfile } from '../types';
import ApplicationDetailModal from './ApplicationDetailModal';

interface ProfilePageProps {
  navigate: (page: 'home' | 'apply') => void;
  applications: Application[];
  userProfile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const statusStyles: Record<Application['status'], string> = {
    Submitted: 'text-[#ff8400]',
    Awarded: 'text-[#edda26]',
    Declined: 'text-red-400',
};

const ProfilePage: React.FC<ProfilePageProps> = ({ navigate, applications, userProfile, onProfileUpdate }) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileUpdate(formData);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('home')} className="text-[#ff8400] hover:text-[#ff9d33] mb-6">&larr; Back to Home</button>
      
      {/* Contact Information Section */}
      <section className="bg-[#004b8d] p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#ff8400]">Contact Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
           <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-white mb-1">First Name</label>
            <input type="text" id="firstName" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-[#005ca0] border border-[#005ca0] rounded-md p-2 text-white" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-white mb-1">Last Name</label>
            <input type="text" id="lastName" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-[#005ca0] border border-[#005ca0] rounded-md p-2 text-white" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email Address</label>
            <input type="email" id="email" value={formData.email} disabled className="w-full bg-[#003a70] border border-[#002a50] rounded-md p-2 text-gray-400 cursor-not-allowed" />
          </div>
           <div className="pt-2">
            <button type="submit" className="bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">Save Changes</button>
          </div>
        </form>
      </section>

      {/* Applications Section */}
      <section className="bg-[#004b8d] p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-[#ff8400]">My Applications</h2>
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map(app => (
              <button key={app.id} onClick={() => setSelectedApplication(app)} className="w-full text-left bg-[#005ca0] p-4 rounded-md flex justify-between items-center hover:bg-[#005ca0]/50 transition-colors duration-200">
                <div>
                  <p className="font-bold text-lg">{app.event}</p>
                  <p className="text-sm text-gray-300">Submitted: {app.submittedDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-[#ff8400]">${app.requestedAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-300">Status: <span className={`font-medium ${statusStyles[app.status]}`}>{app.status}</span></p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 bg-[#003a70]/50 rounded-lg">
                <p className="text-gray-300">You have not submitted any applications yet.</p>
                <button onClick={() => navigate('apply')} className="mt-4 bg-[#ff8400] hover:bg-[#e67700] text-white font-bold py-2 px-4 rounded-md">
                Apply Now
                </button>
            </div>
          )}
        </div>
      </section>

      {selectedApplication && (
        <ApplicationDetailModal 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)} 
        />
      )}
    </div>
  );
};

export default ProfilePage;