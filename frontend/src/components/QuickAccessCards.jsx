import { Icons } from './Icons';
import { motion } from 'motion/react';

export function QuickAccessCards() {
    const cards = [
        { id: 'recent', title: 'Recent Files', subtitle: '24 sequences', icon: 'Clock' },
        { id: 'metadata', title: 'Metadata', subtitle: 'View analytics', icon: 'BarChart' },
        { id: 'reports', title: 'Reports', subtitle: 'Generate now', icon: 'FileText' },
        { id: 'analysis', title: 'DNA Analysis', subtitle: 'Quick tools', icon: 'Activity' },
    ];

    return (
        <div className="grid grid-cols-4 gap-12 mt-8">
            {cards.map((card, index) => {
                const Icon = Icons[card.icon];

                return (
                    <motion.button
                        key={card.id}
                        className="flex flex-col items-center text-center group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md mb-3 group-hover:shadow-lg transition-shadow">
                            <Icon className="w-5 h-5 text-white" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
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
