import { Icons } from './Icons';
import { useState, useEffect, useCallback } from 'react';
import { getSequences } from '../utils/sequenceApi.js';

const XIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function RightPanel({ selectedFile, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('recent');
  const [recentFiles, setRecentFiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Load data from backend
  const loadData = useCallback(async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      const response = await getSequences({ page: 1, limit: 10, sort: '-createdAt' });
      
      // Transform to recent files format
      const files = response.data.map(seq => ({
        id: seq.id,
        name: seq.filename,
        sequences: seq.sequenceCount || 1,
        time: formatRelativeTime(seq.createdAt),
        gcContent: seq.gcContent ?? seq.gcPercent ?? seq.gcPercentage ?? 0,
        length: seq.length
      }));
      
      setRecentFiles(files);

      // Generate activities from recent files
      const acts = response.data.slice(0, 5).map(seq => {
        const actions = ['File uploaded', 'Metadata analyzed', 'Sequence parsed'];
        return {
          action: actions[Math.floor(Math.random() * actions.length)],
          file: seq.filename,
          time: formatRelativeTime(seq.createdAt)
        };
      });
      
      setActivities(acts);
    } catch (error) {
      console.error('Failed to load recent files:', error);
      setRecentFiles([]);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen]);

  // Load data when panel opens
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold">File Information</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recent activity and details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all"
          >
            <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          {(['recent', 'activity', 'details']).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm capitalize transition-all ${activeTab === tab
                  ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-400 dark:border-purple-500 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {activeTab === 'recent' && (
                <>
                  {recentFiles.length > 0 ? (
                    recentFiles.map((file, index) => (
                      <div
                        key={file.id || index}
                        className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-purple-600 dark:text-purple-400">{file.sequences} sequences</span>
                              {typeof file.gcContent === 'number' && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">• {file.gcContent.toFixed(1)}% GC</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 ml-2 whitespace-nowrap">{file.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Icons.File className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No recent files</p>
                      <p className="text-xs text-gray-400 mt-1">Upload a FASTA file to get started</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'activity' && (
                <>
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <Icons.Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.file}</p>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Icons.Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  {selectedFile ? (
                    <>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <Icons.DNA className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">File Details</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Selected file information</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate ml-2 max-w-[150px]">{selectedFile.name || selectedFile.filename || 'N/A'}</span>
                          </div>
                          {(selectedFile.size || selectedFile.length) && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Length</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{typeof selectedFile.length === 'number' ? selectedFile.length.toLocaleString() : selectedFile.size || 'N/A'} bp</span>
                            </div>
                          )}
                          {(selectedFile.sequences || selectedFile.sequenceCount) && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Sequences</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.sequences || selectedFile.sequenceCount}</span>
                            </div>
                          )}
                          {(selectedFile.gcContent != null || selectedFile.gcPercentage != null || selectedFile.gcPercent != null) && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">GC Content</span>
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {typeof (selectedFile.gcContent ?? selectedFile.gcPercentage ?? selectedFile.gcPercent) === 'number' 
                                  ? (selectedFile.gcContent ?? selectedFile.gcPercentage ?? selectedFile.gcPercent).toFixed(1) 
                                  : selectedFile.gcContent ?? selectedFile.gcPercentage ?? selectedFile.gcPercent}%
                              </span>
                            </div>
                          )}
                          {selectedFile.orfCount !== undefined && selectedFile.orfCount !== null && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">ORFs Found</span>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{selectedFile.orfCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <Icons.FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No file selected</p>
                      <p className="text-xs text-gray-400 mt-1">Select a file to view details</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Refresh Button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={loadData}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Icons.RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </>
  );
}
