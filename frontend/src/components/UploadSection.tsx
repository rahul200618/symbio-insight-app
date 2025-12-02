import { Icons } from './Icons';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseFastaFile, calculateAggregateStats } from '../utils/fastaParser';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { animeAnimations } from '../utils/animations';
import type { SequenceMetadata } from '../types';

interface UploadSectionProps {
  onUploadComplete?: (sequences: SequenceMetadata[]) => void;
}

export function UploadSection({ onUploadComplete }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<SequenceMetadata[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const uploadBoxRef = useScrollAnimation('scale-up', 0);
  const statsRef = useScrollAnimation('fade-in', 200);

  useEffect(() => {
    if (error) {
      const errorEl = document.querySelector('.error-message');
      if (errorEl) {
        animeAnimations.shake(errorEl as HTMLElement);
      }
    }
  }, [error]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.fasta') || file.name.endsWith('.fa'))) {
      processFile(file);
    } else {
      setError('Please upload a valid .fasta or .fa file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    
    try {
      // Read file content
      const text = await file.text();
      
      setIsUploading(false);
      setIsParsing(true);
      
      // Parse FASTA file and extract metadata
      const sequences = parseFastaFile(text);
      
      if (sequences.length === 0) {
        throw new Error('No valid sequences found in file');
      }
      
      // Calculate aggregate stats
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
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(sequences);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing file');
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  const handleAnalyze = () => {
    if (parsedData && onUploadComplete) {
      onUploadComplete(parsedData);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-8">
        {/* Upload Area */}
        {!uploadedFile && (
        <motion.div
          ref={uploadBoxRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-900/20 scale-105'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 hover:border-purple-300'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: isDragging ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <input
            type="file"
            accept=".fasta,.fa"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="pointer-events-none">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg"
              animate={{
                y: [0, -10, 0],
                rotate: isDragging ? [0, 10, -10, 0] : 0,
              }}
              transition={{
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 0.5 },
              }}
            >
              <Icons.Upload className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              className="text-gray-900 dark:text-white mb-2"
              animate={{ scale: isDragging ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {isDragging ? 'Drop your file here' : 'Drag & drop your FASTA file'}
            </motion.h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Icons.File className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Accepts .fasta or .fa files</span>
            </div>
          </div>
        </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="error-message mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-center gap-3">
              <Icons.AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Uploading State */}
        {isUploading && (
          <motion.div
            className="mt-6 p-6 rounded-xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Icons.Upload className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white mb-2">Reading file...</p>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Parsing State */}
        {isParsing && (
          <div className="mt-6 p-6 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse shadow-sm">
                <Icons.Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white mb-2">Parsing FASTA & extracting metadata...</p>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Uploaded File Preview */}
        {uploadedFile && !isUploading && !isParsing && parsedData && (
          <div className="mt-6 p-6 rounded-xl bg-green-50/50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Icons.CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-gray-900 dark:text-white">✅ File parsed successfully!</p>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                    <span className="text-gray-900 dark:text-gray-100 truncate ml-2">{uploadedFile.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Size:</span>
                    <span className="text-gray-900 dark:text-gray-100">{uploadedFile.size}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Sequences Parsed:</span>
                    <span className="text-gray-900 dark:text-gray-100">{uploadedFile.sequences}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Total ORFs Detected:</span>
                    <span className="text-gray-900 dark:text-gray-100">{uploadedFile.stats?.totalORFs || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Average GC Content:</span>
                    <span className="text-gray-900 dark:text-gray-100">{uploadedFile.stats?.avgGC || 0}%</span>
                  </div>
                  
                  {/* Metadata Preview */}
                  <div className="mt-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">📊 Extracted Metadata:</p>
                    <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300 font-mono">
                      <div>✓ Sequence names extracted</div>
                      <div>✓ Sequence lengths calculated</div>
                      <div>✓ GC percentages computed</div>
                      <div>✓ Nucleotide counts (A, T, G, C)</div>
                      <div>✓ ORF detection completed</div>
                      <div>✓ Unique IDs generated</div>
                      <div>✓ Timestamps recorded</div>
                    </div>
                  </div>

                  {/* First sequence preview */}
                  {parsedData[0] && (
                    <div className="mt-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sample Sequence (first):</p>
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400">Name:</span> {parsedData[0].name.substring(0, 50)}...</div>
                        <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400">Length:</span> {parsedData[0].length} bp</div>
                        <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400">GC%:</span> {parsedData[0].gcContent}%</div>
                        <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400">ORFs:</span> {parsedData[0].orfs.length} found</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Icons.Activity className="w-5 h-5" />
              <span>View Analysis Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
