import { Icons } from './Icons';
import { motion } from 'motion/react';
import { Card3D, Icon3D, Floating3D } from './3DComponents';
import { staggerContainer, staggerItem } from '../utils/3dMotion';

export function QuickAccessCards() {
    const cards = [
        { id: 'parsing', title: 'Smart Parsing', subtitle: 'Auto-detects multi-sequence files', icon: 'FileText', color: 'from-purple-500 to-indigo-600' },
        { id: 'analytics', title: 'Sequence Analysis', subtitle: 'GC content, ORF & mutations', icon: 'Activity', color: 'from-blue-500 to-cyan-600' },
        { id: 'visuals', title: 'Visual Insights', subtitle: 'Interactive distribution charts', icon: 'PieChart', color: 'from-pink-500 to-rose-600' },
        { id: 'export', title: 'PDF Export', subtitle: 'Generate comprehensive reports', icon: 'Download', color: 'from-green-500 to-emerald-600' },
    ];

    return (
        <motion.div 
            className="grid grid-cols-4 gap-12 mt-8"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            style={{ perspective: '1000px' }}
        >
            {cards.map((card, index) => {
                const Icon = Icons[card.icon];

                return (
                    <motion.div
                        key={card.id}
                        variants={staggerItem}
                    >
                        <Card3D
                            className="flex flex-col items-center text-center group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full cursor-pointer"
                            glowColor={card.id === 'parsing' ? 'rgba(139, 92, 246, 0.4)' : 
                                      card.id === 'analytics' ? 'rgba(59, 130, 246, 0.4)' :
                                      card.id === 'visuals' ? 'rgba(236, 72, 153, 0.4)' :
                                      'rgba(34, 197, 94, 0.4)'}
                            maxTilt={8}
                            scale={1.05}
                        >
                            {/* Floating Icon with 3D rotation */}
                            <Floating3D delay={index * 0.2} duration={3} intensity={5}>
                                <Icon3D rotationDegrees={15}>
                                    <motion.div 
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-xl mb-4 relative`}
                                        whileHover={{ 
                                            scale: 1.15,
                                            rotate: [0, -5, 5, 0],
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 rounded-xl bg-white opacity-20 blur-xl" />
                                        <Icon className="w-7 h-7 text-white relative z-10" />
                                    </motion.div>
                                </Icon3D>
                            </Floating3D>

                            {/* Title with gradient on hover */}
                            <motion.h3 
                                className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300"
                            >
                                {card.title}
                            </motion.h3>

                            {/* Subtitle */}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {card.subtitle}
                            </p>

                            {/* Animated border on hover */}
                            <motion.div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                                style={{
                                    background: `linear-gradient(135deg, ${card.color}, transparent)`,
                                    backgroundSize: '200% 200%',
                                    filter: 'blur(20px)',
                                    zIndex: -1
                                }}
                                animate={{
                                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'linear'
                                }}
                            />
                        </Card3D>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
