import { Icons } from './Icons';
import { useState } from 'react';

const XIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function RightPanel({ selectedFile, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('recent');

  const recentFiles = [
    { name: 'genome_seq_01.fasta', sequences: 245, time: '2 hours ago' },
    { name: 'protein_analysis.fa', sequences: 189, time: '5 hours ago' },
    { name: 'mitochondrial_dna.fasta', sequences: 156, time: '1 day ago' },
    { name: 'viral_genome.fa', sequences: 312, time: '2 days ago' },
  ];

  const activities = [
    { action: 'Report generated', file: 'genome_seq_01.fasta', time: '1 hour ago' },
    { action: 'File uploaded', file: 'protein_analysis.fa', time: '5 hours ago' },
    { action: 'Metadata updated', file: 'mitochondrial_dna.fasta', time: '1 day ago' },
  ];

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
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
          <div>
            <h3 className="text-gray-900 dark:text-white">File Information</h3>
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
              className={`flex-1 py-3 text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-400 dark:border-purple-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {activeTab === 'recent' && (
            <>
              {recentFiles.map((file, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{file.sequences} sequences</p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{file.time}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'activity' && (
            <>
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.file}</p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {selectedFile ? (
                <>
                  <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">File Details</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name: {selectedFile.name || 'N/A'}</p>
                    {selectedFile.size && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Size: {selectedFile.size}</p>
                    )}
                    {selectedFile.sequences && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sequences: {selectedFile.sequences}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <Icons.FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No file selected</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
