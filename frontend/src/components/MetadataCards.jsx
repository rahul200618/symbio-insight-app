import { motion, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { Icons } from './Icons';
import { BarChart, PieChart } from './Charts';
import { calculateAggregateStats } from '../utils/fastaParser.js';

export function MetadataCards({ parsedSequences = [] }) {
  const [expandedSequence, setExpandedSequence] = useState(null);
  const individualSequencesRef = useRef(null);
  
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

  // Scroll to individual sequences section
  const scrollToSequences = () => {
    if (individualSequencesRef.current) {
      individualSequencesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate nucleotide data for a single sequence
  const getSequenceNucleotideData = (seq) => {
    const total = seq.nucleotideCounts.A + seq.nucleotideCounts.T + seq.nucleotideCounts.G + seq.nucleotideCounts.C;
    return [
      { name: 'A', value: total > 0 ? (seq.nucleotideCounts.A / total) * 100 : 0, count: seq.nucleotideCounts.A, color: '#38bdf8' },
      { name: 'T', value: total > 0 ? (seq.nucleotideCounts.T / total) * 100 : 0, count: seq.nucleotideCounts.T, color: '#22d3ee' },
      { name: 'G', value: total > 0 ? (seq.nucleotideCounts.G / total) * 100 : 0, count: seq.nucleotideCounts.G, color: '#06b6d4' },
      { name: 'C', value: total > 0 ? (seq.nucleotideCounts.C / total) * 100 : 0, count: seq.nucleotideCounts.C, color: '#0ea5e9' },
    ];
  };

  // Generate GC data for a single sequence
  const getSequenceGCData = (seq) => {
    const gcPercent = seq.gcPercentage || 0;
    return [
      { name: 'GC', value: Number(gcPercent.toFixed(1)), count: seq.nucleotideCounts.G + seq.nucleotideCounts.C, color: '#22d3ee' },
      { name: 'AT', value: Number((100 - gcPercent).toFixed(1)), count: seq.nucleotideCounts.A + seq.nucleotideCounts.T, color: '#38bdf8' },
    ];
  };

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

        <motion.div 
          className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
          onClick={scrollToSequences}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-sm">
              <Icons.BarChart className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 bg-purple-500 dark:bg-purple-600 text-white text-xs rounded-lg font-semibold">{totalSequences}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sequences</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSequences}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
            <Icons.ChevronRight className="w-3 h-3" />
            Click to view details
          </p>
        </motion.div>

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

      {/* Individual Sequence Analysis Section */}
      {parsedSequences.length > 0 && (
        <div ref={individualSequencesRef} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-sm">
              <Icons.BarChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Individual Sequence Analysis</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Detailed analytics for each of the {parsedSequences.length} sequences</p>
            </div>
          </div>

          {/* Sequence Cards */}
          <div className="space-y-4">
            {parsedSequences.map((seq, index) => {
              const isExpanded = expandedSequence === index;
              const seqNucleotideData = getSequenceNucleotideData(seq);
              const seqGCData = getSequenceGCData(seq);
              
              return (
                <motion.div
                  key={seq.id || index}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Sequence Header - Always visible */}
                  <motion.div
                    className={`p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setExpandedSequence(isExpanded ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate max-w-md">
                            {seq.sequenceName || seq.name || `Sequence ${index + 1}`}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>{seq.sequenceLength?.toLocaleString() || seq.length?.toLocaleString() || 0} bp</span>
                            <span>GC: {(seq.gcPercentage || seq.gcContent || 0).toFixed(1)}%</span>
                            <span>{seq.orfs?.length || 0} ORFs</span>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                          {/* Quick Stats */}
                          <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sequence Length</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{(seq.sequenceLength || seq.length || 0).toLocaleString()} bp</p>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">GC Content</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{(seq.gcPercentage || seq.gcContent || 0).toFixed(1)}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ORFs Detected</p>
                              <div className="flex items-center gap-1">
                                <Icons.CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{seq.orfs?.length || 0}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-800/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">AT Content</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{(100 - (seq.gcPercentage || seq.gcContent || 0)).toFixed(1)}%</p>
                            </div>
                          </div>

                          {/* Charts Row */}
                          <div className="grid grid-cols-2 gap-6">
                            {/* Nucleotide Distribution Chart */}
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Nucleotide Distribution</h5>
                              <div className="w-full mb-3" style={{ height: '144px' }}>
                                <BarChart key={`bar-${seq.id || index}`} data={seqNucleotideData} minHeight={120} />
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {seqNucleotideData.map((item) => (
                                  <div key={item.name} className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value.toFixed(1)}%</p>
                                    <p className="text-xs text-gray-500">{item.count.toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* GC Content Chart */}
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">GC/AT Ratio</h5>
                              <div className="flex items-center gap-4">
                                <div className="h-36 w-36 flex-shrink-0">
                                  <PieChart key={`pie-${seq.id || index}`} data={seqGCData} />
                                </div>
                                <div className="flex-1 space-y-3">
                                  {seqGCData.map((item) => (
                                    <div key={item.name} className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                                      </div>
                                      <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}%</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ORF Details (if any) */}
                          {seq.orfs && seq.orfs.length > 0 && (
                            <div className="mt-6 p-4 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50">
                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Icons.CheckCircle className="w-4 h-4 text-green-600" />
                                Open Reading Frames ({seq.orfs.length} detected)
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {seq.orfs.slice(0, 6).map((orf, orfIndex) => (
                                  <div key={orfIndex} className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">ORF {orfIndex + 1}</span>
                                      <span className="text-xs text-gray-500">{orf.length} bp</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Position: {orf.start} - {orf.end}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              {seq.orfs.length > 6 && (
                                <p className="text-xs text-gray-500 mt-3 text-center">
                                  + {seq.orfs.length - 6} more ORFs
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
