import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

// Storage keys
const STORAGE_KEY = 'symbio_notifications';
const PREFS_KEY = 'symbio-preferences';

// Get user preferences from localStorage
const getPreferences = () => {
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  return { emailNotifications: false, autoSaveReports: true, advancedFeatures: true };
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushPermission, setPushPermission] = useState('default');
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);

  // Sync email notification preference from localStorage
  useEffect(() => {
    const syncPreferences = () => {
      const prefs = getPreferences();
      setEmailNotificationsEnabled(prefs.emailNotifications || false);
    };
    
    syncPreferences();
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', syncPreferences);
    
    // Poll for local changes
    const interval = setInterval(syncPreferences, 1000);
    
    return () => {
      window.removeEventListener('storage', syncPreferences);
      clearInterval(interval);
    };
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects for relative time
        const withDates = parsed.map(n => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
        setNotifications(withDates);
        setUnreadCount(withDates.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, [notifications]);

  // Check push notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Request push notification permission
  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Push notifications enabled!');
        return true;
      } else if (permission === 'denied') {
        toast.error('Push notifications blocked. Please enable them in browser settings.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  }, []);

  // Show a push notification
  const showPushNotification = useCallback((title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/dna-icon.png',
        badge: '/dna-icon.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Failed to show push notification:', error);
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback(({
    title,
    message,
    type = NOTIFICATION_TYPES.INFO,
    showPush = true,
    showToast = true,
    sendEmail = false, // Email notifications flag
  }) => {
    // Check if email notifications are enabled
    const prefs = getPreferences();
    const shouldSendEmail = sendEmail && prefs.emailNotifications;
    
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      createdAt: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50 notifications
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    if (showToast) {
      if (type === NOTIFICATION_TYPES.SUCCESS) {
        toast.success(title, { description: message });
      } else if (type === NOTIFICATION_TYPES.ERROR) {
        toast.error(title, { description: message });
      } else if (type === NOTIFICATION_TYPES.WARNING) {
        toast.warning(title, { description: message });
      } else {
        toast.info(title, { description: message });
      }
    }

    // Show push notification if enabled
    if (showPush && pushPermission === 'granted') {
      showPushNotification(title, {
        body: message,
        tag: newNotification.id,
      });
    }

    return newNotification;
  }, [pushPermission, showPushNotification]);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear a notification
  const clearNotification = useCallback((id) => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === id);
      if (notif && !notif.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Format relative time
  const getRelativeTime = useCallback((date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  }, []);

  // Pre-built notification helpers
  const notifyUploadComplete = useCallback((filename, sequenceCount = 1) => {
    addNotification({
      title: 'Upload Complete',
      message: `${filename} with ${sequenceCount} sequence${sequenceCount > 1 ? 's' : ''} uploaded successfully`,
      type: NOTIFICATION_TYPES.SUCCESS,
    });
  }, [addNotification]);

  const notifyAnalysisComplete = useCallback((filename) => {
    addNotification({
      title: 'Analysis Complete',
      message: `Analysis for ${filename} is ready to view`,
      type: NOTIFICATION_TYPES.SUCCESS,
    });
  }, [addNotification]);

  const notifyReportGenerated = useCallback((filename) => {
    addNotification({
      title: 'Report Generated',
      message: `PDF report for ${filename} has been created`,
      type: NOTIFICATION_TYPES.INFO,
    });
  }, [addNotification]);

  const notifyError = useCallback((title, message) => {
    addNotification({
      title,
      message,
      type: NOTIFICATION_TYPES.ERROR,
    });
  }, [addNotification]);

  const value = {
    notifications,
    unreadCount,
    pushPermission,
    emailNotificationsEnabled,
    requestPushPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    getRelativeTime,
    // Helper functions
    notifyUploadComplete,
    notifyAnalysisComplete,
    notifyReportGenerated,
    notifyError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
