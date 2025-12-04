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
import { LoginPage } from './components/LoginPage';
import { Icons } from './components/Icons';
import { initAnimeJS } from './utils/animations.js';
import { useScrollProgress } from './hooks/useScrollAnimation.js';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [parsedSequences, setParsedSequences] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const scrollProgress = useScrollProgress();

  // Handle file selection from RecentUploads
  const handleFileSelect = (file) => {
    console.log('App - Selected file:', file);
    setSelectedFile(file);

    // If the file object has data (sequences), update parsedSequences
    if (file.data && Array.isArray(file.data)) {
      // Ensure data structure matches what components expect
      const sequences = file.data.map(seq => ({
        ...seq,
        // Map backend fields to frontend expected fields if necessary
        sequenceName: seq.name || seq.sequenceName,
        sequenceLength: seq.length || seq.sequenceLength,
        gcPercentage: seq.gcContent || seq.gcPercentage,
        rawSequence: seq.sequence || seq.rawSequence,
        orfs: seq.orfs || []
      }));
      setParsedSequences(sequences);
      setActiveView('report'); // Or 'metadata'
    }
  };

  useEffect(() => {
    initAnimeJS();
  }, []);

  // Log when parsedSequences changes
  useEffect(() => {
    console.log('App - parsedSequences updated:', parsedSequences.length, parsedSequences);
  }, [parsedSequences]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveView('upload');
  };

  const handleUploadComplete = (sequences) => {
    console.log('App - handleUploadComplete called with:', sequences.length, 'sequences');

    // Directly set new sequences
    setParsedSequences(sequences);

    // Auto-navigate to metadata view after successful parse
    setTimeout(() => {
      setActiveView('metadata');
    }, 800);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ScrollProgressBar progress={scrollProgress} />

      {/* Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
      />

      {/* Top Bar */}
      <div className="flex-1 flex flex-col">
        <TopBar
          selectedFile={selectedFile}
          onInfoClick={() => setShowRightPanel(!showRightPanel)}
          user={user}
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
                    <RecentUploads onFileSelect={handleFileSelect} />
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
