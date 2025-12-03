import { Icons } from './Icons';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { parseFastaFile, calculateAggregateStats } from '../utils/fastaParser';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { animeAnimations } from '../utils/animations';

export function UploadSection({ onUploadComplete }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  
  const uploadBoxRef = useScrollAnimation('scale-up', 0);
  const statsRef = useScrollAnimation('fade-in', 200);

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
        name,
        size).toFixed(2) + ' KB',
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
      setError(err instanceof Error ? err.message);
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
    <div className="bg-white dark, scale, scale, transition,.fa"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="pointer-events-none">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg"
              animate={{
                y, -10, 0],
                rotate, 10, -10, 0] ,
              }}
              transition={{
                y, repeat, ease,
                rotate,
              }}
            >
              <Icons.Upload className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              className="text-gray-900 dark)}

        {/* Error Message */}
        {error && (
          <motion.div
            className="error-message mt-6 p-4 rounded-lg bg-red-50 dark, x, x, x)}

        {/* Uploading State */}
        {isUploading && (
          <motion.div
            className="mt-6 p-6 rounded-xl bg-purple-50/50 dark, y, y, repeat, ease)}

        {/* Parsing State */}
        {isParsing && (
          <div className="mt-6 p-6 rounded-xl bg-indigo-50/50 dark)}

        {/* Uploaded File Preview */}
        {uploadedFile && !isUploading && !isParsing && parsedData && (
          <div className="mt-6 p-6 rounded-xl bg-green-50/50 dark, T, G, C)</div>
                      <div>✓ ORF detection completed
                      <div>✓ Unique IDs generated
                      <div>✓ Timestamps recorded
                    </div>
                  </div>

                  {/* First sequence preview */}
                  {parsedData[0] && (
                    <div className="mt-3 p-3 bg-white/80 dark)>
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400">Name:</span> {parsedData[0].sequenceName.substring(0, 50)}...</div>
                        <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400">Length:</span> {parsedData[0].sequenceLength} bp
                        <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400">GC%:</span> {parsedData[0].gcPercentage}%</div>
                        <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400">ORFs:</span> {parsedData[0].orfs.length} found
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
              <span>View Analysis Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
