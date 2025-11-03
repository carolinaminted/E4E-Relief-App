import React from 'react';
import type { TokenUsageTableRow } from '../types';

interface TokenUsageTableProps {
  data: TokenUsageTableRow[];
}

const TokenUsageTable: React.FC<TokenUsageTableProps> = ({ data }) => {
  
  const handleExportCSV = () => {
    const headers = ['User', 'Session ID', 'Feature', 'Input Tokens', 'Cached Tokens', 'Output Tokens', 'Total Tokens', 'Cost (USD)'];
    const rows = data.map(row => 
      [
        row.user,
        row.session,
        row.feature,
        row.input,
        row.cached,
        row.output,
        row.total,
        row.cost.toFixed(6)
      ].join(',')
    );
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'token-usage.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-[#003a70]/50 p-4 rounded-lg border border-[#005ca0]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26]">Lifetime Token Usage</h3>
        <button 
          onClick={handleExportCSV}
          disabled={data.length === 0}
          className="bg-[#ff8400] hover:bg-[#e67700] text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="border-b border-[#005ca0] text-xs text-gray-300 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 hidden md:table-cell">User</th>
              <th scope="col" className="px-4 py-3 hidden md:table-cell">Session</th>
              <th scope="col" className="px-4 py-3">Feature</th>
              <th scope="col" className="px-4 py-3 text-right">Input</th>
              <th scope="col" className="px-4 py-3 text-right hidden md:table-cell">Cached</th>
              <th scope="col" className="px-4 py-3 text-right">Output</th>
              <th scope="col" className="px-4 py-3 text-right hidden md:table-cell">Total</th>
              <th scope="col" className="px-4 py-3 text-right">Cost (USD)</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
                data.map((row, index) => (
                    <tr key={`${row.user}-${row.session}-${row.feature}-${index}`} className="border-b border-[#005ca0] hover:bg-[#004b8d]/50">
                        <td className="px-4 py-2 font-medium text-white truncate hidden md:table-cell">{row.user}</td>
                        <td className="px-4 py-2 text-gray-300 font-mono hidden md:table-cell">{row.session}</td>
                        <td className="px-4 py-2 text-gray-200">{row.feature}</td>
                        <td className="px-4 py-2 text-gray-300 text-right">{row.input.toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-300 text-right hidden md:table-cell">{row.cached.toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-300 text-right">{row.output.toLocaleString()}</td>
                        <td className="px-4 py-2 text-white font-semibold text-right hidden md:table-cell">{row.total.toLocaleString()}</td>
                        <td className="px-4 py-2 text-[#edda26] font-semibold text-right">${row.cost.toFixed(4)}</td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400 md:hidden">
                        No token usage data found for the selected filters.
                    </td>
                    <td colSpan={8} className="text-center py-8 text-gray-400 hidden md:table-cell">
                        No token usage data found for the selected filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenUsageTable;