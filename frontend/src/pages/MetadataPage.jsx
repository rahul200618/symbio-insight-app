import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../components/AnimatedPage';
import { MetadataCards } from '../components/MetadataCards';
import { Icons } from '../components/Icons';
import { getSequences, getSequenceById } from '../utils/sequenceApi';
import { extractMetadata, generateUniqueId, calculateCodonFrequency, countNucleotides, calculateGCPercentage } from '../utils/fastaParser';

const transformToFrontendFormat = (data) => {
    if (!data) return [];

    // Handle array input
    let inputs = Array.isArray(data) ? data : [data];

    // If the input has a sequences array (from backend multi-sequence file), use that
    if (!Array.isArray(data) && data.sequences && Array.isArray(data.sequences) && data.sequences.length > 0) {
        inputs = data.sequences;
    }

    // Filter out any null/undefined items
    inputs = inputs.filter(item => item != null);

    return inputs.map(item => {
        if (!item) return null;

        // Normalize nucleotideCounts - ensure it has all keys, handle string JSON
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

        // If it already looks correct (from frontend parser) and has codonFrequency, return it
        if (item.sequenceLength !== undefined && item.nucleotideCounts && item.orfs && item.codonFrequency) {
            return {
                ...item,
                nucleotideCounts: normalizeCounts(item.nucleotideCounts),
                orfs: item.orfs || [],
            };
        }

        // If it already has structure but missing codonFrequency, add it
        if (item.sequenceLength !== undefined && item.nucleotideCounts) {
            const rawSeq = item.rawSequence || item.sequence || '';
            const { codonFrequency, codonStats } = rawSeq ? calculateCodonFrequency(rawSeq) : { codonFrequency: {}, codonStats: {} };
            return {
                ...item,
                nucleotideCounts: normalizeCounts(item.nucleotideCounts),
                orfs: item.orfs || [],
                codonFrequency,
                codonStats,
            };
        }

        // If it has backend format (length instead of sequenceLength), transform it
        if (item.length !== undefined || item.nucleotideCounts) {
            const rawSeq = item.sequence || '';
            const { codonFrequency, codonStats } = rawSeq ? calculateCodonFrequency(rawSeq) : { codonFrequency: {}, codonStats: {} };
            
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
                codonFrequency,
                codonStats,
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
                codonFrequency: {},
                codonStats: { totalCodons: 0, uniqueCodons: 0, startCodons: 0, stopCodons: 0 },
                timestamp: item.createdAt || new Date().toISOString(),
            };
        }

        // Use the centralized parser logic (extractMetadata already includes codonFrequency)
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

export function MetadataPage({ parsedSequences, selectedFile, onFileSelect }) {
    const [generatingReport, setGeneratingReport] = useState(false);
    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Ensure we have valid data for rendering
    const validParsedSequences = transformToFrontendFormat(parsedSequences);

    const navigate = useNavigate();

    // Fetch available files on mount
    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            setLoadingFiles(true);
            const response = await getSequences({ page: 1, limit: 100 });
            // API usually returns { data: [...] } or just [...]
            setFiles(Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));
        } catch (error) {
            console.error('Failed to load files:', error);
            toast.error('Failed to load available files');
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleFileChange = async (file) => {
        try {
            setDropdownOpen(false);
            const loadingToast = toast.loading(`Loading ${file.filename || file.name || 'file'}...`);

            // Get full file details if needed
            const fullData = await getSequenceById(file._id || file.id);

            // Identify where the sequence array is
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
                data: formattedSequences,
                filename: file.filename || file.name || fullData.filename || 'Selected File'
            };

            onFileSelect(fileWithData);
            toast.dismiss(loadingToast);
            toast.success(`Loaded ${fileWithData.filename}`);
        } catch (error) {
            console.error('Error loading file:', error);
            toast.error('Failed to load file data');
        }
    };

    const handleGenerateReport = async () => {
        if (!validParsedSequences || validParsedSequences.length === 0) {
            toast.error('No sequences available to generate report');
            return;
        }

        setGeneratingReport(true);
        toast.loading('Generating comprehensive report...', { id: 'report-gen' });

        setTimeout(() => {
            setGeneratingReport(false);
            toast.success('Report generated successfully!', { id: 'report-gen' });
            navigate('/report');
        }, 1500);
    };

    const currentFileName = selectedFile?.filename || selectedFile?.name || (validParsedSequences?.length > 0 ? "Current Analysis" : "No File Selected");

    return (
        <AnimatedPage animation="slide-up">
            {/* Header with Title, File Selector and Generate Report */}
            <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative', zIndex: 20 }}
            >
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Sequence Metadata
                    </h2>
                    <div className="flex items-center gap-2 mt-1 relative">
                        {/* File Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-1 pl-1 pr-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                            >
                                <Icons.File className="w-4 h-4" />
                                <span className="font-medium truncate max-w-[200px]">{currentFileName}</span>
                                <Icons.ChevronRight className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 max-h-80 overflow-y-auto"
                                    >
                                        <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Select File</p>
                                        </div>
                                        {loadingFiles ? (
                                            <div className="p-8 flex justify-center">
                                                <Icons.Loader className="w-6 h-6 animate-spin text-purple-500" />
                                            </div>
                                        ) : files.length > 0 ? (
                                            <div className="py-1">
                                                {files.map((file) => {
                                                    // Robust selection check
                                                    const isSelected = selectedFile && (
                                                        (file._id && selectedFile._id === file._id) ||
                                                        (file.id && selectedFile.id === file.id) ||
                                                        ((!file._id && !file.id) && (file.filename === selectedFile.filename || file.name === selectedFile.name))
                                                    );

                                                    const fileName = file.filename || file.name || `Sequence ${file._id?.substring(0, 6) || 'Unknown'}`;

                                                    return (
                                                        <button
                                                            key={file._id || file.id || Math.random()}
                                                            onClick={() => handleFileChange(file)}
                                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-purple-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-l-2 ${isSelected
                                                                ? 'bg-purple-50 text-purple-700 dark:bg-gray-700 dark:text-purple-300 border-purple-500'
                                                                : 'text-gray-700 dark:text-gray-300 border-transparent'
                                                                }`}
                                                        >
                                                            <div className={`p-1.5 rounded-md ${isSelected ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                                <Icons.FileText className={`w-4 h-4 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium truncate">{fileName}</p>
                                                                <p className="text-xs text-gray-400 truncate">
                                                                    {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'No date'} • {file.sequenceCount || file.sequences?.length || 1} seqs
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <Icons.Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center flex flex-col items-center gap-2">
                                                <Icons.File className="w-8 h-8 text-gray-300" />
                                                <p className="text-sm text-gray-500">No stored files found</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <span className="text-gray-300 dark:text-gray-600">|</span>

                        {validParsedSequences && validParsedSequences.length > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                {validParsedSequences.length} sequence{validParsedSequences.length !== 1 ? 's' : ''} loaded
                            </p>
                        )}
                    </div>
                </div>

                {/* Generate Report Button - Always visible */}
                <motion.button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                    whileHover={{ scale: generatingReport ? 1 : 1.05, y: generatingReport ? 0 : -2 }}
                    whileTap={{ scale: generatingReport ? 1 : 0.95 }}
                >
                    {generatingReport ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Icons.Loader className="w-4 h-4" />
                            </motion.div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <Icons.FileText className="w-4 h-4" />
                            Generate Report
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* Metadata Cards */}
            <MetadataCards parsedSequences={validParsedSequences || []} />
        </AnimatedPage>
    );
}
