import { Icons } from './Icons';
import { motion } from 'motion/react';

export function QuickAccessCards() {
    const cards = [
        { id: 'parsing', title: 'Smart Parsing', subtitle: 'Auto-detects multi-sequence files', icon: 'FileText' },
        { id: 'analytics', title: 'Sequence Analysis', subtitle: 'GC content, ORF & mutations', icon: 'Activity' },
        { id: 'visuals', title: 'Visual Insights', subtitle: 'Interactive distribution charts', icon: 'PieChart' },
        { id: 'export', title: 'PDF Export', subtitle: 'Generate comprehensive reports', icon: 'Download' },
    ];

    return (
        <div className="grid grid-cols-4 gap-12 mt-8">
            {cards.map((card, index) => {
                const Icon = Icons[card.icon];

                return (
                    <motion.button
                        key={card.id}
                        className="flex flex-col items-center text-center group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {card.title}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {card.subtitle}
                        </p>
                    </motion.button>
                );
            })}
        </div>
    );
}
