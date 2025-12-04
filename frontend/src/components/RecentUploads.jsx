import { Icons } from './Icons';
import { useState } from 'react';

export function RecentUploads({ onFileSelect }) {
  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'genome_sequence_01.fasta',
      sequences: 245,
      date: 'Nov 27, 2024 14:32',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'protein_coding_regions.fa',
      sequences: 189,
      date: 'Nov 27, 2024 09:15',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'mitochondrial_dna_analysis.fasta',
      sequences: 156,
      date: 'Nov 26, 2024 16:45',
      size: '956 KB',
    },
    {
      id: '4',
      name: 'viral_genome_complete.fa',
      sequences: 312,
      date: 'Nov 26, 2024 11:20',
      size: '3.7 MB',
    },
    {
      id: '5',
      name: 'bacterial_plasmid_seq.fasta',
      sequences: 98,
      date: 'Nov 25, 2024 13:08',
      size: '1.5 MB',
    },
    {
      id: '6',
      name: 'chromosomal_region_22.fa',
      sequences: 421,
      date: 'Nov 25, 2024 08:55',
      size: '5.2 MB',
    },
  ]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleViewReport = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDelete = (file, e) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    // Remove from local state
    setFiles(files.filter(f => f.id !== file.id));
  };

  const handleDownload = (file, e) => {
    e.stopPropagation();

    // Generate FASTA content
    let fastaContent = '';

    if (file.data && file.data.length > 0) {
      file.data.forEach((seq) => {
        fastaContent += `>${seq.sequenceName}\n`;
        fastaContent += `${seq.rawSequence}\n\n`;
      });
    } else {
      fastaContent = `>Sample sequence\nATGCGATCGATCGATCG\n`;
    }

    // Create download
    const blob = new Blob([fastaContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Outer Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Recent Uploads</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your uploaded sequences</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Files</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{files.length} total uploads</p>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
              Export All
            </button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">FILE NAME</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ITEMS / SEQUENCES</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">UPLOAD DATE</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">FILE SIZE</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {files.map((file, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Icons.Hash className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">FASTA file</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{file.sequences}</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">sequences</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{file.date.split(' ')[0]} {file.date.split(' ')[1]} {file.date.split(' ')[2]}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{file.date.split(' ')[3]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{file.size}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReport(file);
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-purple-200 dark:shadow-none"
                        >
                          <Icons.Eye className="w-4 h-4" />
                          View Report
                        </button>
                        <button
                          onClick={(e) => handleDownload(file, e)}
                          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-500 dark:text-gray-400"
                        >
                          <Icons.Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Icons.File className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
