/**
 * SequenceAnnotation Component
 * 
 * Allows users to view and annotate regions of DNA sequences
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Icons } from './Icons';
import {
  getAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  exportAnnotationsGFF3,
  ANNOTATION_COLORS,
  ANNOTATION_TYPES,
} from '../utils/annotationApi.js';

export function SequenceAnnotation({ sequence, sequenceId, onClose }) {
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    type: 'custom',
    color: '#8b5cf6',
    strand: '+',
  });

  const sequenceRef = useRef(null);
  const selectionStart = useRef(null);

  // Fetch existing annotations
  useEffect(() => {
    if (sequenceId) {
      loadAnnotations();
    }
  }, [sequenceId]);

  const loadAnnotations = async () => {
    try {
      setLoading(true);
      const data = await getAnnotations(sequenceId);
      setAnnotations(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle mouse selection on sequence
  const handleMouseDown = (e) => {
    const element = e.target;
    if (element.dataset.position !== undefined) {
      selectionStart.current = parseInt(element.dataset.position);
    }
  };

  const handleMouseUp = (e) => {
    const element = e.target;
    if (selectionStart.current !== null && element.dataset.position !== undefined) {
      const endPos = parseInt(element.dataset.position);
      const start = Math.min(selectionStart.current, endPos);
      const end = Math.max(selectionStart.current, endPos);
      
      if (start !== end || true) { // Allow single nucleotide selection
        setSelection({ start, end });
        setShowForm(true);
        setEditingId(null);
        setFormData({
          label: '',
          description: '',
          type: 'custom',
          color: ANNOTATION_COLORS.custom,
          strand: '+',
        });
      }
    }
    selectionStart.current = null;
  };

  // Submit new annotation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.label.trim()) {
      toast.error('Please enter a label');
      return;
    }

    try {
      if (editingId) {
        // Update existing
        const updated = await updateAnnotation(editingId, formData);
        setAnnotations(prev => prev.map(a => a._id === editingId ? updated : a));
        toast.success('Annotation updated');
      } else {
        // Create new
        const newAnnotation = await createAnnotation({
          sequenceId,
          startPosition: selection.start,
          endPosition: selection.end,
          ...formData,
        });
        setAnnotations(prev => [...prev, newAnnotation].sort((a, b) => a.startPosition - b.startPosition));
        toast.success('Annotation created');
      }
      
      setShowForm(false);
      setSelection(null);
      setEditingId(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Edit annotation
  const handleEdit = (annotation) => {
    setEditingId(annotation._id);
    setSelection({ start: annotation.startPosition, end: annotation.endPosition });
    setFormData({
      label: annotation.label,
      description: annotation.description || '',
      type: annotation.type,
      color: annotation.color,
      strand: annotation.strand,
    });
    setShowForm(true);
  };

  // Delete annotation
  const handleDelete = async (id) => {
    try {
      await deleteAnnotation(id);
      setAnnotations(prev => prev.filter(a => a._id !== id));
      toast.success('Annotation deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Export as GFF3
  const handleExport = async () => {
    try {
      const gff3 = await exportAnnotationsGFF3(sequenceId);
      const blob = new Blob([gff3], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotations_${sequence?.name || 'sequence'}.gff3`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Annotations exported as GFF3');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Render sequence with highlighting
  const renderSequence = useCallback(() => {
    const seq = sequence?.rawSequence || sequence?.sequence || '';
    if (!seq) return null;

    const chars = seq.split('');
    const highlights = new Map();

    // Map positions to annotations
    annotations.forEach(ann => {
      for (let i = ann.startPosition; i <= ann.endPosition; i++) {
        if (!highlights.has(i)) {
          highlights.set(i, []);
        }
        highlights.get(i).push(ann);
      }
    });

    // Add current selection
    if (selection) {
      for (let i = selection.start; i <= selection.end; i++) {
        if (!highlights.has(i)) {
          highlights.set(i, []);
        }
        highlights.get(i).push({ _id: 'selection', color: '#fbbf24', label: 'Selection' });
      }
    }

    return chars.map((char, index) => {
      const annList = highlights.get(index) || [];
      const hasAnnotation = annList.length > 0;
      const topAnn = annList[0];

      return (
        <span
          key={index}
          data-position={index}
          className={`cursor-pointer select-none font-mono text-sm transition-colors ${
            hasAnnotation 
              ? 'text-white font-bold rounded-sm' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
          }`}
          style={{
            backgroundColor: hasAnnotation ? topAnn.color : undefined,
            ...(annList.length > 1 && { 
              boxShadow: `0 2px 0 ${annList[1].color}` 
            }),
          }}
          title={hasAnnotation ? `${topAnn.label} (${index})` : `Position ${index}`}
        >
          {char}
        </span>
      );
    });
  }, [sequence, annotations, selection]);

  // Group sequence into lines of 60 characters
  const renderSequenceLines = useCallback(() => {
    const seq = sequence?.rawSequence || sequence?.sequence || '';
    const lineLength = 60;
    const lines = [];
    
    for (let i = 0; i < seq.length; i += lineLength) {
      lines.push({ start: i, end: Math.min(i + lineLength - 1, seq.length - 1) });
    }

    return lines.map((line, idx) => (
      <div key={idx} className="flex items-start gap-2 py-1">
        <span className="text-xs text-gray-400 w-12 text-right flex-shrink-0 font-mono">
          {line.start + 1}
        </span>
        <div 
          className="flex flex-wrap"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {renderSequence().slice(line.start, line.end + 1)}
        </div>
      </div>
    ));
  }, [renderSequence]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Sequence Annotations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sequence?.name || 'Sequence'} • {sequence?.rawSequence?.length || sequence?.sequence?.length || 0} bp
            </p>
          </div>
          <div className="flex items-center gap-2">
            {annotations.length > 0 && (
              <button
                onClick={handleExport}
                className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
              >
                <Icons.Download className="w-4 h-4" />
                Export GFF3
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sequence viewer */}
          <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-800/50">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              <Icons.Info className="w-4 h-4 inline mr-2" />
              Click and drag to select a region to annotate
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icons.Loader className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : (
              <div ref={sequenceRef} className="font-mono text-sm leading-relaxed">
                {renderSequenceLines()}
              </div>
            )}
          </div>

          {/* Sidebar - Annotations list */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Annotations ({annotations.length})
              </h3>
            </div>

            <div className="flex-1 overflow-auto p-2 space-y-2">
              {annotations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Icons.Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No annotations yet</p>
                  <p className="text-xs mt-1">Select a region to add one</p>
                </div>
              ) : (
                annotations.map(ann => (
                  <div
                    key={ann._id}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ann.color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {ann.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(ann)}
                          className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                          aria-label="Edit annotation"
                        >
                          <Icons.Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ann._id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete annotation"
                        >
                          <Icons.Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {ann.type} • {ann.startPosition + 1}-{ann.endPosition + 1} ({ann.length} bp)
                    </div>
                    {ann.description && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        {ann.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Annotation form */}
        <AnimatePresence>
          {showForm && selection && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50"
            >
              <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Region
                  </label>
                  <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                    {selection.start + 1} - {selection.end + 1} ({selection.end - selection.start + 1} bp)
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Gene XYZ"
                    required
                  />
                </div>

                <div className="w-40">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        type,
                        color: ANNOTATION_COLORS[type] || prev.color,
                      }));
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {ANNOTATION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  />
                </div>

                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Strand
                  </label>
                  <select
                    value={formData.strand}
                    onChange={(e) => setFormData(prev => ({ ...prev, strand: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="+">+ (Forward)</option>
                    <option value="-">- (Reverse)</option>
                    <option value=".">. (Both)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSelection(null);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {editingId ? 'Update' : 'Add Annotation'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default SequenceAnnotation;
