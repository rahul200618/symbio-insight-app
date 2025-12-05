import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { RightPanel } from './components/RightPanel';
import { UploadSection } from './components/UploadSection';
import { RecentUploads } from './components/RecentUploads';
import { MetadataCards } from './components/MetadataCards';
import { ReportViewer } from './components/ReportViewer';
import { QuickAccess } from './components/QuickAccess';
import { ChatbotAssistant } from './components/ChatbotAssistant';
import { SequenceComparison } from './components/SequenceComparison';
import { AnimatedPage, ScrollProgressBar } from './components/AnimatedPage';
import { Icons } from './components/Icons';
import { initAnimeJS } from './utils/animations.js';
import { useScrollProgress } from './hooks/useScrollAnimation.js';

export default function App() {
  const [activeView, setActiveView] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [parsedSequences, setParsedSequences] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    initAnimeJS();
  }, []);

  // Log when parsedSequences changes
  useEffect(() => {
    console.log('App - parsedSequences updated:', parsedSequences.length, parsedSequences);
  }, [parsedSequences]);

  const handleUploadComplete = (sequences) => {
    console.log('App - handleUploadComplete called with:', sequences.length, 'sequences');

    // Directly set new sequences
    setParsedSequences(sequences);

    // Auto-navigate to metadata view after successful parse
    setTimeout(() => {
      setActiveView('metadata');
    }, 800);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ScrollProgressBar progress={scrollProgress} />

      {/* Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Top Bar */}
      <div className="flex-1 flex flex-col">
        <TopBar
          selectedFile={selectedFile}
          onInfoClick={() => setShowRightPanel(!showRightPanel)}
        />

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              {activeView === 'upload' && (
                <AnimatedPage key="upload" animation="slide-up">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <UploadSection onUploadComplete={handleUploadComplete} />
                  </motion.div>
                </AnimatedPage>
              )}

              {activeView === 'recent' && (
                <AnimatedPage key="recent" animation="slide-up">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <RecentUploads onFileSelect={(file) => {
                      setSelectedFile(file);
                      if (file.data) {
                        setParsedSequences(file.data);
                      }
                      setActiveView('report');
                    }} />
                  </motion.div>
                </AnimatedPage>
              )}

              {activeView === 'metadata' && (
                <AnimatedPage key="metadata" animation="slide-up">
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Sequence Metadata
                    </h2>
                    {parsedSequences.length >= 2 && (
                      <motion.button
                        onClick={() => setShowComparison(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icons.Activity className="w-4 h-4" />
                        Compare Sequences
                      </motion.button>
                    )}
                  </motion.div>
                  <MetadataCards parsedSequences={parsedSequences} />
                </AnimatedPage>
              )}

              {activeView === 'report' && (
                <AnimatedPage key="report" animation="slide-up">
                  <ReportViewer parsedSequences={parsedSequences} />
                </AnimatedPage>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Panel - Slideable Sidebar */}
      <RightPanel
        selectedFile={selectedFile}
        isOpen={showRightPanel}
        onClose={() => setShowRightPanel(false)}
      />

      {/* AI Chatbot Assistant */}
      <ChatbotAssistant sequences={parsedSequences} currentView={activeView} />

      {/* Sequence Comparison Modal */}
      {showComparison && parsedSequences.length >= 2 && (
        <SequenceComparison
          sequences={parsedSequences}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
