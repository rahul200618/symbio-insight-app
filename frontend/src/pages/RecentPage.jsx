import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../components/AnimatedPage';
import { RecentUploads } from '../components/RecentUploads';
import { SequenceComparison } from '../components/SequenceComparison';
import { Icons } from '../components/Icons';
import { getSequences, getSequenceById } from '../utils/sequenceApi.js';
import { extractMetadata, generateUniqueId, countNucleotides, calculateGCPercentage } from '../utils/fastaParser';

// Transform backend data to frontend format (with null safety)
const transformToFrontendFormat = (data) => {
    if (!data) return [];

    let inputs = Array.isArray(data) ? data : [data];
    
    // If the input has a sequences array (from backend multi-sequence file), use that
    if (!Array.isArray(data) && data.sequences && Array.isArray(data.sequences) && data.sequences.length > 0) {
        inputs = data.sequences;
    }

    // Filter out any null/undefined items
    inputs = inputs.filter(item => item != null);

    // Helper to normalize nucleotide counts - handle string JSON from database
    const normalizeCounts = (counts) => {
        // Handle null/undefined
        if (!counts) return { A: 0, T: 0, G: 0, C: 0 };
        
        // Handle string JSON (from database)
        let parsed = counts;
        if (typeof counts === 'string') {
            try {
                parsed = JSON.parse(counts);
            } catch (e) {
                console.warn('Failed to parse nucleotideCounts string:', counts);
                return { A: 0, T: 0, G: 0, C: 0 };
            }
        }
        
        // Handle non-object types
        if (typeof parsed !== 'object') return { A: 0, T: 0, G: 0, C: 0 };
        
        return {
            A: Number(parsed.A) || 0,
            T: Number(parsed.T) || 0,
            G: Number(parsed.G) || 0,
            C: Number(parsed.C) || 0
        };
    };

    return inputs.map(item => {
        if (!item) return null;

        // If it already looks correct (from frontend parser), return it with normalized counts
        if (item.sequenceLength !== undefined && item.nucleotideCounts) {
            return {
                ...item,
                nucleotideCounts: normalizeCounts(item.nucleotideCounts),
                orfs: item.orfs || [],
            };
        }

        // If it has backend format (length instead of sequenceLength), transform it
        if (item.length !== undefined || item.nucleotideCounts) {
            const rawSeq = item.sequence || '';
            
            // Handle all possible GC property names from backend
            const gcValue = item.gcPercentage ?? item.gcContent ?? item.gcPercent ?? 0;
            
            // Get nucleotide counts - recalculate from raw sequence if missing
            let nucleotides = normalizeCounts(item.nucleotideCounts);
            const hasValidCounts = nucleotides.A > 0 || nucleotides.T > 0 || nucleotides.G > 0 || nucleotides.C > 0;
            
            // If no valid counts but we have raw sequence, recalculate
            if (!hasValidCounts && rawSeq && rawSeq.length > 0) {
                nucleotides = countNucleotides(rawSeq);
            }
            
            // Recalculate GC if needed
            let finalGC = gcValue;
            if (!finalGC && rawSeq && rawSeq.length > 0) {
                finalGC = calculateGCPercentage(nucleotides, rawSeq.length);
            }
            
            return {
                id: item._id || item.id || generateUniqueId(),
                sequenceName: item.header || item.name || 'Untitled Sequence',
                sequenceLength: item.length ?? item.sequenceLength ?? rawSeq.length ?? 0,
                gcPercentage: finalGC,
                nucleotideCounts: nucleotides,
                orfs: item.orfs || [],
                rawSequence: rawSeq,
                timestamp: item.createdAt || new Date().toISOString(),
            };
        }

        // If it has a raw sequence string, calculate stats using the robust parser
        const seq = item.sequence || item.seq || item.rawSequence || '';
        const header = item.header || item.filename || item.name || 'Untitled Sequence';

        // Handle empty sequences
        if (!seq) {
            return {
                id: item._id || item.id || generateUniqueId(),
                sequenceName: header,
                sequenceLength: 0,
                gcPercentage: 0,
                nucleotideCounts: { A: 0, T: 0, G: 0, C: 0 },
                orfs: [],
                rawSequence: '',
                timestamp: item.createdAt || new Date().toISOString(),
            };
        }

        // Use the centralized parser logic
        const metadata = extractMetadata(header, seq);

        // Merge with any existing IDs or timestamps
        return {
            ...metadata,
            nucleotideCounts: normalizeCounts(metadata.nucleotideCounts),
            orfs: metadata.orfs || [],
            id: item._id || item.id || generateUniqueId(),
            timestamp: item.createdAt || new Date().toISOString(),
        };
    }).filter(item => item != null);
};

export function RecentPage({ onFileSelect, parsedSequences }) {
    const navigate = useNavigate();
    const [showComparison, setShowComparison] = useState(false);
    const [fileCount, setFileCount] = useState(0);
    const [sequences, setSequences] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch file count from backend
    useEffect(() => {
        loadFileCount();
    }, []);

    // Trigger refresh when parsedSequences changes (new upload)
    useEffect(() => {
        if (parsedSequences && parsedSequences.length > 0) {
            setRefreshKey(prev => prev + 1);
        }
    }, [parsedSequences]);

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
            let rawSequences = fullData.sequences || fullData.data || [];
            
            // If sequences array is empty but we have the main record data, use that
            if ((!rawSequences || rawSequences.length === 0) && (fullData.length || fullData.sequence)) {
                // Construct a single sequence from the parent record
                rawSequences = [{
                    id: fullData._id || fullData.id,
                    name: fullData.name || fullData.header || fullData.filename,
                    header: fullData.header || fullData.name,
                    sequence: fullData.sequence || '',
                    length: fullData.length,
                    gcContent: fullData.gcContent,
                    gcPercent: fullData.gcPercent,
                    gcPercentage: fullData.gcPercentage,
                    nucleotideCounts: fullData.nucleotideCounts,
                    orfs: fullData.orfs || [],
                    orfCount: fullData.orfCount || 0,
                    createdAt: fullData.createdAt
                }];
            }
            
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

                    <RecentUploads onFileSelect={handleFileSelect} refreshTrigger={refreshKey} />
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
