import { Icons } from './Icons';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Transform backend data to component format
function normalizeSequence(seq) {
  if (!seq) return null;

  return {
    sequenceName: seq.filename || seq.name || seq.sequenceName || seq.header || 'Unknown',
    rawSequence: seq.sequence || seq.rawSequence || '',
    sequenceLength: seq.length || seq.sequenceLength || 0,
    gcPercentage: seq.gcContent || seq.gcPercent || seq.gcPercentage || 0,
    orfs: seq.orfs || [],
    orfCount: seq.orfCount || (seq.orfs?.length || 0),
    nucleotideCounts: seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 }
  };
}

export function SequenceComparison({ sequences, onClose }) {
  const [normalizedSequences, setNormalizedSequences] = useState([]);
  const [selectedSequences, setSelectedSequences] = useState([null, null]);
  const [draggedItem, setDraggedItem] = useState(null);

  // Normalize sequences when they change
  useEffect(() => {
    if (sequences && Array.isArray(sequences)) {
      const normalized = sequences.map(normalizeSequence).filter(s => s !== null);
      setNormalizedSequences(normalized);
    }
  }, [sequences]);

  const handleDragStart = (e, sequence) => {
    setDraggedItem(sequence);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, slot) => {
    e.preventDefault();
    if (draggedItem) {
      const newSelected = [...selectedSequences];
      newSelected[slot] = draggedItem;
      setSelectedSequences(newSelected);
      setDraggedItem(null);
    }
  };

  const calculateSimilarity = (seq1, seq2) => {
    const minLength = Math.min(seq1.rawSequence.length, seq2.rawSequence.length);
    let matches = 0;

    for (let i = 0; i < minLength; i++) {
      if (seq1.rawSequence[i] === seq2.rawSequence[i]) {
        matches++;
      }
    }

    return (matches / minLength) * 100;
  };

  const compareSequences = () => {
    const [seq1, seq2] = selectedSequences;
    if (!seq1 || !seq2) return null;

    const similarity = calculateSimilarity(seq1, seq2);
    const lengthDiff = Math.abs(seq1.sequenceLength - seq2.sequenceLength);
    const gcDiff = Math.abs(seq1.gcPercentage - seq2.gcPercentage);

    // Calculate mutations and differences
    const minLength = Math.min(seq1.rawSequence.length, seq2.rawSequence.length);
    let transitions = 0; // A<->G, C<->T
    let transversions = 0; // A<->C, A<->T, G<->C, G<->T
    let matches = 0;

    for (let i = 0; i < minLength; i++) {
      const base1 = seq1.rawSequence[i];
      const base2 = seq2.rawSequence[i];

      if (base1 === base2) {
        matches++;
      } else {
        // Check if transition or transversion
        if ((base1 === 'A' && base2 === 'G') || (base1 === 'G' && base2 === 'A') ||
          (base1 === 'C' && base2 === 'T') || (base1 === 'T' && base2 === 'C')) {
          transitions++;
        } else {
          transversions++;
        }
      }
    }

    const totalMutations = transitions + transversions;
    const mutationRate = ((totalMutations / minLength) * 100).toFixed(2);
    const tiTvRatio = transitions > 0 && transversions > 0 ? (transitions / transversions).toFixed(2) : 'N/A';

    // Nucleotide composition comparison
    const nucDiff = {
      A: Math.abs(seq1.nucleotideCounts.A - seq2.nucleotideCounts.A),
      T: Math.abs(seq1.nucleotideCounts.T - seq2.nucleotideCounts.T),
      G: Math.abs(seq1.nucleotideCounts.G - seq2.nucleotideCounts.G),
      C: Math.abs(seq1.nucleotideCounts.C - seq2.nucleotideCounts.C)
    };

    // Quality assessment
    let alignmentQuality = 'Good';
    if (similarity < 70) alignmentQuality = 'Poor';
    else if (similarity < 85) alignmentQuality = 'Moderate';
    else if (similarity >= 95) alignmentQuality = 'Excellent';

    return {
      similarity,
      lengthDiff,
      gcDiff,
      orfDiff: Math.abs(seq1.orfs.length - seq2.orfs.length),
      mutations: {
        total: totalMutations,
        transitions,
        transversions,
        rate: mutationRate,
        tiTvRatio
      },
      nucleotideDiff: nucDiff,
      alignmentQuality,
      interpretation: getInterpretation(similarity, gcDiff, totalMutations)
    };
  };

  const getInterpretation = (similarity, gcDiff, mutations) => {
    if (similarity >= 95) {
      return "Sequences are highly similar, likely from the same species or closely related variants";
    } else if (similarity >= 85) {
      return "Sequences show significant similarity, possibly from related species or different strains";
    } else if (similarity >= 70) {
      return "Moderate similarity detected, sequences may share common ancestral features";
    } else {
      return "Low similarity suggests distinct evolutionary origins or different functional regions";
    }
  };

  const comparison = compareSequences();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sequence Comparison
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Icons.X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Sequence List */}
            <div className="col-span-4">
              <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-3">Available Sequences</h4>
              <div className="space-y-2">
                {normalizedSequences.slice(0, 20).map((seq, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, seq)}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Icons.DNA className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {seq.sequenceName.substring(0, 30)}...
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {seq.sequenceLength} bp • GC: {seq.gcPercentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Comparison Slots */}
            <div className="col-span-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Slot 1 */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 0)}
                  className={`p-6 rounded-xl border-2 border-dashed min-h-[200px] transition-all ${selectedSequences[0]
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                >
                  {selectedSequences[0] ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm text-gray-700 dark:text-gray-300">Sequence 1</h4>
                        <button
                          onClick={() => {
                            const newSelected = [...selectedSequences];
                            newSelected[0] = null;
                            setSelectedSequences(newSelected);
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedSequences[0].sequenceName}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">Length:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[0].sequenceLength} bp</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">GC:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[0].gcPercentage}%</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">ORFs:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[0].orfs.length}</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">A:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[0].nucleotideCounts.A}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Icons.Upload className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Drag a sequence here
                      </p>
                    </div>
                  )}
                </div>

                {/* Slot 2 */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 1)}
                  className={`p-6 rounded-xl border-2 border-dashed min-h-[200px] transition-all ${selectedSequences[1]
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                >
                  {selectedSequences[1] ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm text-gray-700 dark:text-gray-300">Sequence 2</h4>
                        <button
                          onClick={() => {
                            const newSelected = [...selectedSequences];
                            newSelected[1] = null;
                            setSelectedSequences(newSelected);
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedSequences[1].sequenceName}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">Length:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[1].sequenceLength} bp</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">GC:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[1].gcPercentage}%</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">ORFs:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[1].orfs.length}</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">T:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[1].nucleotideCounts.T}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Icons.Upload className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Drag a sequence here
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Comparison Results */}
              {comparison && (
                <div className="space-y-6">
                  {/* Header with Quality Badge */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Detailed Comparison Report</h4>
                    <div className={`px-4 py-2 rounded-lg font-semibold ${comparison.alignmentQuality === 'Excellent' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      comparison.alignmentQuality === 'Good' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        comparison.alignmentQuality === 'Moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                      {comparison.alignmentQuality} Quality
                    </div>
                  </div>

                  {/* Primary Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sequence Similarity</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{comparison.similarity.toFixed(1)}%</p>
                      <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                          style={{ width: `${comparison.similarity}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Mutations</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{comparison.mutations.total}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comparison.mutations.rate}% mutation rate
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Length Difference</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{comparison.lengthDiff}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">base pairs</p>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">GC Content Diff</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{comparison.gcDiff.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comparison.gcDiff < 5 ? 'Similar' : 'Notable'}
                      </p>
                    </div>
                  </div>

                  {/* Mutation Analysis */}
                  <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Icons.Activity className="w-4 h-4" />
                      Mutation Analysis
                    </h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Transitions</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{comparison.mutations.transitions}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A↔G, C↔T</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Transversions</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{comparison.mutations.transversions}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Other changes</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ti/Tv Ratio</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{comparison.mutations.tiTvRatio}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quality metric</p>
                      </div>
                    </div>
                  </div>

                  {/* Nucleotide Composition Differences */}
                  <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Nucleotide Composition Differences</h5>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <span className="text-2xl font-bold text-green-700 dark:text-green-400">A</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-semibold">{comparison.nucleotideDiff.A}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">difference</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <span className="text-2xl font-bold text-red-700 dark:text-red-400">T</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-semibold">{comparison.nucleotideDiff.T}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">difference</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">G</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-semibold">{comparison.nucleotideDiff.G}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">difference</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">C</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-semibold">{comparison.nucleotideDiff.C}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">difference</p>
                      </div>
                    </div>
                  </div>

                  {/* Biological Interpretation */}
                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Icons.Info className="w-4 h-4" />
                      Biological Interpretation
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comparison.interpretation}</p>
                  </div>

                  {/* Recommendations */}
                  <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h5>
                    <ul className="space-y-2">
                      {comparison.similarity >= 95 && (
                        <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          Sequences are highly conserved - suitable for phylogenetic analysis
                        </li>
                      )}
                      {comparison.mutations.total > 50 && (
                        <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">⚠</span>
                          High mutation count detected - consider selective pressure analysis
                        </li>
                      )}
                      <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        Perform BLAST search to identify sequence origins
                      </li>
                      <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        Consider multiple sequence alignment with related sequences
                      </li>
                      {comparison.orfDiff > 0 && (
                        <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">!</span>
                          ORF count differs - investigate functional implications
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
