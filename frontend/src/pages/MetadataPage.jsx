import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatedPage } from '../components/AnimatedPage';
import { MetadataCards } from '../components/MetadataCards';
import { SequenceComparison } from '../components/SequenceComparison';
import { Icons } from '../components/Icons';

export function MetadataPage({ parsedSequences }) {
    const [showComparison, setShowComparison] = useState(false);

    return (
        <AnimatedPage animation="slide-up">
            <motion.div
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sequence Metadata
                </h2>
                {parsedSequences && parsedSequences.length >= 2 && (
                    <motion.button
                        onClick={() => setShowComparison(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Icons.Activity className="w-4 h-4" />
                        Compare Sequences
                    </motion.button>
                )}
            </motion.div>
            <MetadataCards parsedSequences={parsedSequences || []} />

            {/* Sequence Comparison Modal */}
            {showComparison && parsedSequences && parsedSequences.length >= 2 && (
                <SequenceComparison
                    sequences={parsedSequences}
                    onClose={() => setShowComparison(false)}
                />
            )}
        </AnimatedPage>
    );
}
