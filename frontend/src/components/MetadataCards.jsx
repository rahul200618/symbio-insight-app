import { motion } from 'motion/react';
import { Icons } from './Icons';
import { BarChart, PieChart } from './Charts';
import { calculateAggregateStats } from '../utils/fastaParser.js';

export function MetadataCards({ parsedSequences = [] }) {
  const stats = parsedSequences.length > 0
    ? calculateAggregateStats(parsedSequences)
    : null;

  // Debug logging
  console.log('MetadataCards - parsedSequences:', parsedSequences.length);
  console.log('MetadataCards - stats:', stats);

  const nucleotideData = stats
    ? [
      { name: 'A', value: stats.nucleotideDistribution.A, count: stats.nucleotideCounts.A, color: '#38bdf8' },
      { name: 'T', value: stats.nucleotideDistribution.T, count: stats.nucleotideCounts.T, color: '#22d3ee' },
      { name: 'G', value: stats.nucleotideDistribution.G, count: stats.nucleotideCounts.G, color: '#06b6d4' },
      { name: 'C', value: stats.nucleotideDistribution.C, count: stats.nucleotideCounts.C, color: '#0ea5e9' },
    ]
    : [
      { name: 'A', value: 0, count: 0, color: '#38bdf8' },
      { name: 'T', value: 0, count: 0, color: '#22d3ee' },
      { name: 'G', value: 0, count: 0, color: '#06b6d4' },
      { name: 'C', value: 0, count: 0, color: '#0ea5e9' },
    ];

  console.log('MetadataCards - nucleotideData:', nucleotideData);

  const gcPercentage = stats ? stats.avgGC : 0;
  const atPercentage = stats ? (100 - stats.avgGC) : 0;

  // Calculate raw counts for GC/AT if stats exist
  const totalBases = stats ? stats.totalLength : 0;
  // This is an approximation based on averages if we don't sum them explicitly, 
  // but we have exact counts now for nucleotideData. 
  // GC count = G count + C count
  const gcCount = stats ? (stats.nucleotideCounts.G + stats.nucleotideCounts.C) : 0;
  const atCount = stats ? (stats.nucleotideCounts.A + stats.nucleotideCounts.T) : 0;

  const gcData = [
    { name: 'GC', value: Number(gcPercentage.toFixed(1)), count: gcCount, color: '#22d3ee' },
    { name: 'AT', value: Number(atPercentage.toFixed(1)), count: atCount, color: '#38bdf8' },
  ];

  const totalSequences = stats?.totalSequences ?? 0;
  const totalLength = stats?.totalLength ?? 0;
  const totalORFs = stats?.totalORFs ?? 0;
  const avgLength = stats?.avgLength ?? 0;
  const longestSeq = stats?.longestSequence ?? 0;
  const shortestSeq = stats?.shortestSequence ?? 0;

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      {parsedSequences.length > 0 && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <Icons.CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Using parsed sequence data ({parsedSequences.length} sequences)
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                All metadata extracted: sequence names, lengths, GC%, nucleotide counts, and ORFs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Icons.Activity className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-purple-500 dark:bg-purple-600 text-white text-xs rounded-lg font-semibold">
              {stats ? 'Parsed' : 'Sample'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Base Pairs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLength.toLocaleString()} bp</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Icons.PieChart className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-indigo-500 dark:bg-indigo-600 text-white text-xs rounded-lg font-semibold">Optimal</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">GC Content</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{gcPercentage.toFixed(1)}%</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-sm">
              <Icons.BarChart className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-purple-500 dark:bg-purple-600 text-white text-xs rounded-lg font-semibold">{totalSequences}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sequences</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSequences}</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-sm">
              <Icons.CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-green-500 dark:bg-green-600 text-white text-xs rounded-lg font-semibold">Detected</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ORF Detection</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalORFs} ORFs</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6" key={parsedSequences.length > 0 ? parsedSequences[0]?.timestamp : 'empty'}>
        {/* Nucleotide Distribution */}
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Nucleotide Distribution</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Base pair composition analysis</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Icons.BarChart className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="w-full h-48 mb-4">
            <BarChart key={JSON.stringify(nucleotideData)} data={nucleotideData} />
          </div>

          {/* Data Labels - matching image design */}
          <div className="grid grid-cols-4 gap-3">
            {nucleotideData.map((item, index) => (
              <motion.div
                key={item.name}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</p>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.value.toFixed(1)}%</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* GC Content Analysis */}
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">GC Content Analysis</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Guanine-Cytosine ratio</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Icons.PieChart className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="h-48 w-48 flex-shrink-0">
              <PieChart data={gcData} />
            </div>

            <div className="flex-1 space-y-4">
              {gcData.map((item) => (
                <div key={item.name} className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name} Content</p>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Icons.Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Sequence Statistics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive analysis results</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average Sequence Length</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{avgLength} bp</p>
          </div>
          <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Longest Sequence</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{longestSeq.toLocaleString()} bp</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Shortest Sequence</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{shortestSeq} bp</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ORFs Detected</p>
            <div className="flex items-center gap-2">
              <Icons.CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalORFs}</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-800/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Sequences</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalSequences}</p>
          </div>
          <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Base Pairs</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalLength.toLocaleString()} bp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
