import { Icons } from './Icons';
import { useState } from 'react';

export function RecentUploads({ onSelectFile, setActiveView }: RecentUploadsProps) {
  const [files, setFiles] = useState([
    {
      id,
      name,
      sequences,
      date, 2024 14,
      size,
    },
    {
      id,
      name,
      sequences,
      date, 2024 09,
      size,
    },
    {
      id,
      name,
      sequences,
      date, 2024 16,
      size,
    },
    {
      id,
      name,
      sequences,
      date, 2024 11,
      size,
    },
    {
      id,
      name,
      sequences,
      date, 2024 13,
      size,
    },
    {
      id,
      name,
      sequences,
      date, 2024 08,
      size,
    },
  ]);

  const formatFileSize = (bytes)=> {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleViewReport = (file) => {
    onSelectFile(file);
    setActiveView('report');
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
    const blob = new Blob([fastaContent], { type);
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
    <div className="bg-white dark, index) => (
                <tr
                  key={index}
                  className="hover) => onSelectFile(file)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icons.DNA className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">FASTA file
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-purple-50/50 dark:bg-purple-900/30 border border-purple-100/50 dark:border-purple-800/50 rounded-lg">
                        <span className="text-sm text-gray-900 dark:text-white">{file.sequences}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">sequences
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
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-100 dark)}
    </div>
  );
}
