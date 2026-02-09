import { Icons } from './Icons';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useRef, useCallback } from 'react';

export function Sidebar({ activeView }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navRefs = useRef([]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const navItems = [
    { id: 'dashboard', label: 'Upload FASTA', icon: 'Upload', path: '/dashboard' },
    { id: 'recent', label: 'Recent Uploads', icon: 'Clock', path: '/recent' },
    { id: 'metadata', label: 'Metadata Dashboard', icon: 'BarChart', path: '/metadata' },
    // Admin-only nav item
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Dashboard', icon: 'Settings', path: '/admin' }] : []),
  ];

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % navItems.length;
      navRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + navItems.length) % navItems.length;
      navRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      navRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      navRefs.current[navItems.length - 1]?.focus();
    }
  }, [navItems.length]);

  // Determine active item based on current location
  const getActiveItem = () => {
    const path = location.pathname;
    const activeItem = navItems.find(item => path.includes(item.id));
    return activeItem?.id || activeView;
  };

  const currentActive = getActiveItem();

  return (
    <aside 
      className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0 overflow-hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Symbio-NLM</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">DNA Insight Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1" role="menubar" aria-label="Primary navigation">
        {navItems.map((item, index) => {
          const Icon = Icons[item.icon];
          const isActive = currentActive === item.id;

          return (
            <Link 
              key={item.id} 
              to={item.path}
              ref={el => navRefs.current[index] = el}
              role="menuitem"
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <motion.div
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${isActive
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                whileHover={!isActive ? { x: 4 } : {}}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg hover:shadow-red-500/30 transition-all font-bold shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          style={{ color: '#ffffff', backgroundColor: '#ef4444' }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Logout from your account"
        >
          <Icons.LogOut className="w-5 h-5" style={{ color: '#ffffff', fill: '#ffffff', stroke: '#ffffff' }} aria-hidden="true" />
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '15px' }}>Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}
