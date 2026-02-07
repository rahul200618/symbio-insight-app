import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    translateAllFrames,
    findProteins,
    analyzeProtein,
    formatProteinSequence
} from '../utils/proteinTranslation';

/**
 * ProteinTranslation Component
 * 
 * Displays DNA to protein translation in all 6 reading frames
 * with detailed protein analysis.
 */
export default function ProteinTranslation({ sequence, sequenceName }) {
    const [activeTab, setActiveTab] = useState('frames');
    const [selectedFrame, setSelectedFrame] = useState(1);
    const [minProteinLength, setMinProteinLength] = useState(20);
    const [showFullSequence, setShowFullSequence] = useState(false);

    // Get the raw sequence string
    const rawSequence = useMemo(() => {
        if (!sequence) return '';
        if (typeof sequence === 'string') return sequence;
        return sequence.sequence || sequence.rawSequence || '';
    }, [sequence]);

    // Translate all 6 frames
    const translations = useMemo(() => {
        if (!rawSequence || rawSequence.length < 3) return [];
        return translateAllFrames(rawSequence);
    }, [rawSequence]);

    // Find potential proteins
    const proteins = useMemo(() => {
        if (!rawSequence || rawSequence.length < 60) return [];
        return findProteins(rawSequence, minProteinLength);
    }, [rawSequence, minProteinLength]);

    // Get selected frame translation
    const selectedTranslation = useMemo(() => {
        return translations.find(t => t.frame === selectedFrame) || translations[0];
    }, [translations, selectedFrame]);

    // Analyze selected protein
    const [selectedProtein, setSelectedProtein] = useState(null);
    const proteinAnalysis = useMemo(() => {
        if (!selectedProtein) return null;
        return analyzeProtein(selectedProtein.sequence);
    }, [selectedProtein]);

    if (!rawSequence || rawSequence.length < 3) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🧬 Protein Translation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    No sequence available for translation. Upload a DNA sequence to see protein translations.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🧬 Protein Translation
                    {sequenceName && (
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            — {sequenceName}
                        </span>
                    )}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    DNA sequence translated in all 6 reading frames
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {['frames', 'proteins', 'analysis'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab === 'frames' && '📋 Reading Frames'}
                        {tab === 'proteins' && `🔬 Proteins (${proteins.length})`}
                        {tab === 'analysis' && '📊 Analysis'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {/* Reading Frames Tab */}
                    {activeTab === 'frames' && (
                        <motion.div
                            key="frames"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Frame Selector */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {translations.map((trans) => (
                                    <button
                                        key={trans.frame}
                                        onClick={() => setSelectedFrame(trans.frame)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            selectedFrame === trans.frame
                                                ? 'bg-indigo-600 text-white'
                                                : trans.frame > 0
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                        }`}
                                    >
                                        {trans.label}
                                        <span className="ml-2 opacity-70">({trans.length} aa)</span>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Frame Display */}
                            {selectedTranslation && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">{selectedTranslation.label}</span>
                                            {' • '}
                                            {selectedTranslation.length} amino acids
                                            {' • '}
                                            {selectedTranslation.direction === 'forward' ? "5' → 3'" : "3' → 5' (reverse complement)"}
                                        </div>
                                        <button
                                            onClick={() => setShowFullSequence(!showFullSequence)}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            {showFullSequence ? 'Show less' : 'Show full sequence'}
                                        </button>
                                    </div>

                                    {/* Protein Sequence */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
                                        <pre className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                                            {showFullSequence
                                                ? formatProteinSequence(selectedTranslation.protein)
                                                : selectedTranslation.protein.substring(0, 200) + (selectedTranslation.protein.length > 200 ? '...' : '')
                                            }
                                        </pre>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {selectedTranslation.length}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Amino Acids</div>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {(selectedTranslation.protein.match(/M/g) || []).length}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Start Codons (M)</div>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {(selectedTranslation.protein.match(/\*/g) || []).length}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Stop Codons (*)</div>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                {selectedTranslation.codons.length}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Total Codons</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Proteins Tab */}
                    {activeTab === 'proteins' && (
                        <motion.div
                            key="proteins"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Min Length Filter */}
                            <div className="flex items-center gap-4 mb-4">
                                <label className="text-sm text-gray-600 dark:text-gray-400">
                                    Minimum protein length:
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={minProteinLength}
                                    onChange={(e) => setMinProteinLength(Number(e.target.value))}
                                    className="w-32"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {minProteinLength} aa
                                </span>
                            </div>

                            {proteins.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>No proteins found with minimum length of {minProteinLength} amino acids.</p>
                                    <p className="text-sm mt-2">Try lowering the minimum length threshold.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {proteins.slice(0, 10).map((protein, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedProtein(selectedProtein === protein ? null : protein)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                selectedProtein === protein
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        protein.frame > 0
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                        {protein.label}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Protein #{idx + 1}
                                                    </span>
                                                    {protein.incomplete && (
                                                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                            Incomplete
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {protein.length} aa • ~{(protein.molecularWeight / 1000).toFixed(1)} kDa
                                                </div>
                                            </div>
                                            <div className="font-mono text-xs text-gray-600 dark:text-gray-400 truncate">
                                                {protein.sequence.substring(0, 50)}...
                                            </div>
                                        </motion.div>
                                    ))}
                                    {proteins.length > 10 && (
                                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                                            Showing top 10 of {proteins.length} proteins
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Analysis Tab */}
                    {activeTab === 'analysis' && (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {!selectedProtein ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>Select a protein from the "Proteins" tab to see detailed analysis.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Protein Analysis — {selectedProtein.label}
                                        </h4>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedProtein.length} amino acids
                                        </span>
                                    </div>

                                    {proteinAnalysis && (
                                        <>
                                            {/* Properties */}
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {(proteinAnalysis.molecularWeight / 1000).toFixed(1)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">kDa</div>
                                                </div>
                                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                        {proteinAnalysis.properties.hydrophobic.percent}%
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Hydrophobic</div>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                        {proteinAnalysis.properties.hydrophilic.percent}%
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Hydrophilic</div>
                                                </div>
                                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                        +{proteinAnalysis.properties.positiveCharge.count}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Positive Charge</div>
                                                </div>
                                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                        -{proteinAnalysis.properties.negativeCharge.count}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Negative Charge</div>
                                                </div>
                                            </div>

                                            {/* Amino Acid Composition */}
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                    Amino Acid Composition
                                                </h5>
                                                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                                    {Object.entries(proteinAnalysis.composition)
                                                        .sort((a, b) => b[1] - a[1])
                                                        .map(([aa, count]) => (
                                                            <div
                                                                key={aa}
                                                                className="bg-gray-100 dark:bg-gray-700 rounded p-2 text-center"
                                                            >
                                                                <div className="font-mono font-bold text-gray-900 dark:text-white">
                                                                    {aa}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {count}
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>

                                            {/* Full Sequence */}
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                    Full Protein Sequence
                                                </h5>
                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
                                                    <pre className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                                                        {formatProteinSequence(selectedProtein.sequence)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
