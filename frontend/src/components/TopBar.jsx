import { Icons } from './Icons';
import { DarkModeToggle } from './DarkModeToggle';



export function TopBar({ onTogglePanel }) {
  return (
    <div className="h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Icons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sequences, files, or reports..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 focus:bg-white dark:focus:bg-gray-700 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-8">
        {/* Dark Mode Toggle */}
        <DarkModeToggle />
        
        {/* File Info Toggle */}
        <button 
          onClick={onTogglePanel}
          className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
        >
          <Icons.Info className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all">
          <Icons.Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Icons.User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm text-white">Researcher</p>
            <p className="text-xs text-white/70">DNA Analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}

