import { Icons } from './Icons';

export function QuickAccess({ setActiveView }) {
  const quickLinks = [
    {
      id: 'recent',
      icon: 'Clock',
      label: 'Recent Files',
      description: '24 sequences',
      gradient: 'linear-gradient(to bottom right, #1E3A8A, #2563EB)',
    },
    {
      id: 'metadata',
      icon: 'BarChart',
      label: 'Metadata',
      description: 'View analytics',
      gradient: 'linear-gradient(to bottom right, #2563EB, #1E3A8A)',
    },
    {
      id: 'report',
      icon: 'FileText',
      label: 'Reports',
      description: 'Generate new',
      gradient: 'linear-gradient(to bottom right, #1E3A8A, #0F172A)',
    },
    {
      id: 'upload',
      icon: 'DNA',
      label: 'DNA Analysis',
      description: 'Quick tools',
      gradient: 'linear-gradient(to bottom right, #2563EB, #0F172A)',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {quickLinks.map((link) => {
        const Icon = Icons[link.icon] || Icons.File;
        return (
          <button
            key={link.id}
            onClick={() => setActiveView(link.id)}
            className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm" style={{ background: link.gradient }}>
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
