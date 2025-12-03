import { Icons } from '../components/Icons';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { RightPanel } from '../components/RightPanel';

export function RecentUploadsSlide() {
  const files = [
    { name: 'genome_sequence_01.fasta', sequences: 245, date: 'Nov 27, 2024 14:32', size: '2.4 MB' },
    { name: 'protein_coding_regions.fa', sequences: 128, date: 'Nov 27, 2024 09:15', size: '1.8 MB' },
    { name: 'mitochondrial_dna_analysis.fasta', sequences: 89, date: 'Nov 26, 2024 16:45', size: '956 KB' },
    { name: 'viral_genome_complete.fa', sequences: 412, date: 'Nov 26, 2024 11:20', size: '3.7 MB' },
    { name: 'bacterial_plasmid_seq.fasta', sequences: 167, date: 'Nov 25, 2024 13:08', size: '1.5 MB' },
    { name: 'chromosomal_region_22.fa', sequences: 534, date: 'Nov 25, 2024 08:55', size: '5.2 MB' },
  ];

  return (
    <div className="flex h-full bg-gray-50">
      <Sidebar activeView="recent" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-gray-900 mb-2">Recent Uploads</h1>
              <p className="text-gray-600">View and manage your uploaded sequences</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900">Your Files</h3>
                  <p className="text-sm text-gray-500 mt-1">{files.length} total uploads</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-sky-400 to-cyan-400 text-white text-sm rounded-lg hover:shadow-md transition-all">
                  Export All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider">File Name</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider">Items / Sequences</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider">Upload Date</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider">File Size</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map((file, index) => (
                      <tr key={index} className="hover:bg-sky-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Icons.DNA className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">FASTA file</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-sky-50/50 border border-sky-100/50 rounded-lg">
                              <span className="text-sm text-gray-900">{file.sequences}</span>
                            </div>
                            <span className="text-xs text-gray-500">sequences</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{file.date}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{file.size}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-gradient-to-r from-sky-400 to-cyan-400 text-white text-xs rounded-lg hover:shadow-md transition-all flex items-center gap-2">
                              <Icons.Eye className="w-3 h-3 text-white" />
                              View Report
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all">
                              <Icons.Download className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all">
                              <Icons.Trash className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RightPanel selectedFile={files[0]} />
    </div>
  );
}
