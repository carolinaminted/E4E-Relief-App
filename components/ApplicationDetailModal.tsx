
import React from 'react';
import type { Application } from '../types';

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
}

const statusStyles: Record<Application['status'], string> = {
    Submitted: 'bg-yellow-800 text-yellow-100',
    Awarded: 'bg-green-800 text-green-100',
    Declined: 'bg-red-800 text-red-100',
};

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ application, onClose }) => {
  if (!application) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-lg m-4 relative border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          Application Details
        </h2>
        <div className="space-y-4 text-slate-300">
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="font-semibold text-slate-400">Application ID:</span>
            <span className="font-mono">{application.id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2 items-center">
            <span className="font-semibold text-slate-400">Status:</span>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[application.status]}`}>
                {application.status}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="font-semibold text-slate-400">Submitted Date:</span>
            <span>{application.submittedDate}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="font-semibold text-slate-400">Hire Date:</span>
            <span>{application.hireDate}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="font-semibold text-slate-400">Event Type:</span>
            <span>{application.event}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Requested Amount:</span>
            <span className="font-bold text-teal-300">${application.requestedAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;