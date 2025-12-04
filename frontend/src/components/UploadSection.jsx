import { Icons } from './Icons';
import { QuickAccessCards } from './QuickAccessCards';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { parseFastaFile, calculateAggregateStats } from '../utils/fastaParser';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { animeAnimations } from '../utils/animations';

export function UploadSection({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

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

      if (onUploadComplete) {
        onUploadComplete(sequences);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsUploading(false);
      setIsParsing(false);
    }
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

      {/* Upload Box - EXACT SIZE */}
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
      </div>

      {/* Quick Access Cards */}
      <QuickAccessCards />
    </div>
  );
}
