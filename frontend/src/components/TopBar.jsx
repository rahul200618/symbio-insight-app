import { Icons } from './Icons';
import { DarkModeToggle } from './DarkModeToggle';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSequences, getSequences } from '../utils/sequenceApi';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function TopBar({ selectedFile, onInfoClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSequences, setRecentSequences] = useState([]);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();
  
  // Get notifications from context
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    getRelativeTime,
    pushPermission,
    requestPushPermission
  } = useNotifications();
  
  // Get user from AuthContext
  const { user, logout } = useAuth();
  
  // Get saved profile data from localStorage
  const getSavedProfile = () => {
    try {
      const saved = localStorage.getItem('symbio-user-profile');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  };
  
  const savedProfile = getSavedProfile();
  const displayName = user?.name || savedProfile?.name || 'Researcher';
  const displayEmail = user?.email || savedProfile?.email || 'researcher@symbio.com';

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load recent sequences on mount
  useEffect(() => {
    loadRecentSequences();
  }, []);

  const loadRecentSequences = async () => {
    try {
      const response = await getSequences({ page: 1, limit: 5, sort: '-createdAt' });
      if (response.sequences) {
        setRecentSequences(response.sequences);
      }
    } catch (error) {
      console.error('Failed to load recent sequences:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setShowSearchResults(true);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await searchSequences(query, 10);
        if (response.results) {
          setSearchResults(response.results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSearchResultClick = (result) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/reports?id=${result.id}`);
    toast.success(`Opening: ${result.name || 'Sequence ' + result.id}`);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() || recentSequences.length > 0) {
      setShowSearchResults(true);
    }
  };

  const getSuggestions = () => {
    return [
      { type: 'action', label: 'View All Reports', icon: 'FileText', path: '/reports' },
      { type: 'action', label: 'Recent Uploads', icon: 'Upload', path: '/recent' },
      { type: 'action', label: 'Compare Sequences', icon: 'GitCompare', path: '/recent' },
      { type: 'action', label: 'Generate New Report', icon: 'FileDown', path: '/reports' },
    ];
  };

  return (
    <div className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between w-full px-8 py-3">
      {/* Search Bar with Suggestions */}
      <div className="flex-1 max-w-2xl relative" ref={searchRef}>
        <div className="relative">
          <Icons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder="Search sequences, files, or reports..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearchResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto"
            >
              {/* Search Results */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Search Results ({searchResults.length})
                    </p>
                  </div>
                  {searchResults.map((result) => (
                    <motion.button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      whileHover={{ x: 4 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Icons.FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.name || `Sequence ${result.id}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {result.length ? `${result.length} bp` : 'Sequence'} • GC: {result.gcContent?.toFixed(1) || 'N/A'}%
                        </p>
                      </div>
                      <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
                <div className="px-4 py-8 text-center">
                  <Icons.Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No results found</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Try searching for sequence names or IDs</p>
                </div>
              )}

              {/* Recent Sequences */}
              {!searchQuery.trim() && recentSequences.length > 0 && (
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Recent Sequences
                    </p>
                  </div>
                  {recentSequences.map((seq) => (
                    <motion.button
                      key={seq.id}
                      onClick={() => handleSearchResultClick(seq)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      whileHover={{ x: 4 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <Icons.Upload className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {seq.name || `Sequence ${seq.id}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {seq.length ? `${seq.length} bp` : 'Sequence'} • {new Date(seq.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Quick Actions / Suggestions */}
              {!searchQuery.trim() && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Quick Actions
                    </p>
                  </div>
                  {getSuggestions().map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => {
                        navigate(suggestion.path);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      whileHover={{ x: 4 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        {suggestion.icon === 'FileText' && <Icons.FileText className="w-5 h-5 text-white" />}
                        {suggestion.icon === 'Upload' && <Icons.Upload className="w-5 h-5 text-white" />}
                        {suggestion.icon === 'GitCompare' && <Icons.GitCompare className="w-5 h-5 text-white" />}
                        {suggestion.icon === 'FileDown' && <Icons.FileDown className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {suggestion.label}
                        </p>
                      </div>
                      <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-3 ml-6">
        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        {/* Info Button */}
        <motion.button
          onClick={onInfoClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle info panel"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icons.Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icons.Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {pushPermission !== 'granted' && (
                      <button 
                        onClick={requestPushPermission}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium"
                        title="Enable push notifications"
                      >
                        Enable Push
                      </button>
                    )}
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 10).map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 cursor-pointer ${!notif.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notif.type === 'success' ? 'bg-green-500' : 
                            notif.type === 'error' ? 'bg-red-500' : 
                            notif.type === 'warning' ? 'bg-amber-500' : 
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{notif.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{getRelativeTime(notif.createdAt)}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Icons.Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload a file or generate a report</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {pushPermission === 'granted' ? '🔔 Push notifications enabled' : 'Push notifications disabled'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile with Dropdown */}
        <div className="relative" ref={profileRef}>
          <motion.button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icons.User className="w-4 h-4" />
            <span className="text-sm font-medium">{displayName.split(' ')[0]}</span>
          </motion.button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                {/* User Info */}
                <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{displayEmail}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Icons.User className="w-4 h-4" />
                    View Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                    <Icons.Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      toast.success('Logged out successfully');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <Icons.LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
