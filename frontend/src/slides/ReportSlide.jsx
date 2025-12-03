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
                <h1 className="text-gray-900 mb-2">Sequence Analysis Report
                <p className="text-gray-600">genome_sequence_01.fasta
                <p className="text-sm text-gray-500 mt-1">Generated on Nov 27, 2024 at 14, suggesting good sequence quality and potential biological relevance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-100/50">
                  <div className="flex items-start gap-3">
                    <Icons.Activity className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Nucleotide Composition
                      <p className="text-sm text-gray-600">
                        The nucleotide distribution shows balanced representation across all bases), Thymine (27.8%), 
                        Guanine (22.3%), and Cytosine (21.4%). This balanced composition indicates a diverse genomic region without significant bias.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-50/50 border border-green-100/50">
                  <div className="flex items-start gap-3">
                    <Icons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Open Reading Frame Analysis
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
                      <p className="text-sm text-gray-900 mb-1">Recommendations
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
                  <h3 className="text-gray-900">Detailed Metrics
                  <p className="text-sm text-gray-500">Complete statistical breakdown
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm text-gray-700 mb-4">Sequence Statistics
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
                  <h4 className="text-sm text-gray-700 mb-4">Composition Analysis
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
