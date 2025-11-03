import type { TokenEvent, TokenUsageTableRow, TopSessionData, DailyUsageData, ModelPricing, TokenUsageFilters } from '../types';

const MODEL_PRICING: ModelPricing = {
  'gemini-2.5-flash': {
    input: 0.00035, // Price per 1000 tokens
    output: 0.00070,
  },
  'gemini-2.5-pro': {
    input: 0.0035,
    output: 0.0070,
  },
};

const MOCK_USERS = ['user@example.com', 'admin@example.com', 'test@example.com'];
const MOCK_FEATURES: TokenEvent['feature'][] = ['AI Assistant', 'Address Parsing', 'Application Parsing', 'Final Decision'];
const MOCK_MODELS: TokenEvent['model'][] = ['gemini-2.5-flash', 'gemini-2.5-pro'];

// --- Generate realistic mock data ---
let mockTokenEvents: TokenEvent[] = [];

if (typeof window !== 'undefined') {
  // Generate data only once and store it in window to persist across hot reloads in dev
  if (!(window as any).__mockTokenEvents) {
    const generatedEvents: TokenEvent[] = [];
    const now = new Date();
    for (let i = 0; i < 300; i++) {
      const user = MOCK_USERS[i % MOCK_USERS.length];
      const date = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      
      generatedEvents.push({
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        sessionId: `sess-${user.split('@')[0]}-${Math.floor(Math.random() * 5)}`,
        userId: user,
        timestamp: date.toISOString(),
        feature: MOCK_FEATURES[Math.floor(Math.random() * MOCK_FEATURES.length)],
        model: MOCK_MODELS[Math.floor(Math.random() * MOCK_MODELS.length)],
        inputTokens: Math.floor(Math.random() * 1000) + 50,
        // Let's assume gemini-2.5-pro supports cached tokens
        cachedInputTokens: Math.random() > 0.5 ? Math.floor(Math.random() * 200) : 0,
        outputTokens: Math.floor(Math.random() * 500) + 20,
        environment: Math.random() > 0.2 ? 'Production' : 'Development',
        account: 'E4E-Relief-Inc',
      });
    }
    (window as any).__mockTokenEvents = generatedEvents;
  }
  mockTokenEvents = (window as any).__mockTokenEvents;
}


// --- Simulate API Endpoints ---

// Simulates GET /analytics/token-usage/table
export async function getTokenUsageTableData(filters: TokenUsageFilters, currentUserEmail: string): Promise<TokenUsageTableRow[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency

    const filteredEvents = mockTokenEvents.filter(event => 
        event.userId === currentUserEmail && // Scope to current user
        (filters.feature === 'all' || event.feature === filters.feature) &&
        (filters.model === 'all' || event.model === filters.model) &&
        (filters.environment === 'all' || event.environment === filters.environment)
    );

    const usageBySession: { [key: string]: Omit<TokenUsageTableRow, 'user' | 'session'> } = {};

    for (const event of filteredEvents) {
        const key = `${event.userId}|${event.sessionId}`;
        if (!usageBySession[key]) {
            usageBySession[key] = { input: 0, cached: 0, output: 0, total: 0, cost: 0 };
        }
        const pricing = MODEL_PRICING[event.model] || { input: 0, output: 0 };
        const eventCost = ((event.inputTokens / 1000) * pricing.input) + ((event.outputTokens / 1000) * pricing.output);

        usageBySession[key].input += event.inputTokens;
        usageBySession[key].cached += event.cachedInputTokens;
        usageBySession[key].output += event.outputTokens;
        usageBySession[key].total += event.inputTokens + event.cachedInputTokens + event.outputTokens;
        usageBySession[key].cost += eventCost;
    }

    return Object.entries(usageBySession).map(([key, data]) => {
        const [user, session] = key.split('|');
        return { user, session, ...data };
    });
}


// Simulates GET /top-session
export async function getTopSessionData(filters: TokenUsageFilters, currentUserEmail: string): Promise<TopSessionData | null> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const tableData = await getTokenUsageTableData(filters, currentUserEmail);
    if (tableData.length === 0) return null;

    const topSession = tableData.reduce((max, current) => current.total > max.total ? current : max, tableData[0]);
    
    return {
        sessionId: topSession.session,
        inputTokens: topSession.input,
        cachedInputTokens: topSession.cached,
        outputTokens: topSession.output,
        totalTokens: topSession.total,
    };
}


// Simulates GET /ai-assistant/all-time
export async function getAIAssistantUsageData(filters: TokenUsageFilters, currentUserEmail: string): Promise<DailyUsageData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const assistantEvents = mockTokenEvents.filter(event => 
        event.userId === currentUserEmail && 
        event.feature === 'AI Assistant' &&
        (filters.model === 'all' || event.model === filters.model) &&
        (filters.environment === 'all' || event.environment === filters.environment)
    );

    const usageByDay: { [key: string]: number } = {};
    
    for (const event of assistantEvents) {
        const date = event.timestamp.split('T')[0];
        if (!usageByDay[date]) {
            usageByDay[date] = 0;
        }
        usageByDay[date] += event.inputTokens + event.cachedInputTokens + event.outputTokens;
    }

    return Object.entries(usageByDay)
        .map(([date, totalTokens]) => ({ date, totalTokens }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// --- Helper to get distinct filter options from data ---
export function getFilterOptions(currentUserEmail: string) {
    const userEvents = mockTokenEvents.filter(e => e.userId === currentUserEmail);
    const features = [...new Set(userEvents.map(e => e.feature))];
    const models = [...new Set(userEvents.map(e => e.model))];
    const environments = [...new Set(userEvents.map(e => e.environment))];
    const users = [...new Set(userEvents.map(e => e.userId))]; // will just be the current user
    const accounts = [...new Set(userEvents.map(e => e.account))];

    return { features, models, environments, users, accounts };
}
