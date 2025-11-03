import React from 'react';
import type { TopSessionData, DailyUsageData } from '../types';

interface TokenUsageChartsProps {
  topSession: TopSessionData | null;
  assistantUsage: DailyUsageData[];
}

const Bar: React.FC<{ value: number, total: number, color: string, label: string }> = ({ value, total, color, label }) => {
    if (value === 0 || total === 0) return null;
    const percentage = (value / total) * 100;
    return (
        <div style={{ width: `${percentage}%`, backgroundColor: color }} className="h-full flex items-center justify-center text-xs font-bold text-white text-shadow-sm transition-all duration-300" title={`${label}: ${value.toLocaleString()}`}>
            <span className="truncate px-1">{value.toLocaleString()}</span>
        </div>
    );
};

const TopSessionChart: React.FC<{ topSession: TopSessionData | null }> = ({ topSession }) => {
    if (!topSession) {
        return <p className="text-gray-400 text-center">No session data available to display.</p>;
    }
    
    return (
        <>
            <p className="text-sm text-gray-300 mb-1">Session ID: <span className="font-mono text-white">{topSession.sessionId}</span></p>
            <div className="w-full h-8 bg-[#003a70] rounded-md flex overflow-hidden border border-[#005ca0]">
                <Bar value={topSession.inputTokens} total={topSession.totalTokens} color="#005ca0" label="Input" />
                <Bar value={topSession.cachedInputTokens} total={topSession.totalTokens} color="#007bff" label="Cached Input" />
                <Bar value={topSession.outputTokens} total={topSession.totalTokens} color="#ff8400" label="Output" />
            </div>
            <div className="flex justify-end gap-4 mt-2 text-xs">
                <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-[#005ca0] mr-1"></span> Input</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-[#007bff] mr-1"></span> Cached</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-[#ff8400] mr-1"></span> Output</div>
            </div>
        </>
    );
};

const AssistantUsageChart: React.FC<{ usage: DailyUsageData[] }> = ({ usage }) => {
    if (usage.length < 2) {
        return <p className="text-gray-400 text-center">Not enough daily data to display a chart.</p>;
    }

    const width = 500;
    const height = 200;
    const padding = 40;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding;

    const maxTokens = Math.max(...usage.map(d => d.totalTokens), 0);
    const dateToX = (index: number) => (index / (usage.length - 1)) * usableWidth + padding;
    const tokensToY = (tokens: number) => height - (tokens / maxTokens) * usableHeight - (padding/2);

    const points = usage.map((d, i) => `${dateToX(i)},${tokensToY(d.totalTokens)}`).join(' ');

    const yAxisLabels = [0, maxTokens / 2, maxTokens].map(val => ({
        value: val,
        y: tokensToY(val)
    }));

    const xAxisLabels = [usage[0], usage[Math.floor(usage.length/2)], usage[usage.length - 1]].map((d,i) => {
        const index = i === 0 ? 0 : i === 1 ? Math.floor(usage.length/2) : usage.length - 1;
        return {
            value: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            x: dateToX(index)
        };
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Y-Axis Grid Lines & Labels */}
            {yAxisLabels.map(({ value, y }) => (
                <g key={value}>
                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#005ca0" strokeWidth="1" />
                    <text x={padding - 5} y={y + 3} fill="#9ca3af" textAnchor="end" fontSize="10">
                        {Math.round(value).toLocaleString()}
                    </text>
                </g>
            ))}
            {/* X-Axis Labels */}
            {xAxisLabels.map(({ value, x }) => (
                <text key={value} x={x} y={height - 5} fill="#9ca3af" textAnchor="middle" fontSize="10">{value}</text>
            ))}
            
            {/* Data Line */}
            <polyline points={points} fill="none" stroke="#ff8400" strokeWidth="2" />
        </svg>
    );
};


const TokenUsageCharts: React.FC<TokenUsageChartsProps> = ({ topSession, assistantUsage }) => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-[#003a70]/50 p-4 rounded-lg border border-[#005ca0]">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4">Highest-Token Session</h3>
        <TopSessionChart topSession={topSession} />
      </div>
      <div className="bg-[#003a70]/50 p-4 rounded-lg border border-[#005ca0]">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4">AI Relief Assistant All-Time Usage</h3>
        <AssistantUsageChart usage={assistantUsage} />
      </div>
    </div>
  );
};

export default TokenUsageCharts;