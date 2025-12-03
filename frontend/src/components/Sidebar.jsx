import { Icons } from './Icons';
import { Logo } from './Logo';




export function Sidebar({ activeView, setActiveView }) {
  const navItems = [
    { id: 'upload', label: 'Upload FASTA', icon: 'Upload' },
    { id: 'recent', label: 'Recent Uploads', icon: 'Clock' },
    { id: 'metadata', label: 'Metadata Dashboard', icon: 'BarChart' },
    { id: 'report', label: 'Generate Report', icon: 'FileText' },
  ];

  return (
    <div className="w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          
            <h2 className="text-gray-900 dark:text-white">Symbio-NLM</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">DNA Insight Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = Icons[item.icon];
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Storage Info */}
      <div className="p-4 m-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Icons.BarChart className="w-4 h-4 text-white" />
          </div>
          
            <p className="text-sm text-gray-700 dark:text-gray-300">Storage Used</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">2.4 GB of 50 GB</p>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-[4.8%] bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" />
        </div>
      </div>
    </div>
  );
}

