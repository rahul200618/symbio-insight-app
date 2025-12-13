import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../components/AnimatedPage';
import { RecentUploads } from '../components/RecentUploads';
import { SequenceComparison } from '../components/SequenceComparison';
import { Icons } from '../components/Icons';
import { getSequences, getSequenceById } from '../utils/sequenceApi.js';
import { extractMetadata, generateUniqueId } from '../utils/fastaParser';

// Transform backend data to frontend format
const transformToFrontendFormat = (data) => {
    if (!data) return [];

    let inputs = Array.isArray(data) ? data : [data];
    
    // If the input has a sequences array (from backend multi-sequence file), use that
    if (!Array.isArray(data) && data.sequences && Array.isArray(data.sequences) && data.sequences.length > 0) {
        inputs = data.sequences;
    }

    return inputs.map(item => {
        // If it already looks correct (from frontend parser), return it
        if (item.sequenceLength !== undefined && item.nucleotideCounts && item.orfs) {
            return item;
        }

        // If it has backend format (length instead of sequenceLength), transform it
        if (item.length !== undefined && item.nucleotideCounts) {
            return {
                id: item._id || item.id || generateUniqueId(),
                sequenceName: item.header || item.name || 'Untitled Sequence',
                sequenceLength: item.length,
                gcPercentage: item.gcContent || 0,
                nucleotideCounts: item.nucleotideCounts,
                orfs: item.orfs || [],
                rawSequence: item.sequence || '',
                timestamp: item.createdAt || new Date().toISOString(),
            };
        }

        // If it has a raw sequence string, calculate stats using the robust parser
        const seq = item.sequence || item.seq || item.rawSequence || '';
        const header = item.header || item.filename || item.name || 'Untitled Sequence';

        // Use the centralized parser logic
        const metadata = extractMetadata(header, seq);

        // Merge with any existing IDs or timestamps
        return {
            ...metadata,
            id: item._id || item.id || generateUniqueId(),
            timestamp: item.createdAt || new Date().toISOString(),
        };
    });
};

export function RecentPage({ onFileSelect, parsedSequences }) {
    const navigate = useNavigate();
    const [showComparison, setShowComparison] = useState(false);
    const [fileCount, setFileCount] = useState(0);
    const [sequences, setSequences] = useState([]);

    // Fetch file count from backend
    useEffect(() => {
        loadFileCount();
    }, []);

    const loadFileCount = async () => {
        try {
            const response = await getSequences({ page: 1, limit: 100 });
            setFileCount(response.data?.length || 0);
            setSequences(response.data || []);
        } catch (error) {
            console.error('Failed to load file count:', error);
        }
    };

    const handleFileSelect = async (file) => {
        try {
            // Show loading state
            const loadingToast = toast.loading(`Loading ${file.name || 'file'}...`);
            
            // Fetch full file details including sequences array
            const fileId = file.id || file.backendData?.id;
            const fullData = await getSequenceById(fileId);
            
            // Get sequences array from full data
            let rawSequences = fullData.sequences || fullData.data || fullData;
            
            // Transform to frontend format
            const formattedSequences = transformToFrontendFormat(rawSequences);
            
            // Construct file object with standardized data
            const fileWithData = {
                ...fullData,
                id: fileId,
                _id: fileId,
                data: formattedSequences,
                filename: file.name || fullData.filename || 'Selected File'
            };

            if (onFileSelect) {
                onFileSelect(fileWithData);
            }
            
            toast.dismiss(loadingToast);
            toast.success(`Loaded ${fileWithData.filename} with ${formattedSequences.length} sequences`);
            
            // Navigate to metadata dashboard
            navigate('/metadata');
        } catch (error) {
            console.error('Error loading file:', error);
            toast.error('Failed to load file data');
        }
    };

    const handleCompare = () => {
        if (fileCount < 2) {
            toast.error('Please upload at least 2 files to compare');
            return;
        }
        setShowComparison(true);
    };

    return (
        <>
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

                        {/* Compare Button - Always show when 2+ files */}
                        <motion.button
                            onClick={handleCompare}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Icons.Activity className="w-4 h-4" />
                            Compare Sequences
                        </motion.button>
                    </div>

                    <RecentUploads onFileSelect={handleFileSelect} />
                </motion.div>
            </AnimatedPage>

            {/* Sequence Comparison Modal - Rendered outside AnimatedPage for proper z-index */}
            <AnimatePresence>
                {showComparison && sequences && sequences.length >= 2 && (
                    <SequenceComparison
                        sequences={sequences}
                        onClose={() => setShowComparison(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
