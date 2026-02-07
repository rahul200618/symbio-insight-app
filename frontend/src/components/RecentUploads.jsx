import { Icons } from './Icons';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getSequences, deleteSequence, generatePDFReport } from '../utils/sequenceApi.js';
import { useNotifications } from '../context/NotificationContext';

export function RecentUploads({ onFileSelect, refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Notifications
  const { notifyReportGenerated } = useNotifications();

  // Memoize loadSequences to prevent unnecessary recreations
  const loadSequences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSequences({ page: 1, limit: 50, sort: '-createdAt' });

      // Transform backend data to match component format
      const transformedFiles = response.data.map(seq => ({
        id: seq.id.toString(),
        name: seq.filename,
        sequences: seq.sequenceCount || seq.sequences?.length || 1,
        date: new Date(seq.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        size: `${seq.length} bp`,
        backendData: seq,
      }));

      setFiles(transformedFiles);
    } catch (error) {
      console.error('Failed to load sequences:', error);
      setError(error.message);
      toast.error('Failed to load sequences: ' + error.message);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch sequences from backend on mount and when refreshTrigger changes
  useEffect(() => {
    loadSequences();
  }, [loadSequences, refreshTrigger]);

  // Also refresh when window regains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      loadSequences();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadSequences]);

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
    
    // Use browser's native confirm dialog
    if (!window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteSequence(file.id);
      toast.success('File deleted successfully');

      // Remove from local state
      setFiles(files.filter(f => f.id !== file.id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file: ' + error.message);
    }
  };

  const handleDownload = (file, e) => {
    e.stopPropagation();

    // Generate FASTA content from backend data
    let fastaContent = '';

    if (file.backendData) {
      fastaContent = `>${file.backendData.header || file.backendData.name}\n`;
      fastaContent += `${file.backendData.sequence}\n`;
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

    toast.success('File downloaded');
  };

  const handleExportAll = async () => {
    try {
      if (files.length === 0) {
        toast.error('No sequences to export', { id: 'pdf-export' });
        return;
      }

      toast.loading('Generating PDF...', { id: 'pdf-export' });

      // Extract sequence IDs from files
      const sequenceIds = files.map(file => file.id).filter(Boolean);

      if (sequenceIds.length === 0) {
        toast.error('No sequences available for export', { id: 'pdf-export' });
        return;
      }

      // Use the API service to generate PDF
      await generatePDFReport(
        sequenceIds,
        `Symbio-NLM Recent Uploads Report - ${new Date().toLocaleDateString()}`
      );

      toast.success('PDF exported successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF', { id: 'pdf-export' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Files</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isLoading ? 'Loading...' : `${files.length} total uploads`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadSequences}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              <Icons.RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            {files.length > 0 && (
              <button onClick={handleExportAll} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                <Icons.Download className="w-4 h-4" />
                Export All to PDF
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Icons.AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400 mb-2 font-medium">Failed to load sequences</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadSequences}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading sequences...</p>
          </div>
        ) : files.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sequences</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Length</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GC %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ORFs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {files.map((file) => (
                  <tr
                    key={file.id}
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
                      <div className="px-3 py-1 bg-indigo-50/50 dark:bg-indigo-900/30 border border-indigo-100/50 dark:border-indigo-800/50 rounded-lg inline-flex items-center gap-1">
                        <Icons.BarChart className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{file.sequences}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 dark:text-white">{typeof file.backendData?.length === 'number' ? file.backendData.length.toLocaleString() : 'N/A'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">bp</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{typeof (file.backendData?.gcPercent ?? file.backendData?.gcContent) === 'number' ? (file.backendData?.gcPercent ?? file.backendData?.gcContent).toFixed(1) : 'N/A'}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="px-3 py-1 bg-purple-50/50 dark:bg-purple-900/30 border border-purple-100/50 dark:border-purple-800/50 rounded-lg inline-block">
                        <span className="text-sm text-gray-900 dark:text-white">{file.backendData?.orfCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{file.date}</p>
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
                          View
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
        ) : (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Icons.File className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No files uploaded yet</p>
            <p className="text-sm text-gray-400">Upload a FASTA file to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

