import { Icons } from './Icons';
import { motion } from 'motion/react';

export function Sidebar({ activeView, onViewChange }) {
  const navItems = [
    { id: 'upload', label: 'Upload FASTA', icon: 'Upload' },
    { id: 'recent', label: 'Recent Uploads', icon: 'Clock' },
    { id: 'metadata', label: 'Metadata Dashboard', icon: 'BarChart' },
    { id: 'report', label: 'Generate Report', icon: 'FileText' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen">
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* DNA Helix Icon */}
              <path d="M7 2 Q5 7, 7 12 Q9 17, 7 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M17 2 Q19 7, 17 12 Q15 17, 17 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <line x1="7" y1="5" x2="17" y2="5" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" />
              <line x1="7" y1="10" x2="17" y2="10" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" />
              <line x1="7" y1="15" x2="17" y2="15" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" />
              <line x1="7" y1="20" x2="17" y2="20" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" />
            </svg>
          </div>

          {/* Brand Text */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Symbio-NLM</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">DNA Insight Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = Icons[item.icon];
          const isActive = activeView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${isActive
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              whileHover={!isActive ? { x: 4 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Storage Info */}
      <div className="p-4 m-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <Icons.BarChart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Storage Used</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">24 GB of 50 GB</p>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '48%' }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Bottom Quick Actions (Optional - shown in image) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around gap-2">
          <motion.button
            className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Quick action 1"
          >
            <Icons.Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </motion.button>

          <motion.button
            className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Quick action 2"
          >
            <Icons.BarChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </motion.button>

          <motion.button
            className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Quick action 3"
          >
            <Icons.FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </motion.button>

          <motion.button
            className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Quick action 4"
          >
            <Icons.Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
