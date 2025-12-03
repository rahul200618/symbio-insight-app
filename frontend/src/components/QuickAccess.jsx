import { Icons } from './Icons';

export function QuickAccess({ setActiveView }: QuickAccessProps) {
  const quickLinks = [
    {
      id: 'recent',
      icon: 'Clock',
      label: 'Recent Files',
      description: '24 sequences',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'metadata',
      icon: 'BarChart',
      label: 'Metadata',
      description: 'View analytics',
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'report',
      icon: 'FileText',
      label: 'Reports',
      description: 'Generate new',
      gradient: 'from-purple-600 to-indigo-700',
    },
    {
      id: 'upload',
      icon: 'DNA',
      label: 'DNA Analysis',
      description: 'Quick tools',
      gradient: 'from-indigo-600 to-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {quickLinks.map((link) => {
        const Icon = Icons[link.icon typeof Icons];
        return (
          <button
            key={link.id}
            onClick={() => setActiveView(link.id)}
            className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-gray-900 dark:text-white mb-1">{link.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{link.description}</p>
          </button>
        );
      })}
    </div>
  );
}
