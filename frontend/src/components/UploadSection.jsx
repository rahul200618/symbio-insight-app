import { Icons } from './Icons';
import { QuickAccessCards } from './QuickAccessCards';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { parseFastaFile, calculateAggregateStats } from '../utils/fastaParser.js';
import { uploadSequenceFile, createSequenceFromText } from '../utils/sequenceApi.js';
import { useScrollAnimation } from '../hooks/useScrollAnimation.js';
import { animeAnimations } from '../utils/animations.js';
import { useNotifications } from '../context/NotificationContext';
import { Card3D, Button3D, Floating3D, Icon3D } from './3DComponents';
import { calculateTilt } from '../utils/3dMotion';

export function UploadSection({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [sequenceText, setSequenceText] = useState('');
  const [uploadBoxTilt, setUploadBoxTilt] = useState({ rotateX: 0, rotateY: 0 });
  
  // Notifications
  const { notifyUploadComplete, notifyAnalysisComplete } = useNotifications();

  const uploadBoxRef = useScrollAnimation('scale-up', 0);
  const dragBoxRef = useRef(null);

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
    
    // Calculate tilt based on drag position
    if (dragBoxRef.current) {
      const tilt = calculateTilt(e, dragBoxRef.current, 5);
      setUploadBoxTilt(tilt);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    setUploadBoxTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadBoxTilt({ rotateX: 0, rotateY: 0 });

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
        file: file, // Store the file object for backend upload
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

  // Parse sequence from text input
  const handleParseSequence = () => {
    if (sequenceText.trim()) {
      const sequences = parseFastaFile(sequenceText);
      if (sequences.length > 0) {
        const stats = calculateAggregateStats(sequences);
        setUploadedFile({
          name: 'Pasted Sequence',
          size: (sequenceText.length / 1024).toFixed(2) + ' KB',
          sizeBytes: sequenceText.length,
          sequences: sequences.length,
          stats,
          file: null,
          rawText: sequenceText, // Store raw text for .fasta download
        });
        setParsedData(sequences);
        setShowReview(true);
        setShowTextInput(false);
        toast.success(`Parsed ${sequences.length} sequence(s) successfully`);
      } else {
        toast.error('Could not parse sequence. Check the format.');
      }
    }
  };

  // Download parsed sequences as .fasta file
  const downloadAsFasta = () => {
    if (!parsedData || parsedData.length === 0) return;
    
    let fastaContent = '';
    parsedData.forEach(seq => {
      const header = seq.sequenceName || seq.name || 'Sequence';
      const rawSeq = seq.rawSequence || '';
      // Format sequence with 80 characters per line
      const formattedSeq = rawSeq.match(/.{1,80}/g)?.join('\n') || rawSeq;
      fastaContent += `>${header}\n${formattedSeq}\n`;
    });
    
    const blob = new Blob([fastaContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sequences_${Date.now()}.fasta`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded as .fasta file');
  };

  const handleAccept = async () => {
    if (!parsedData || !uploadedFile) return;

    try {
      const parser = localStorage.getItem('fasta_parser_preference') || 'js';

      let createdSequences = [];

      if (uploadedFile.file) {
        // File upload flow -> persists to /api/sequences/upload
        toast.loading('Uploading to server...', { id: 'upload-backend' });

        const result = await uploadSequenceFile(uploadedFile.file, parser);
        createdSequences = Array.isArray(result) ? result : [result];

        toast.success('File uploaded successfully!', { id: 'upload-backend' });
        notifyUploadComplete(uploadedFile.name, createdSequences.length || parsedData.length);
      } else if (sequenceText.trim()) {
        // Pasted FASTA flow -> persists via POST /api/sequences
        toast.loading('Saving sequence...', { id: 'upload-backend' });

        // Ensure we send the raw FASTA text; backend will parse and store
        const result = await createSequenceFromText(sequenceText, uploadedFile.name || 'Pasted Sequence', 'Pasted via UI');
        createdSequences = Array.isArray(result) ? result : [result];

        toast.success('Sequence saved successfully!', { id: 'upload-backend' });
        notifyUploadComplete('Pasted Sequence', createdSequences.length || parsedData.length);
      }

      // Call the onUploadComplete with the frontend-parsed data (which has correct calculations)
      // The backend response is only for confirmation; we use parsedData which was parsed by the accurate JS parser
      if (onUploadComplete && parsedData && parsedData.length > 0) {
        onUploadComplete(parsedData);
      }
      
      // Notify that analysis is ready
      setTimeout(() => {
        notifyAnalysisComplete(uploadedFile.name || 'Pasted Sequence');
      }, 1000);

      setShowReview(false);

      // Reset the form
      setTimeout(() => {
        setUploadedFile(null);
        setParsedData(null);
        setSequenceText('');
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = '';
        }
      }, 500);

    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Upload failed: ${err.message}`, { id: 'upload-backend' });
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
    <div className="space-y-6" role="main" aria-label="FASTA file upload section">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Upload FASTA Files
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analyze DNA sequences and generate insights
        </p>
      </header>

      {/* Upload Box with 3D Effect */}
      <section ref={uploadBoxRef} aria-labelledby="upload-section-heading">
        <h2 id="upload-section-heading" className="sr-only">File upload area</h2>
        <Card3D
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12"
          glowColor="rgba(139, 92, 246, 0.4)"
          maxTilt={3}
        >
          <motion.div
            ref={dragBoxRef}
            className={`relative border-2 border-dashed rounded-xl py-32 px-24 transition-all duration-300 ${isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="region"
            aria-label="Drag and drop zone for FASTA files"
            aria-describedby="upload-instructions"
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
            animate={{
              rotateX: uploadBoxTilt.rotateX,
              rotateY: uploadBoxTilt.rotateY,
              scale: isDragging ? 1.02 : 1,
              boxShadow: isDragging
                ? '0 30px 60px -15px rgba(139, 92, 246, 0.5)'
                : '0 0px 0px rgba(0, 0, 0, 0)'
            }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 15
            }}
          >
            <input
              type="file"
              accept=".fasta,.fa"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={showReview}
              aria-label="Choose FASTA file to upload"
              id="fasta-file-input"
            />

            <div className="pointer-events-none flex flex-col items-center">
              <Floating3D delay={0} duration={2.5} intensity={8}>
                <Icon3D rotationDegrees={isDragging ? 0 : 20}>
                  <motion.div
                    className="w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl relative"
                    animate={{
                      scale: isDragging ? 1.15 : 1,
                      rotate: isDragging ? [0, 5, -5, 0] : 0
                    }}
                    transition={{
                      duration: isDragging ? 0.5 : 0,
                      rotate: { repeat: isDragging ? Infinity : 0 }
                    }}
                    aria-hidden="true"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-purple-400 blur-2xl"
                      animate={{
                        opacity: isDragging ? [0.5, 0.8, 0.5] : 0.3,
                        scale: isDragging ? [1, 1.2, 1] : 1
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <Icons.Upload className="w-10 h-10 text-white relative z-10" aria-hidden="true" />
                  </motion.div>
                </Icon3D>
              </Floating3D>

              <h3 className="text-gray-900 dark:text-white text-xl font-semibold text-center mb-3" id="upload-instructions">
                Drag & drop your FASTA file
              </h3>

              <p className="text-gray-500 dark:text-gray-400 text-center text-base mb-6">
                or click to browse
              </p>

              <motion.div
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md backdrop-blur-sm"
                role="note"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Icons.File className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Accepts .fasta or .fa files
                </span>
              </motion.div>
            </div>
          </motion.div>
        </Card3D>

        {/* Text Input Toggle */}
        <div className="mt-6 text-center">
          <motion.button
            onClick={() => setShowTextInput(!showTextInput)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-md p-1"
            aria-expanded={showTextInput}
            aria-controls="sequence-text-input"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icons.Edit className="w-4 h-4" aria-hidden="true" />
            {showTextInput ? 'Hide text input' : 'Or paste sequence directly'}
          </motion.button>
        </div>

        {/* Text Input Area */}
        <AnimatePresence>
          {showTextInput && (
            <motion.div
              id="sequence-text-input"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paste your FASTA sequence:
                </label>
                <textarea
                  value={sequenceText}
                  onChange={(e) => setSequenceText(e.target.value)}
                  onKeyDown={(e) => {
                    // Ctrl+Enter or Cmd+Enter to submit
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && sequenceText.trim()) {
                      e.preventDefault();
                      handleParseSequence();
                    }
                  }}
                  placeholder={`>Sample_001 Example sequence\nATGCGTATCGATCGTACGATCGTAGCTAGCTAGCGATCGATAGCTAGCTACGATCGATCGTAA`}
                  className="w-full h-40 p-3 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Format: &gt;Header on first line, sequence on following lines (Ctrl+Enter to submit)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSequenceText('');
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleParseSequence}
                      disabled={!sequenceText.trim()}
                      className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                    >
                      <Icons.ChevronRight className="w-4 h-4" />
                      Parse Sequence
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mt-6"
            >
              <Card3D
                className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800"
                glowColor="rgba(34, 197, 94, 0.3)"
                maxTilt={5}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Floating3D duration={2} intensity={3}>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shadow-lg">
                        <Icons.CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </Floating3D>
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

                {/* File Info with 3D Cards */}
                <motion.div 
                  className="grid grid-cols-2 gap-4 mb-6"
                  style={{ perspective: '1000px' }}
                >
                  {[
                    { label: 'Filename', value: uploadedFile.name },
                    { label: 'File Size', value: uploadedFile.size },
                    { label: 'Sequences Found', value: parsedData?.length ?? 0 },
                    { label: 'Total Length', value: `${(uploadedFile?.stats?.totalLength ?? 0).toLocaleString()} bp` }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                      initial={{ opacity: 0, rotateX: -20, y: 20 }}
                      animate={{ opacity: 1, rotateX: 0, y: 0 }}
                      transition={{ delay: index * 0.1, type: 'spring' }}
                      whileHover={{ 
                        scale: 1.03, 
                        rotateY: 3,
                        boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.3)',
                        transition: { type: 'spring', stiffness: 300 }
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Accept/Reject Buttons with 3D Effect */}
                <div className="flex gap-4">
                  <Button3D
                    onClick={handleAccept}
                    variant="success"
                    className="flex-1 py-3 px-6 flex items-center justify-center gap-2"
                  >
                    <Icons.CheckCircle className="w-5 h-5" style={{ color: '#ffffff' }} />
                    <span>Accept & Continue</span>
                  </Button3D>
                  
                  <Button3D
                    onClick={downloadAsFasta}
                    variant="primary"
                    className="py-3 px-6 flex items-center justify-center gap-2"
                    title="Download as .fasta file"
                  >
                    <Icons.Download className="w-5 h-5" style={{ color: '#ffffff' }} />
                    <span>.fasta</span>
                  </Button3D>
                  
                  <Button3D
                    onClick={handleReject}
                    variant="danger"
                    className="flex-1 py-3 px-6 flex items-center justify-center gap-2"
                  >
                    <Icons.X className="w-5 h-5" style={{ color: '#ffffff' }} />
                    <span>Reject</span>
                  </Button3D>
                </div>
              </Card3D>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      {/* Quick Access Cards */}
      <QuickAccessCards />
    </div>
  );
}

