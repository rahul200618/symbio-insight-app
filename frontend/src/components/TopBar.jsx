import { Icons } from './Icons';
import { DarkModeToggle } from './DarkModeToggle';
import { motion } from 'motion/react';

export function TopBar({ selectedFile, onInfoClick, user }) {
  return (
    <div className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between w-full px-8 py-3">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Icons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sequences, files, or reports..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
            onChange={async (e) => {
              const query = e.target.value;
              if (query.length > 2) {
                try {
                  const { searchSequences } = await import('../utils/api.js');
                  const results = await searchSequences(query);
                  console.log('Search results:', results);
                  // TODO: Pass results to a search results view or dropdown
                } catch (err) {
                  console.error('Search failed:', err);
                }
              }
            }}
          />
        </div>
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

        {/* Notification Bell with Badge */}
        <motion.button
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notifications"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icons.Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </motion.button>

        {/* User Profile Button */}
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icons.User className="w-4 h-4" />
          <div className="text-left">
            <span className="block text-sm font-medium leading-none">{user?.name || 'Researcher'}</span>
            <span className="block text-xs opacity-80 leading-none mt-1">{user?.email || 'DNA Analysis'}</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
