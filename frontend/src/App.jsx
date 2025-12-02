import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { RightPanel } from "./components/RightPanel";
import { UploadSection } from "./components/UploadSection";
import { RecentUploads } from "./components/RecentUploads";
import { MetadataCards } from "./components/MetadataCards";
import { ReportViewer } from "./components/ReportViewer";
import { QuickAccess } from "./components/QuickAccess";
import { ChatbotAssistant } from "./components/ChatbotAssistant";
import { SequenceComparison } from "./components/SequenceComparison";
import { AnimatedPage } from "./components/AnimatedPage";
import { Icons } from "./components/Icons";
import { initAnimeJS } from "./utils/animations";
import { useScrollProgress } from "./hooks/useScrollAnimation";

export default function App() {
  const [activeView, setActiveView] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [parsedSequences, setParsedSequences] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    initAnimeJS();
  }, []);

  const handleUploadComplete = (sequences) => {
    setParsedSequences(sequences);
    // Auto-navigate to metadata view after successful parse
    setTimeout(() => {
      setActiveView("metadata");
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 origin-left z-50"
        style={{
          scaleX: scrollProgress / 100,
          transformOrigin: "0%",
        }}
      />

      {/* Left Sidebar with animation */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          onTogglePanel={() =>
            setShowRightPanel(!showRightPanel)
          }
        />

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              {activeView === "upload" && (
                <AnimatedPage animation="slide-up">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h1 className="text-gray-900 dark:text-white mb-2">
                      Upload FASTA Files
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyze DNA sequences and generate
                      insights
                    </p>
                  </motion.div>
                  <UploadSection
                    onUploadComplete={handleUploadComplete}
                  />
                  <QuickAccess setActiveView={setActiveView} />
                </AnimatedPage>
              )}

              {activeView === "recent" && (
                <AnimatedPage animation="slide-up">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h1 className="text-gray-900 dark:text-white mb-2">
                      Recent Uploads
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      View and manage your uploaded sequences
                    </p>
                  </motion.div>
                  <RecentUploads
                    onSelectFile={setSelectedFile}
                    setActiveView={setActiveView}
                  />
                </AnimatedPage>
              )}

              {activeView === "metadata" && (
                <AnimatedPage
                  animation="slide-up"
                >
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div>
                      <h1 className="text-gray-900 dark:text-white mb-2">
                        Metadata Dashboard
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        Detailed biological analysis of your
                        sequences
                      </p>
                    </div>
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
                  <MetadataCards
                    parsedSequences={parsedSequences}
                  />
                </AnimatedPage>
              )}

              {activeView === "report" && (
                <AnimatedPage animation="slide-up">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h1 className="text-gray-900 dark:text-white mb-2">
                      Analysis Report
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Comprehensive report of your sequence analysis
                    </p>
                  </motion.div>
                  <ReportViewer
                    parsedSequences={parsedSequences}
                  />
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
      <ChatbotAssistant
        sequences={parsedSequences}
        currentView={activeView}
      />

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
