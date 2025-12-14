import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { RightPanel } from './components/RightPanel';
import { ChatbotAssistant } from './components/ChatbotAssistant';
import { ScrollProgressBar } from './components/AnimatedPage';
import { initAnimeJS } from './utils/animations.js';
import { useScrollProgress } from './hooks/useScrollAnimation.js';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Page imports
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecentPage } from './pages/RecentPage';
import { MetadataPage } from './pages/MetadataPage';
import { ReportPage } from './pages/ReportPage';
import { ProfilePage } from './pages/ProfilePage';

// Main Layout Component (for authenticated pages)
function MainLayout({ parsedSequences, setParsedSequences, selectedFile, setSelectedFile }) {
  const [showRightPanel, setShowRightPanel] = useState(false);
  const scrollProgress = useScrollProgress();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    initAnimeJS();
  }, []);

  const handleUploadComplete = (sequences) => {
    setParsedSequences(sequences);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file.data) {
      setParsedSequences(file.data);
    }
  };

  // Handler for generating report from chatbot
  const handleGenerateReport = useCallback(() => {
    navigate('/report');
    // Trigger report download after navigation
    setTimeout(() => {
      const downloadBtn = document.querySelector('[data-report-download]');
      if (downloadBtn) downloadBtn.click();
    }, 500);
  }, [navigate]);

  // Get current view from location pathname
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('/metadata')) return 'metadata';
    if (path.includes('/recent')) return 'recent';
    if (path.includes('/report')) return 'report';
    return 'dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ScrollProgressBar progress={scrollProgress} />

      {/* Left Sidebar */}
      <Sidebar activeView={getCurrentView()} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopBar
          selectedFile={selectedFile}
          onInfoClick={() => setShowRightPanel(!showRightPanel)}
        />

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              <Outlet context={{ parsedSequences, onUploadComplete: handleUploadComplete, onFileSelect: handleFileSelect }} />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel
        selectedFile={selectedFile}
        isOpen={showRightPanel}
        onClose={() => setShowRightPanel(false)}
      />

      {/* AI Chatbot with action handlers */}
      <ChatbotAssistant 
        sequences={parsedSequences} 
        currentView={getCurrentView()} 
        onGenerateReport={handleGenerateReport}
        onSequenceInput={(seqs) => setParsedSequences(seqs)}
      />
    </div>
  );
}

// Router Configuration
function AppRoutes() {
  const [parsedSequences, setParsedSequences] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const location = useLocation();

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file.data) {
      setParsedSequences(file.data);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout
                parsedSequences={parsedSequences}
                setParsedSequences={setParsedSequences}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage onUploadComplete={(seq) => setParsedSequences(seq)} />} />
          <Route path="/recent" element={<RecentPage onFileSelect={handleFileSelect} parsedSequences={parsedSequences} />} />
          <Route path="/metadata" element={<MetadataPage parsedSequences={parsedSequences} selectedFile={selectedFile} onFileSelect={handleFileSelect} />} />
          <Route path="/report" element={<ReportPage parsedSequences={parsedSequences} />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// Root Redirect Component
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
