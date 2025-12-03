import { Icons } from '../components/Icons';
import { BarChart, PieChart } from '../components/Charts';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { RightPanel } from '../components/RightPanel';

export function MetadataSlide() {
  const nucleotideData = [
    { name: 'A', value: 28.5, color: '#38bdf8' },
    { name: 'T', value: 27.8, color: '#22d3ee' },
    { name: 'G', value: 22.3, color: '#06b6d4' },
    { name: 'C', value: 21.4, color: '#0ea5e9' },
  ];

  const gcData = [
    { name: 'GC', value: 43.7, color: '#22d3ee' },
    { name: 'AT', value: 56.3, color: '#38bdf8' },
  ];

  return (
    <div className="flex h-full bg-gray-50">
      <Sidebar activeView="metadata" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-gray-900 mb-2">Metadata Dashboard</h1>
              <p className="text-gray-600">Detailed biological analysis of your sequences</p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-sm">
                    <Icons.Activity className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-sky-50 text-sky-600 text-xs rounded-lg">Active</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Sequence Length</p>
                <p className="text-2xl text-gray-900">12,458 bp</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-400 flex items-center justify-center shadow-sm">
                    <Icons.PieChart className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-cyan-50 text-cyan-600 text-xs rounded-lg">Optimal</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">GC Content</p>
                <p className="text-2xl text-gray-900">43.7%</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-sm">
                    <Icons.BarChart className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-sky-50 text-sky-600 text-xs rounded-lg">245</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Sequences</p>
                <p className="text-2xl text-gray-900">245</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-sm">
                    <Icons.CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-lg">Detected</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">ORF Detection</p>
                <p className="text-2xl text-gray-900">34 ORFs</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Nucleotide Distribution */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-gray-900 mb-1">Nucleotide Distribution</h3>
                    <p className="text-sm text-gray-500">Base pair composition analysis</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-sm">
                    <Icons.BarChart className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="w-full h-48 mb-4">
                  <BarChart data={nucleotideData} />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {nucleotideData.map((item) => (
                    <div key={item.name} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <p className="text-lg text-gray-900">{item.value}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* GC Content Analysis */}
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-gray-900 mb-1">GC Content Analysis</h3>
                    <p className="text-sm text-gray-500">Guanine-Cytosine ratio</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-400 flex items-center justify-center shadow-sm">
                    <Icons.PieChart className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="h-48 w-48 flex-shrink-0">
                    <PieChart data={gcData} />
                  </div>

                  <div className="flex-1 space-y-4">
                    {gcData.map((item) => (
                      <div key={item.name} className="p-4 rounded-lg bg-sky-50/50 border border-sky-100/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-700">{item.name} Content</span>
                          </div>
                          <span className="text-lg text-gray-900">{item.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.value}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-sm">
                  <Icons.Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900">Detailed Sequence Statistics</h3>
                  <p className="text-sm text-gray-500">Comprehensive analysis results</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100/50">
                  <p className="text-xs text-gray-600 mb-1">Average Sequence Length</p>
                  <p className="text-xl text-gray-900">508 bp</p>
                </div>
                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-100/50">
                  <p className="text-xs text-gray-600 mb-1">Longest Sequence</p>
                  <p className="text-xl text-gray-900">2,845 bp</p>
                </div>
                <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100/50">
                  <p className="text-xs text-gray-600 mb-1">Shortest Sequence</p>
                  <p className="text-xl text-gray-900">89 bp</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50/50 border border-green-100/50">
                  <p className="text-xs text-gray-600 mb-1">ORFs Detected</p>
                  <div className="flex items-center gap-2">
                    <Icons.CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-xl text-gray-900">34</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100/50">
                  <p className="text-xs text-gray-600 mb-1">Ambiguous Bases</p>
                  <div className="flex items-center gap-2">
                    <Icons.AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-xl text-gray-900">12</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-cyan-50/50 border border-cyan-100/50">
                  <p className="text-xs text-gray-600 mb-1">Total Base Pairs</p>
                  <p className="text-xl text-gray-900">124,460 bp</p>
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
