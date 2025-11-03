import type { TokenEvent, TokenUsageTableRow, TopSessionData, DailyUsageData, ModelPricing, TokenUsageFilters, UserProfile } from '../types';

// --- State ---
let sessionTokenEvents: TokenEvent[] = [];
let sessionId: string | null = null;
let currentUser: UserProfile | null = null;
const currentAccount: string = 'E4E-Relief-Inc';
// In a real app, this might come from an environment variable
const currentEnv: 'Production' | 'Development' = 'Production';

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

// --- Core Functions ---

/**
 * Initializes the tracker for a new user session.
 */
export function init(user: UserProfile) {
  currentUser = user;
  sessionId = `sess-${user.email.split('@')[0]}-${Date.now()}`;
  sessionTokenEvents = [];
  console.log('Token Tracker Initialized for session:', sessionId);
}

/**
 * Resets the tracker on logout.
 */
export function reset() {
  currentUser = null;
  sessionId = null;
  sessionTokenEvents = [];
  console.log('Token Tracker Reset.');
}

/**
 * A simple approximation for token counting since the SDK doesn't expose this.
 * A common rule of thumb is 1 token ~ 4 characters.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Logs a new AI interaction event to the in-memory session store.
 */
export function logEvent(data: {
  feature: TokenEvent['feature'];
  model: TokenEvent['model'];
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
}) {
  if (!currentUser || !sessionId) {
    console.warn('Token Tracker not initialized, skipping log.');
    return;
  }

  const newEvent: TokenEvent = {
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    sessionId: sessionId,
    userId: currentUser.email,
    timestamp: new Date().toISOString(),
    feature: data.feature,
    model: data.model,
    inputTokens: data.inputTokens,
    cachedInputTokens: data.cachedInputTokens || 0,
    outputTokens: data.outputTokens,
    environment: currentEnv,
    account: currentAccount,
  };

  sessionTokenEvents.push(newEvent);
  console.log('Logged Token Event:', newEvent);
}

// --- Data Retrieval Functions (for TokenUsagePage) ---

export function getTokenUsageTableData(filters: TokenUsageFilters): TokenUsageTableRow[] {
    const filteredEvents = sessionTokenEvents.filter(event => 
        (filters.account === 'all' || event.account === filters.account) &&
        (filters.user === 'all' || event.userId === filters.user) &&
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


export function getTopSessionData(filters: TokenUsageFilters): TopSessionData | null {
    const tableData = getTokenUsageTableData(filters);
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


export function getAIAssistantUsageData(filters: TokenUsageFilters): DailyUsageData[] {
    const assistantEvents = sessionTokenEvents.filter(event => 
        event.feature === 'AI Assistant' &&
        (filters.account === 'all' || event.account === filters.account) &&
        (filters.user === 'all' || event.userId === filters.user) &&
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


export function getFilterOptions() {
    if (!currentUser) return { features: [], models: [], environments: [], users: [], accounts: [] };
    
    const userEvents = sessionTokenEvents;
    const features = [...new Set(userEvents.map(e => e.feature))];
    const models = [...new Set(userEvents.map(e => e.model))];
    const environments = [...new Set(userEvents.map(e => e.environment))];
    const users = [...new Set(userEvents.map(e => e.userId))];
    const accounts = [...new Set(userEvents.map(e => e.account))];

    return { features, models, environments, users, accounts };
}
