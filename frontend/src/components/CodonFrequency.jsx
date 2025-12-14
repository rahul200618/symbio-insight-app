import { useState, useMemo } from 'react';
import { motion } from 'motion/react';

/**
 * CodonFrequency - Displays codon frequency analysis with table and charts
 */
export function CodonFrequency({ codonFrequency, codonStats, sequenceName }) {
  const [viewMode, setViewMode] = useState('table'); // 'table', 'chart', 'aminoacid'
  const [sortBy, setSortBy] = useState('count'); // 'count', 'codon', 'aminoacid'
  const [sortOrder, setSortOrder] = useState('desc');

  // Sort and prepare data
  const sortedCodons = useMemo(() => {
    if (!codonFrequency) return [];
    
    const entries = Object.entries(codonFrequency).map(([codon, data]) => ({
      codon,
      ...data
    }));

    return entries.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'count') {
        comparison = b.count - a.count;
      } else if (sortBy === 'codon') {
        comparison = a.codon.localeCompare(b.codon);
      } else if (sortBy === 'aminoacid') {
        comparison = a.aminoAcid.localeCompare(b.aminoAcid);
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [codonFrequency, sortBy, sortOrder]);

  // Get top 10 for chart
  const topCodons = useMemo(() => {
    return [...sortedCodons].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [sortedCodons]);

  // Group by amino acid
  const aminoAcidGroups = useMemo(() => {
    if (!codonFrequency) return {};
    
    const groups = {};
    for (const [codon, data] of Object.entries(codonFrequency)) {
      const aa = data.aminoAcid;
      if (!groups[aa]) {
        groups[aa] = { codons: [], totalCount: 0, symbol: data.symbol, type: data.type };
      }
      groups[aa].codons.push({ codon, ...data });
      groups[aa].totalCount += data.count;
    }
    
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => b[1].totalCount - a[1].totalCount)
    );
  }, [codonFrequency]);

  const getTypeColor = (type) => {
    const colors = {
      'nonpolar': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'polar': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'positive': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'negative': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'stop': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'unknown': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    };
    return colors[type] || colors.unknown;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (!codonFrequency || Object.keys(codonFrequency).length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No codon data available. Sequence may be too short.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              🧬 Codon Frequency Analysis
            </h3>
            {sequenceName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                {sequenceName}
              </p>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-600">
            {['table', 'chart', 'aminoacid'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === mode
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {mode === 'table' ? '📋 Table' : mode === 'chart' ? '📊 Chart' : '🔤 AA Groups'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        {codonStats && (
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Total:</span>
              <span className="font-medium text-gray-900 dark:text-white">{codonStats.totalCodons}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Unique:</span>
              <span className="font-medium text-gray-900 dark:text-white">{codonStats.uniqueCodons}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Start (ATG):</span>
              <span className="font-medium text-green-600 dark:text-green-400">{codonStats.startCodons}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400">Stop:</span>
              <span className="font-medium text-red-600 dark:text-red-400">{codonStats.stopCodons}</span>
            </div>
          </div>
        )}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
              <tr>
                <th 
                  className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('codon')}
                >
                  Codon {sortBy === 'codon' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('aminoacid')}
                >
                  Amino Acid {sortBy === 'aminoacid' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('count')}
                >
                  Count {sortBy === 'count' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300">%</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortedCodons.map((item, index) => (
                <motion.tr
                  key={item.codon}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-2 font-mono font-medium text-purple-600 dark:text-purple-400">
                    {item.codon}
                  </td>
                  <td className="px-4 py-2">
                    <span className="font-medium text-gray-900 dark:text-white">{item.aminoAcid}</span>
                    <span className="text-gray-400 ml-1">({item.symbol})</span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                    {item.count}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500 dark:text-gray-400">
                    {item.percentage}%
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Top 10 Most Frequent Codons</p>
          <div className="space-y-2">
            {topCodons.map((item, index) => {
              const maxCount = topCodons[0]?.count || 1;
              const width = (item.count / maxCount) * 100;
              
              return (
                <motion.div
                  key={item.codon}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-12 font-mono text-sm font-medium text-purple-600 dark:text-purple-400">
                    {item.codon}
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-end pr-2"
                    >
                      {width > 20 && (
                        <span className="text-xs text-white font-medium">{item.count}</span>
                      )}
                    </motion.div>
                  </div>
                  {width <= 20 && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{item.count}</span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                    {item.aminoAcid}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Amino Acid Groups View */}
      {viewMode === 'aminoacid' && (
        <div className="p-4 max-h-80 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(aminoAcidGroups).map(([aa, data], index) => (
              <motion.div
                key={aa}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`p-3 rounded-lg border ${getTypeColor(data.type)} border-current/20`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {aa} ({data.symbol})
                  </span>
                  <span className="text-sm font-bold">{data.totalCount}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.codons.map((c) => (
                    <span
                      key={c.codon}
                      className="px-1.5 py-0.5 bg-white/50 dark:bg-gray-800/50 rounded text-xs font-mono"
                    >
                      {c.codon}: {c.count}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Types:</span>
          <span className={`px-2 py-0.5 rounded-full ${getTypeColor('nonpolar')}`}>Nonpolar</span>
          <span className={`px-2 py-0.5 rounded-full ${getTypeColor('polar')}`}>Polar</span>
          <span className={`px-2 py-0.5 rounded-full ${getTypeColor('positive')}`}>Basic (+)</span>
          <span className={`px-2 py-0.5 rounded-full ${getTypeColor('negative')}`}>Acidic (-)</span>
          <span className={`px-2 py-0.5 rounded-full ${getTypeColor('stop')}`}>Stop</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini Codon Chart for chatbot
 */
export function MiniCodonChart({ codonFrequency, maxItems = 5 }) {
  if (!codonFrequency) return null;
  
  const topCodons = Object.entries(codonFrequency)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, maxItems);
  
  const maxCount = topCodons[0]?.[1]?.count || 1;
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-2">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 font-medium">Top Codons</p>
      <div className="space-y-1.5">
        {topCodons.map(([codon, data]) => (
          <div key={codon} className="flex items-center gap-2 text-xs">
            <span className="w-10 font-mono text-purple-600 dark:text-purple-400">{codon}</span>
            <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                style={{ width: `${(data.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-6 text-gray-600 dark:text-gray-400">{data.count}</span>
            <span className="w-8 text-gray-400">{data.aminoAcid.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CodonFrequency;
