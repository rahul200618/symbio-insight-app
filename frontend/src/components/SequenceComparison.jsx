import { Icons } from './Icons';
import { useState } from 'react';




export function SequenceComparison({ sequences, onClose }) {
  const [selectedSequences, setSelectedSequences] = useState([null, null]);
  const [draggedItem, setDraggedItem] = useState(null);

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
    const minLength = Math.min(seq1.sequence.length, seq2.sequence.length);
    let matches = 0;
    
    for (let i = 0; i < minLength; i++) {
      if (seq1.sequence[i] === seq2.sequence[i]) {
        matches++;
      }
    }
    
    return (matches / minLength) * 100;
  };

  const compareSequences = () => {
    const [seq1, seq2] = selectedSequences;
    if (!seq1 || !seq2) return null;

    const similarity = calculateSimilarity(seq1, seq2);
    const lengthDiff = Math.abs(seq1.length - seq2.length);
    const gcDiff = Math.abs(seq1.gcContent - seq2.gcContent);

    return {
      similarity,
      lengthDiff,
      gcDiff,
      orfDiff: Math.abs(seq1.orfs.length - seq2.orfs.length),
    };
  };

  const comparison = compareSequences();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          
            <h2 className="text-gray-900 dark:text-white text-xl">Sequence Comparison</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Drag & drop sequences to compare
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all"
          >
            <Icons.X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Sequence List */}
            <div className="col-span-4 space-y-3">
              <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-3">Available Sequences</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {sequences.slice(0, 20).map((seq, index) => (
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
                          {seq.name.substring(0, 30)}...
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {seq.length} bp • GC%
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
                  className={`p-6 rounded-xl border-2 border-dashed min-h-[200px] transition-all ${
                    selectedSequences[0]
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  {selectedSequences[0] ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm text-gray-700 dark:text-gray-300">Sequence A</h4>
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
                          {selectedSequences[0].name}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">Length:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[0].length} bp</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">GC:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[0].gcContent}%</span>
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
                        Drop Sequence A here
                      </p>
                    </div>
                  )}
                </div>

                {/* Slot 2 */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 1)}
                  className={`p-6 rounded-xl border-2 border-dashed min-h-[200px] transition-all ${
                    selectedSequences[1]
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  {selectedSequences[1] ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm text-gray-700 dark:text-gray-300">Sequence B</h4>
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
                          {selectedSequences[1].name}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">Length:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[1].length} bp</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-900 rounded">
                            <span className="text-gray-500 dark:text-gray-400">GC:</span>{' '}
                            <span className="text-gray-900 dark:text-white">{selectedSequences[1].gcContent}%</span>
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
                        Drop Sequence B here
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Results */}
              {comparison && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Icons.Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Comparison Results
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Similarity</p>
                      <p className="text-2xl text-gray-900 dark:text-white">{comparison.similarity.toFixed(1)}%</p>
                      <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                          style={{ width: `${comparison.similarity}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Length Difference</p>
                      <p className="text-2xl text-gray-900 dark:text-white">{comparison.lengthDiff} bp</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comparison.lengthDiff === 0 ? 'Same length' : 'Different lengths'}
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">GC Content Difference</p>
                      <p className="text-2xl text-gray-900 dark:text-white">{comparison.gcDiff.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comparison.gcDiff < 5 ? 'Very similar' : 'Notable difference'}
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ORF Difference</p>
                      <p className="text-2xl text-gray-900 dark:text-white">{comparison.orfDiff}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comparison.orfDiff === 0 ? 'Same ORF count' : 'Different ORF counts'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

