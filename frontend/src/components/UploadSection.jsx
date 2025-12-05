import { Icons } from './Icons';
import { QuickAccessCards } from './QuickAccessCards';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { parseFastaFile, calculateAggregateStats } from '../utils/fastaParser.js';
import { useScrollAnimation } from '../hooks/useScrollAnimation.js';
import { animeAnimations } from '../utils/animations.js';

export function UploadSection({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const uploadBoxRef = useScrollAnimation('scale-up', 0);

  useEffect(() => {
    if (error) {
      const errorEl = document.querySelector('.error-message');
      if (errorEl) {
        animeAnimations.shake(errorEl);
      }
    }
  }, [error]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.fasta') || file.name.endsWith('.fa'))) {
      processFile(file);
    } else {
      setError('Please upload a valid .fasta or .fa file');
      toast.error('Please upload a valid .fasta or .fa file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    setError(null);
    setIsUploading(true);
    setShowReview(false);

    try {
      const text = await file.text();
      setIsUploading(false);
      setIsParsing(true);

      const sequences = parseFastaFile(text);

      if (sequences.length === 0) {
        throw new Error('No valid sequences found in file');
      }

      const stats = calculateAggregateStats(sequences);

      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        sizeBytes: file.size,
        sequences: sequences.length,
        stats,
      });

      setParsedData(sequences);
      setIsParsing(false);
      setShowReview(true); // Show review UI with accept/reject

      toast.success(`Parsed ${sequences.length} sequence(s) successfully`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'An error occurred');
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  const handleAccept = () => {
    if (onUploadComplete && parsedData) {
      onUploadComplete(parsedData);
      toast.success('File accepted! Navigating to metadata...');
      setShowReview(false);
    }
  };

  const handleReject = () => {
    setUploadedFile(null);
    setParsedData(null);
    setShowReview(false);
    setError(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
    toast.info('File rejected. Upload another file to continue.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Upload FASTA Files
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analyze DNA sequences and generate insights
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12" ref={uploadBoxRef}>
        <div
          className={`relative border-2 border-dashed rounded-xl py-32 px-24 transition-all duration-300 ${isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".fasta,.fa"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={showReview}
          />

          <div className="pointer-events-none flex flex-col items-center">
            <motion.div
              className="w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg"
              animate={{ y: isDragging ? -5 : [0, -8, 0] }}
              transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Icons.Upload className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-gray-900 dark:text-white text-xl font-semibold text-center mb-3">
              Drag & drop your FASTA file
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-center text-base mb-6">
              or click to browse
            </p>

            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              <Icons.File className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Accepts .fasta or .fa files
              </span>
            </div>
          </div>
        </div>

        {/* States */}
        {error && (
          <motion.div className="error-message mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <Icons.AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {isUploading && (
          <motion.div className="mt-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Icons.Loader className="w-4 h-4" />
              </motion.div>
              <span>Reading file...</span>
            </div>
          </motion.div>
        )}

        {isParsing && (
          <div className="mt-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Icons.Loader className="w-4 h-4" />
              </motion.div>
              <span>Parsing sequences...</span>
            </div>
          </div>
        )}

        {/* Review Section with Accept/Reject */}
        <AnimatePresence>
          {showReview && uploadedFile && parsedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Icons.CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      File Parsed Successfully
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review the details and accept or reject
                    </p>
                  </div>
                </div>
              </div>

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Filename</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">File Size</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{uploadedFile.size}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sequences Found</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{parsedData.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Length</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {uploadedFile.stats.totalLength.toLocaleString()} bp
                  </p>
                </div>
              </div>

              {/* Accept/Reject Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleAccept}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Icons.CheckCircle className="w-5 h-5" />
                  Accept & Continue
                </motion.button>
                <motion.button
                  onClick={handleReject}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Icons.X className="w-5 h-5" />
                  Reject & Upload Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Access Cards */}
      <QuickAccessCards />
    </div>
  );
}
