import React from 'react';
import type { Application } from '../types';

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
}

const statusStyles: Record<Application['status'], string> = {
    Submitted: 'bg-[#ff8400]/20 text-[#ff8400]',
    Awarded: 'bg-[#edda26]/20 text-[#edda26]',
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
        className="bg-[#004b8d] rounded-lg shadow-xl p-8 w-full max-w-lg m-4 relative border border-[#002a50]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">
          Application Details
        </h2>
        <div className="space-y-4 text-white">
          <div className="flex justify-between border-b border-[#002a50] pb-2">
            <span className="font-semibold text-white opacity-70">Application ID:</span>
            <span className="font-mono">{application.id}</span>
          </div>
          <div className="flex justify-between border-b border-[#002a50] pb-2 items-center">
            <span className="font-semibold text-white opacity-70">Status:</span>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[application.status]}`}>
                {application.status}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#002a50] pb-2">
            <span className="font-semibold text-white opacity-70">Submitted Date:</span>
            <span>{application.submittedDate}</span>
          </div>
          <div className="flex justify-between border-b border-[#002a50] pb-2">
            <span className="font-semibold text-white opacity-70">Hire Date:</span>
            <span>{application.hireDate}</span>
          </div>
          <div className="flex justify-between border-b border-[#002a50] pb-2">
            <span className="font-semibold text-white opacity-70">Event Type:</span>
            <span>{application.event}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-white opacity-70">Requested Amount:</span>
            <span className="font-bold text-[#ff8400]">${application.requestedAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;