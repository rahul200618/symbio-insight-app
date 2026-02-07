import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { RightPanel } from './components/RightPanel';
import { ChatbotAssistant } from './components/ChatbotAssistant';
import { ScrollProgressBar } from './components/AnimatedPage';
import { SkipLink } from './components/SkipLink';
import { initAnimeJS } from './utils/animations.js';
import { useScrollProgress } from './hooks/useScrollAnimation.js';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy-loaded page imports for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const RecentPage = lazy(() => import('./pages/RecentPage').then(m => ({ default: m.RecentPage })));
const MetadataPage = lazy(() => import('./pages/MetadataPage').then(m => ({ default: m.MetadataPage })));
const ReportPage = lazy(() => import('./pages/ReportPage').then(m => ({ default: m.ReportPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const SharedSequencePage = lazy(() => import('./pages/SharedSequencePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

// Loading spinner for lazy-loaded components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SkipLink targetId="main-content" />
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <ScrollProgressBar progress={scrollProgress} />
        <main id="main-content" className="flex-1 p-6 md:p-10" tabIndex="-1" role="main" aria-label="Main content">
          <Outlet />
        </main>
        {showRightPanel && <RightPanel onClose={() => setShowRightPanel(false)} />}
        <ChatbotAssistant />
      </div>
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
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/shared/:token" element={<SharedSequencePage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
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
            <Route path="dashboard" element={<DashboardPage onUploadComplete={(seq) => setParsedSequences(seq)} />} />
            <Route path="recent" element={<RecentPage onFileSelect={handleFileSelect} parsedSequences={parsedSequences} />} />
            <Route path="metadata" element={<MetadataPage parsedSequences={parsedSequences} selectedFile={selectedFile} onFileSelect={handleFileSelect} />} />
            <Route path="report" element={<ReportPage parsedSequences={parsedSequences} />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
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
