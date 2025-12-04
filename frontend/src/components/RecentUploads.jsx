import { Icons } from './Icons';
import { useState, useEffect } from 'react';

export function RecentUploads({ onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSequences = async () => {
      try {
        const { getAllSequences } = await import('../utils/api.js');
        const response = await getAllSequences(10, 0);
        // Transform backend data to match component state structure
        const mappedFiles = response.data.map(seq => ({
          id: seq.id,
          name: seq.filename || seq.name,
          sequences: 1, // Backend returns individual sequences, grouping logic might be needed if we want 'files'
          date: new Date(seq.createdAt).toLocaleString(),
          size: seq.length + ' bp', // Using length as proxy for size
          data: [seq] // Store full sequence data for download/view
        }));
        setFiles(mappedFiles);
      } catch (err) {
        console.error('Failed to fetch sequences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSequences();
  }, []);

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

  const handleDelete = async (file, e) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      const { deleteSequence } = await import('../utils/api.js');
      await deleteSequence(file.id);

      // Remove from local state
      setFiles(files.filter(f => f.id !== file.id));
    } catch (err) {
      console.error('Failed to delete sequence:', err);
      alert('Failed to delete sequence. Please try again.');
    }
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
      {/* Main Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Recent Uploads</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your uploaded sequences</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Files</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{files.length} total uploads</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:opacity-90 transition-all">
            Export All
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin">
              <Icons.Loader className="w-full h-full" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Loading recent uploads...</p>
          </div>
        ) : files.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sequences</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {files.map((file, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleViewReport(file)}
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
        {!isLoading && files.length === 0 && (
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
