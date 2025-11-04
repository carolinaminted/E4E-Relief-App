import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, TokenUsageTableRow, TopSessionData, LastHourUsageDataPoint, TokenUsageFilters } from '../types';
import { getTokenUsageTableData, getTopSessionData, getUsageLastHour, getFilterOptions } from '../services/tokenTracker';

// FIX: Changed to a named import with an alias to prevent any possible ambiguity with the TokenUsageFilters type.
import { TokenUsageFilters as TokenUsageFiltersComponent } from './TokenUsageFilters';
import TokenUsageCharts from './TokenUsageCharts';
import TokenUsageTable from './TokenUsageTable';
import LoadingOverlay from './LoadingOverlay';

interface TokenUsagePageProps {
  navigate: (page: 'support') => void;
  currentUser: UserProfile;
}

const TokenUsagePage: React.FC<TokenUsagePageProps> = ({ navigate, currentUser }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<TokenUsageTableRow[]>([]);
  const [topSessionData, setTopSessionData] = useState<TopSessionData | null>(null);
  const [lastHourUsage, setLastHourUsage] = useState<LastHourUsageDataPoint[]>([]);
  
  const [filterOptions, setFilterOptions] = useState(getFilterOptions());

  const [filters, setFilters] = useState<TokenUsageFilters>({
    account: 'all',
    dateRange: { start: '', end: '' }, // Currently unused but kept for UI consistency
    feature: 'all',
    user: 'all',
    model: 'all',
    environment: 'all',
  });
  
  const fetchData = useCallback(() => {
    // Data is now synchronous and pulled from the local tracker service
    setTableData(getTokenUsageTableData(filters));
    setTopSessionData(getTopSessionData(filters));
    setLastHourUsage(getUsageLastHour(filters));
    setFilterOptions(getFilterOptions());
  }, [filters]);

  useEffect(() => {
    // Fetch data whenever the component mounts or filters change
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full relative min-h-[calc(100vh-100px)]">
        {isLoading && <LoadingOverlay message="Loading Analytics..." />}
        
        <div className="relative flex justify-center items-center mb-6">
             <button onClick={() => navigate('support')} className="absolute left-0 text-[#ff8400] hover:opacity-80 transition-opacity" aria-label="Back to Support Center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
            </button>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Token Usage</h1>
            <button 
                onClick={fetchData} 
                className="absolute right-0 bg-[#004b8d] hover:bg-[#005ca0] text-white font-semibold p-2 rounded-md text-sm transition-colors duration-200 flex items-center justify-center border border-[#005ca0]"
                aria-label="Refresh data"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        
        <div className="space-y-8">
            <TokenUsageFiltersComponent filters={filters} setFilters={setFilters} filterOptions={filterOptions} />
            <TokenUsageCharts topSession={topSessionData} lastHourUsage={lastHourUsage} />
            <TokenUsageTable data={tableData} />
        </div>
    </div>
  );
};

export default TokenUsagePage;