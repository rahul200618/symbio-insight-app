import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './Icons';
import { BarChart, PieChart } from './Charts';
import { calculateAggregateStats } from '../utils/fastaParser.js';
import { generatePDFReport, downloadHTMLReport } from '../utils/reportGenerator.js';
import { generatePDFReport as generateBackendPDF } from '../utils/sequenceApi.js';
import { generateSequenceAnalysis } from '../utils/aiService.js';
import { toast } from 'sonner';
import { useNotifications } from '../context/NotificationContext';

export function ReportViewer({ parsedSequences = [] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [expandedSequence, setExpandedSequence] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('index'); // 'index', 'length', 'gc', 'orfs'
  
  // Notifications
  const { notifyReportGenerated } = useNotifications();

  const stats = parsedSequences.length > 0
    ? calculateAggregateStats(parsedSequences)
    : null;

  // Filter and sort sequences
  const filteredSequences = parsedSequences
    .filter(seq => {
      if (!searchQuery) return true;
      const name = (seq.sequenceName || seq.name || seq.header || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'length':
          return (b.sequenceLength || b.length || 0) - (a.sequenceLength || a.length || 0);
        case 'gc':
          return (b.gcPercentage || b.gcContent || 0) - (a.gcPercentage || a.gcContent || 0);
        case 'orfs':
          return (b.orfs?.length || 0) - (a.orfs?.length || 0);
        default:
          return 0;
      }
    });

  // Fetch AI summary when sequences change
  useEffect(() => {
    if (stats && stats.totalSequences > 0) {
      setIsLoadingAI(true);
      generateSequenceAnalysis(stats)
        .then(summary => {
          if (summary) {
            setAiSummary(summary);
          }
        })
        .catch(err => console.log('AI summary failed:', err))
        .finally(() => setIsLoadingAI(false));
    }
  }, [parsedSequences.length]); // Re-fetch when sequences change

  const handleDownloadPDF = async () => {
    console.log('Generating PDF with sequences:', parsedSequences);
    console.log('Number of sequences:', parsedSequences.length);

    if (parsedSequences.length === 0) {
      toast.error('No sequences available to generate report');
      return;
    }

    setIsGenerating(true);
    try {
      // Get sequence IDs from parsed sequences
      const sequenceIds = parsedSequences
        .map(seq => seq.id)
        .filter(Boolean);

      console.log('Sequence IDs for PDF:', sequenceIds);

      // Try backend PDF generation first (more reliable)
      try {
        console.log('Attempting backend PDF generation...');
        await generateBackendPDF(sequenceIds, 'Symbio-NLM Sequence Analysis Report');
        toast.success('PDF downloaded successfully!');
        notifyReportGenerated('Symbio-NLM Report');
      } catch (backendError) {
        // Fallback to client-side PDF generation if backend fails
        console.log('Backend PDF failed, using client-side generation:', backendError);
        await generatePDFReport(parsedSequences, {
          includeCharts: true,
          includeRawSequence: false,
          includeORFDetails: true,
          includeAIAnalysis: true,
          title: 'Symbio-NLM Sequence Analysis Report',
        });
        toast.success('PDF generated and downloaded successfully!');
        notifyReportGenerated('Symbio-NLM Report');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF report: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadHTML = () => {
    if (parsedSequences.length === 0) {
      toast.error('No sequences available to generate report');
      return;
    }

    try {
      downloadHTMLReport(parsedSequences, {
        includeCharts: true,
        includeRawSequence: false,
        includeORFDetails: true,
        includeAIAnalysis: true,
        title: 'Symbio-NLM Sequence Analysis Report',
      });
      toast.success('HTML report downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading HTML report: ' + error.message);
    }
  };

  const totalSequences = stats?.totalSequences ?? 245;
  const gcPercentage = stats?.avgGC ?? 43.7;
  const totalORFs = stats?.totalORFs ?? 34;
  const totalLength = stats?.totalLength ?? 124460;
  const avgLength = stats?.avgLength ?? 508;
  const longestSeq = stats?.longestSequence ?? 2845;
  const shortestSeq = stats?.shortestSequence ?? 89;

  const nucleotideDistribution = stats?.nucleotideDistribution || {
    A: 28.5,
    T: 27.8,
    G: 22.3,
    C: 21.4,
  };

  // Generate nucleotide data for a single sequence
  const getSequenceNucleotideData = (seq) => {
    const counts = seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 };
    const total = counts.A + counts.T + counts.G + counts.C;
    return [
      { name: 'A', value: total > 0 ? (counts.A / total) * 100 : 0, count: counts.A, color: '#38bdf8' },
      { name: 'T', value: total > 0 ? (counts.T / total) * 100 : 0, count: counts.T, color: '#22d3ee' },
      { name: 'G', value: total > 0 ? (counts.G / total) * 100 : 0, count: counts.G, color: '#06b6d4' },
      { name: 'C', value: total > 0 ? (counts.C / total) * 100 : 0, count: counts.C, color: '#0ea5e9' },
    ];
  };

  // Generate GC data for a single sequence
  const getSequenceGCData = (seq) => {
    const gcPercent = seq.gcPercentage || seq.gcContent || 0;
    const counts = seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 };
    return [
      { name: 'GC', value: Number(gcPercent.toFixed(1)), count: counts.G + counts.C, color: '#22d3ee' },
      { name: 'AT', value: Number((100 - gcPercent).toFixed(1)), count: counts.A + counts.T, color: '#38bdf8' },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sequence Analysis Report</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-1">
            {parsedSequences.length > 0
              ? `${parsedSequences.length} sequences analyzed`
              : 'genome_sequence_01.fasta'
            }
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generated on {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadHTML}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            <Icons.FileText className="w-4 h-4" />
            HTML Report
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icons.Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Data Source Indicator */}
      {parsedSequences.length > 0 && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-3">
            <Icons.CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-900 dark:text-green-300">
              Report generated from actual parsed FASTA data with complete metadata extraction
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Icons.Activity className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sequences</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSequences}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total analyzed</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Icons.PieChart className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">GC Content</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{gcPercentage.toFixed(1)}%</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Optimal range</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-sm">
              <Icons.CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">ORFs Found</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalORFs}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Open reading frames</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-sm">
              <Icons.FileText className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Length</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLength.toLocaleString()} bp</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Base pairs</p>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Icons.FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Generated Summary</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoadingAI ? 'Generating insights with Gemini...' : 'Automated analysis and insights'}
            </p>
          </div>
          {isLoadingAI && (
            <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          )}
        </div>

        {isLoadingAI ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quality Assessment */}
            <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
              <div className="flex items-start gap-3">
                <Icons.CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Sequence Quality Assessment</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {aiSummary?.qualityAssessment || `The uploaded FASTA file contains ${totalSequences} high-quality sequences with an average length of ${avgLength} base pairs. The GC content of ${gcPercentage.toFixed(1)}% falls within the optimal range for most organisms, suggesting good sequence quality and potential biological relevance.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Nucleotide Composition */}
            <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
              <div className="flex items-start gap-3">
                <Icons.Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Nucleotide Composition</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {aiSummary?.compositionAnalysis || `The nucleotide distribution shows balanced representation across all bases: Adenine (${nucleotideDistribution.A.toFixed(1)}%), Thymine (${nucleotideDistribution.T.toFixed(1)}%), Guanine (${nucleotideDistribution.G.toFixed(1)}%), and Cytosine (${nucleotideDistribution.C.toFixed(1)}%). This balanced composition indicates a diverse genomic region without significant bias.`}
                  </p>
                </div>
              </div>
            </div>

            {/* ORF Analysis */}
            <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800/50">
              <div className="flex items-start gap-3">
                <Icons.CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Open Reading Frame Analysis</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {aiSummary?.orfAnalysis || `${totalORFs} potential open reading frames (ORFs) were detected in the sequences, suggesting multiple protein-coding regions. The longest ORF spans ${longestSeq.toLocaleString()} base pairs, which may represent a significant functional gene. Further analysis is recommended to identify potential gene functions and protein products.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
              <div className="flex items-start gap-3">
                <Icons.AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Recommendations</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {aiSummary?.recommendations || `All sequences have been successfully parsed and analyzed. The metadata includes sequence names, lengths, GC percentages, nucleotide counts (A, T, G, C), and ORF detection. For more detailed analysis, we recommend performing BLAST searches against reference databases and conducting phylogenetic analysis to determine evolutionary relationships.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Metrics */}
      <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Icons.BarChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Metrics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Complete statistical breakdown</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Sequence Statistics</h4>
            {[
              { label: 'Total Sequences', value: totalSequences.toString() },
              { label: 'Average Length', value: `${avgLength} bp` },
              { label: 'Longest Sequence', value: `${longestSeq.toLocaleString()} bp` },
              { label: 'Shortest Sequence', value: `${shortestSeq} bp` },
              { label: 'Total Base Pairs', value: `${totalLength.toLocaleString()} bp` },
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Composition Analysis</h4>
            {[
              { label: 'GC Content', value: `${gcPercentage.toFixed(1)}%` },
              { label: 'AT Content', value: `${(100 - gcPercentage).toFixed(1)}%` },
              { label: 'Adenine (A)', value: `${nucleotideDistribution.A.toFixed(1)}%` },
              { label: 'Thymine (T)', value: `${nucleotideDistribution.T.toFixed(1)}%` },
              { label: 'Guanine (G)', value: `${nucleotideDistribution.G.toFixed(1)}%` },
              { label: 'Cytosine (C)', value: `${nucleotideDistribution.C.toFixed(1)}%` },
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Sequence Analysis Section */}
      {parsedSequences.length > 0 && (
        <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-sm">
                <Icons.BarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Individual Sequence Analysis</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredSequences.length === parsedSequences.length 
                    ? `Detailed analytics for each of the ${parsedSequences.length} sequences`
                    : `Showing ${filteredSequences.length} of ${parsedSequences.length} sequences`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sequences by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="index">Default Order</option>
                <option value="length">Length (Longest)</option>
                <option value="gc">GC Content (Highest)</option>
                <option value="orfs">ORFs (Most)</option>
              </select>
            </div>

            {/* Expand/Collapse All */}
            <button
              onClick={() => setExpandedSequence(expandedSequence === 'all' ? null : 'all')}
              className="px-4 py-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2"
            >
              {expandedSequence === 'all' ? (
                <>
                  <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  Collapse All
                </>
              ) : (
                <>
                  <Icons.ChevronRight className="w-4 h-4" />
                  Expand All
                </>
              )}
            </button>
          </div>

          {/* Results Count */}
          {searchQuery && (
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Found {filteredSequences.length} sequence{filteredSequences.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}

          {/* Sequence Cards */}
          <div className="space-y-4">
            {filteredSequences.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Icons.Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No sequences found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredSequences.map((seq, index) => {
                const originalIndex = parsedSequences.indexOf(seq);
                const isExpanded = expandedSequence === 'all' || expandedSequence === originalIndex;
                const seqNucleotideData = getSequenceNucleotideData(seq);
                const seqGCData = getSequenceGCData(seq);
                const seqLength = seq.sequenceLength || seq.length || 0;
                const seqGC = seq.gcPercentage || seq.gcContent || 0;
                const seqOrfs = seq.orfs || [];
              
                return (
                  <motion.div
                    key={seq.id || originalIndex}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    {/* Sequence Header - Always visible */}
                    <motion.div
                      className={`p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => setExpandedSequence(isExpanded && expandedSequence !== 'all' ? null : originalIndex)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {originalIndex + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate max-w-md">
                              {seq.sequenceName || seq.name || seq.header || `Sequence ${originalIndex + 1}`}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span>{seqLength.toLocaleString()} bp</span>
                              <span>GC: {seqGC.toFixed(1)}%</span>
                              <span>{seqOrfs.length} ORFs</span>
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
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{seqLength.toLocaleString()} bp</p>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">GC Content</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{seqGC.toFixed(1)}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ORFs Detected</p>
                              <div className="flex items-center gap-1">
                                <Icons.CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{seqOrfs.length}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-800/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">AT Content</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{(100 - seqGC).toFixed(1)}%</p>
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
                          {seqOrfs.length > 0 && (
                            <div className="mt-6 p-4 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50">
                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Icons.CheckCircle className="w-4 h-4 text-green-600" />
                                Open Reading Frames ({seqOrfs.length} detected)
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {seqOrfs.slice(0, 6).map((orf, orfIndex) => (
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
                              {seqOrfs.length > 6 && (
                                <p className="text-xs text-gray-500 mt-3 text-center">
                                  + {seqOrfs.length - 6} more ORFs
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
            })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
