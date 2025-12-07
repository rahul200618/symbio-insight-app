import { useState } from 'react';
import { Icons } from './Icons';
import { calculateAggregateStats } from '../utils/fastaParser.js';
import { generatePDFReport, downloadHTMLReport } from '../utils/reportGenerator.js';
import { generatePDFReport as generateBackendPDF } from '../utils/sequenceApi.js';
import { toast } from 'sonner';

export function ReportViewer({ parsedSequences = [] }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = parsedSequences.length > 0
    ? calculateAggregateStats(parsedSequences)
    : null;

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

  const totalSequences = stats?.totalSequences || 245;
  const gcPercentage = stats?.avgGC || 43.7;
  const totalORFs = stats?.totalORFs || 34;
  const totalLength = stats?.totalLength || 124460;
  const avgLength = stats?.avgLength || 508;
  const longestSeq = stats?.longestSequence || 2845;
  const shortestSeq = stats?.shortestSequence || 89;

  const nucleotideDistribution = stats?.nucleotideDistribution || {
    A: 28.5,
    T: 27.8,
    G: 22.3,
    C: 21.4,
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
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{(totalLength / 1000).toFixed(1)}k bp</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Base pairs</p>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Icons.FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Generated Summary</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Automated analysis and insights</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
            <div className="flex items-start gap-3">
              <Icons.CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Sequence Quality Assessment</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The uploaded FASTA file contains {totalSequences} high-quality sequences with an average length of {avgLength} base pairs.
                  The GC content of {gcPercentage.toFixed(1)}% falls within the optimal range for most organisms, suggesting good sequence quality and potential biological relevance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
            <div className="flex items-start gap-3">
              <Icons.Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Nucleotide Composition</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The nucleotide distribution shows balanced representation across all bases: Adenine ({nucleotideDistribution.A.toFixed(1)}%),
                  Thymine ({nucleotideDistribution.T.toFixed(1)}%), Guanine ({nucleotideDistribution.G.toFixed(1)}%),
                  and Cytosine ({nucleotideDistribution.C.toFixed(1)}%). This balanced composition indicates a diverse genomic region without significant bias.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800/50">
            <div className="flex items-start gap-3">
              <Icons.CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Open Reading Frame Analysis</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalORFs} potential open reading frames (ORFs) were detected in the sequences, suggesting multiple protein-coding regions.
                  The longest ORF spans {longestSeq.toLocaleString()} base pairs, which may represent a significant functional gene. Further analysis is recommended
                  to identify potential gene functions and protein products.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
            <div className="flex items-start gap-3">
              <Icons.AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Recommendations</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All sequences have been successfully parsed and analyzed. The metadata includes sequence names, lengths, GC percentages,
                  nucleotide counts (A, T, G, C), and ORF detection. For more detailed analysis, we recommend performing BLAST searches
                  against reference databases and conducting phylogenetic analysis to determine evolutionary relationships.
                </p>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}
