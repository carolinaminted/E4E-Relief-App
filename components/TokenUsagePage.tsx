import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, TokenUsageTableRow, TopSessionData, DailyUsageData, TokenUsageFilters } from '../types';
import { getTokenUsageTableData, getTopSessionData, getAIAssistantUsageData, getFilterOptions } from '../data/tokenData';

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
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<TokenUsageTableRow[]>([]);
  const [topSessionData, setTopSessionData] = useState<TopSessionData | null>(null);
  const [aiAssistantData, setAiAssistantData] = useState<DailyUsageData[]>([]);
  
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  const filterOptions = getFilterOptions(currentUser.email);

  const [filters, setFilters] = useState<TokenUsageFilters>({
    account: filterOptions.accounts[0] || 'all',
    dateRange: { start: thirtyDaysAgo, end: today },
    feature: 'all',
    user: currentUser.email,
    model: 'all',
    environment: 'all',
  });
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [table, topSession, assistantUsage] = await Promise.all([
            getTokenUsageTableData(filters, currentUser.email),
            getTopSessionData(filters, currentUser.email),
            getAIAssistantUsageData(filters, currentUser.email)
        ]);
        setTableData(table);
        setTopSessionData(topSession);
        setAiAssistantData(assistantUsage);
    } catch (error) {
        console.error("Failed to fetch token usage data:", error);
    } finally {
        setIsLoading(false);
    }
  }, [filters, currentUser.email]);

  useEffect(() => {
    fetchData();
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