import { Icons } from './Icons';
import { useState } from 'react';
import type { ViewType } from '../types';

interface RecentUploadsProps {
  onSelectFile: (file: any) => void;
  setActiveView: (view: ViewType) => void;
}

export function RecentUploads({ onSelectFile, setActiveView }: RecentUploadsProps) {
  const [files, setFiles] = useState<any[]>([
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
      sequences: 128,
      date: 'Nov 27, 2024 09:15',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'mitochondrial_dna_analysis.fasta',
      sequences: 89,
      date: 'Nov 26, 2024 16:45',
      size: '956 KB',
    },
    {
      id: '4',
      name: 'viral_genome_complete.fa',
      sequences: 412,
      date: 'Nov 26, 2024 11:20',
      size: '3.7 MB',
    },
    {
      id: '5',
      name: 'bacterial_plasmid_seq.fasta',
      sequences: 167,
      date: 'Nov 25, 2024 13:08',
      size: '1.5 MB',
    },
    {
      id: '6',
      name: 'chromosomal_region_22.fa',
      sequences: 534,
      date: 'Nov 25, 2024 08:55',
      size: '5.2 MB',
    },
  ]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleViewReport = (file: any) => {
    onSelectFile(file);
    setActiveView('report');
  };

  const handleDelete = (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }
    
    // Remove from local state
    setFiles(files.filter(f => f.id !== file.id));
  };

  const handleDownload = (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Generate FASTA content
    let fastaContent = '';
    
    if (file.data && file.data.length > 0) {
      file.data.forEach((seq: any) => {
        fastaContent += `>${seq.name}\n`;
        fastaContent += `${seq.sequence}\n\n`;
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
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 dark:text-white">Your Files</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {files.length} total uploads
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm rounded-lg hover:shadow-md transition-all">
            Export All
          </button>
        </div>
      </div>



      {/* Table */}
      {files.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items / Sequences
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  File Size
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {files.map((file, index) => (
                <tr
                  key={index}
                  className="hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                  onClick={() => onSelectFile(file)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icons.DNA className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">FASTA file</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-purple-50/50 dark:bg-purple-900/30 border border-purple-100/50 dark:border-purple-800/50 rounded-lg">
                        <span className="text-sm text-gray-900 dark:text-white">{file.sequences}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">sequences</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{file.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{file.size}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReport(file);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs rounded-lg hover:shadow-md transition-all flex items-center gap-2"
                      >
                        <Icons.Eye className="w-3 h-3 text-white" />
                        View Report
                      </button>
                      <button
                        onClick={(e) => handleDownload(file, e)}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                      >
                        <Icons.Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(file, e)}
                        className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-all"
                      >
                        <Icons.Trash className="w-4 h-4 text-red-600 dark:text-red-400" />
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
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-100 dark:from-gray-800 to-gray-200 dark:to-gray-700 flex items-center justify-center">
            <Icons.FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-gray-900 dark:text-white mb-2">No files uploaded yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload a FASTA file to get started</p>
        </div>
      )}
    </div>
  );
}
