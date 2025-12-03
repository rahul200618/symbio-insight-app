import { Icons } from '../components/Icons';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { RightPanel } from '../components/RightPanel';

export function RecentUploadsSlide() {
  const files = [
    { name: 'genome_sequence_01.fasta', sequences, date: 'Nov 27, 2024 14:32', size: '2.4 MB' },
    { name: 'protein_coding_regions.fa', sequences, date: 'Nov 27, 2024 09:15', size: '1.8 MB' },
    { name: 'mitochondrial_dna_analysis.fasta', sequences, date: 'Nov 26, 2024 16:45', size: '956 KB' },
    { name: 'viral_genome_complete.fa', sequences, date: 'Nov 26, 2024 11:20', size: '3.7 MB' },
    { name: 'bacterial_plasmid_seq.fasta', sequences, date: 'Nov 25, 2024 13:08', size: '1.5 MB' },
    { name: 'chromosomal_region_22.fa', sequences, date: 'Nov 25, 2024 08:55', size: '5.2 MB' },
  ];

  return (
    <div className="flex h-full bg-gray-50">
      <Sidebar activeView="recent" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-gray-900 mb-2">Recent Uploads
              <p className="text-gray-600">View and manage your uploaded sequences
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900">Your Files
                  <p className="text-sm text-gray-500 mt-1">{files.length} total uploads
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-sky-400 to-cyan-400 text-white text-sm rounded-lg hover, index) => (
                      <tr key={index} className="hover))}
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
