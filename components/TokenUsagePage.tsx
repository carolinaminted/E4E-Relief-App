import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, TokenUsageTableRow, TopSessionData, DailyUsageData, TokenUsageFilters } from '../types';
import { getTokenUsageTableData, getTopSessionData, getAIAssistantUsageData, getFilterOptions } from '../services/tokenTracker';

// FIX: Renamed component import to avoid naming collision with the 'TokenUsageFilters' type.
import TokenUsageFiltersComponent from './TokenUsageFilters';
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
  const [aiAssistantData, setAiAssistantData] = useState<DailyUsageData[]>([]);
  
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
    setAiAssistantData(getAIAssistantUsageData(filters));
    setFilterOptions(getFilterOptions());
  }, [filters]);

  useEffect(() => {
    // Fetch data whenever the component mounts or filters change
    fetchData();
  }, [fetchData]);

  // Set up an interval to refresh the data every 2 seconds to catch new events
  useEffect(() => {
    const interval = setInterval(() => {
        fetchData();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);


  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full relative min-h-[calc(100vh-100px)]">
        {isLoading && <LoadingOverlay message="Loading Analytics..." />}
        <button onClick={() => navigate('support')} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:opacity-80 mb-6">&larr; Back to Support Center</button>
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] text-center">Token Usage</h1>
        
        <div className="space-y-8">
            {/* FIX: Use the renamed component to resolve ambiguity. */}
            <TokenUsageFiltersComponent filters={filters} setFilters={setFilters} filterOptions={filterOptions} />
            <TokenUsageCharts topSession={topSessionData} assistantUsage={aiAssistantData} />
            <TokenUsageTable data={tableData} />
        </div>
    </div>
  );
};

export default TokenUsagePage;
