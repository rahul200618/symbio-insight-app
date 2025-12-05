import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../components/AnimatedPage';
import { RecentUploads } from '../components/RecentUploads';
import { SequenceComparison } from '../components/SequenceComparison';
import { Icons } from '../components/Icons';

export function RecentPage({ onFileSelect, parsedSequences }) {
    const navigate = useNavigate();
    const [showComparison, setShowComparison] = useState(false);

    const handleFileSelect = (file) => {
        if (onFileSelect) {
            onFileSelect(file);
        }
        // Navigate to report page when file is selected
        navigate('/report');
    };

    const handleCompare = () => {
        if (!parsedSequences || parsedSequences.length < 2) {
            toast.error('Please upload at least 2 files to compare');
            return;
        }
        setShowComparison(true);
    };

    return (
        <AnimatedPage animation="slide-up">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
            >
                {/* Header with Compare Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Uploads</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            View and manage your uploaded sequences
                        </p>
                    </div>

                    {/* Compare Button */}
                    {parsedSequences && parsedSequences.length >= 2 ? (
                        <motion.button
                            onClick={handleCompare}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Icons.Activity className="w-4 h-4" />
                            Compare Sequences
                        </motion.button>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Icons.Info className="w-4 h-4" />
                            Upload {parsedSequences?.length === 1 ? '1 more file' : '2 files'} to enable comparison
                        </div>
                    )}
                </div>

                <RecentUploads onFileSelect={handleFileSelect} />

                {/* Sequence Comparison Modal */}
                {showComparison && parsedSequences && parsedSequences.length >= 2 && (
                    <SequenceComparison
                        sequences={parsedSequences}
                        onClose={() => setShowComparison(false)}
                    />
                )}
            </motion.div>
        </AnimatedPage>
    );
}
