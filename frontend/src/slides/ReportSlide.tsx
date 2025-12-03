import { Icons } from '../components/Icons';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { RightPanel } from '../components/RightPanel';

export function ReportSlide() {
  return (
    <div className="flex h-full bg-gray-50">
      <Sidebar activeView="report" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-gray-900 mb-2">Sequence Analysis Report</h1>
                <p className="text-gray-600">genome_sequence_01.fasta</p>
                <p className="text-sm text-gray-500 mt-1">Generated on Nov 27, 2024 at 14:35</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                  <Icons.Share className="w-4 h-4" />
                  Share
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-sky-400 to-cyan-400 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-2">
                  <Icons.Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-sm">
                    <Icons.Activity className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Sequences</p>
                </div>
                <p className="text-2xl text-gray-900">245</p>
                <p className="text-xs text-gray-500 mt-1">Total analyzed</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-400 flex items-center justify-center shadow-sm">
                    <Icons.PieChart className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">GC Content</p>
                </div>
                <p className="text-2xl text-gray-900">43.7%</p>
                <p className="text-xs text-green-600 mt-1">Optimal range</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-sm">
                    <Icons.CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">ORFs Found</p>
                </div>
                <p className="text-2xl text-gray-900">34</p>
                <p className="text-xs text-gray-500 mt-1">Open reading frames</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-sm">
                    <Icons.FileText className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Total Length</p>
                </div>
                <p className="text-2xl text-gray-900">124.5k bp</p>
                <p className="text-xs text-gray-500 mt-1">Base pairs</p>
              </div>
            </div>

            {/* AI Summary Section */}
            <div className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-sm">
                  <Icons.FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900">AI-Generated Summary</h3>
                  <p className="text-sm text-gray-500">Automated analysis and insights</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100/50">
                  <div className="flex items-start gap-3">
                    <Icons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Sequence Quality Assessment</p>
                      <p className="text-sm text-gray-600">
                        The uploaded FASTA file contains 245 high-quality sequences with an average length of 508 base pairs. 
                        The GC content of 43.7% falls within the optimal range for most organisms, suggesting good sequence quality and potential biological relevance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-100/50">
                  <div className="flex items-start gap-3">
                    <Icons.Activity className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Nucleotide Composition</p>
                      <p className="text-sm text-gray-600">
                        The nucleotide distribution shows balanced representation across all bases: Adenine (28.5%), Thymine (27.8%), 
                        Guanine (22.3%), and Cytosine (21.4%). This balanced composition indicates a diverse genomic region without significant bias.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-50/50 border border-green-100/50">
                  <div className="flex items-start gap-3">
                    <Icons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Open Reading Frame Analysis</p>
                      <p className="text-sm text-gray-600">
                        34 potential open reading frames (ORFs) were detected in the sequences, suggesting multiple protein-coding regions. 
                        The longest ORF spans 2,845 base pairs, which may represent a significant functional gene.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100/50">
                  <div className="flex items-start gap-3">
                    <Icons.AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Recommendations</p>
                      <p className="text-sm text-gray-600">
                        12 ambiguous bases (N) were detected in the sequences. Consider reviewing these regions for potential sequencing errors 
                        or gaps. For more detailed analysis, we recommend performing BLAST searches against reference databases.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-sm">
                  <Icons.BarChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900">Detailed Metrics</h3>
                  <p className="text-sm text-gray-500">Complete statistical breakdown</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm text-gray-700 mb-4">Sequence Statistics</h4>
                  {[
                    { label: 'Total Sequences', value: '245' },
                    { label: 'Average Length', value: '508 bp' },
                    { label: 'Longest Sequence', value: '2,845 bp' },
                    { label: 'Shortest Sequence', value: '89 bp' },
                    { label: 'Total Base Pairs', value: '124,460 bp' },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm text-gray-700 mb-4">Composition Analysis</h4>
                  {[
                    { label: 'GC Content', value: '43.7%' },
                    { label: 'AT Content', value: '56.3%' },
                    { label: 'Adenine (A)', value: '28.5%' },
                    { label: 'Thymine (T)', value: '27.8%' },
                    { label: 'Guanine (G)', value: '22.3%' },
                    { label: 'Cytosine (C)', value: '21.4%' },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RightPanel selectedFile={null} />
    </div>
  );
}
