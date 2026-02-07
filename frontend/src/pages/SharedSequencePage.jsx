import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Logo from '../components/Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * SharedSequencePage Component
 * 
 * Public page for viewing shared sequences.
 * No authentication required.
 */
export default function SharedSequencePage() {
    const { token } = useParams();
    
    const [sequence, setSequence] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFullSequence, setShowFullSequence] = useState(false);

    useEffect(() => {
        const fetchSharedSequence = async () => {
            if (!token) {
                setError('No share token provided');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/sequences/shared/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load shared sequence');
                }

                setSequence(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSharedSequence();
    }, [token]);

    // Format sequence with line breaks
    const formatSequence = (seq, lineLength = 60) => {
        if (!seq) return '';
        const lines = [];
        for (let i = 0; i < seq.length; i += lineLength) {
            lines.push(seq.substring(i, i + lineLength));
        }
        return lines.join('\n');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading shared sequence...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Unable to Load Sequence
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error}
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Go to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Sequence view
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="h-8 w-auto" />
                        <div className="hidden sm:block">
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full font-medium">
                                Shared Sequence
                            </span>
                        </div>
                    </div>
                    <Link
                        to="/signup"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        Create Account
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Title Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {sequence.name}
                                </h1>
                                {sequence.header && sequence.header !== sequence.name && (
                                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono text-sm">
                                        {sequence.header}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Shared on {new Date(sequence.createdAt).toLocaleDateString()}
                                    {sequence.viewCount > 0 && ` • ${sequence.viewCount} views`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Public View
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {sequence.length?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Base Pairs</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {(sequence.gcContent || 0).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">GC Content</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {(sequence.atContent || 0).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">AT Content</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {sequence.orfCount || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ORFs Detected</div>
                        </div>
                    </div>

                    {/* Nucleotide Composition */}
                    {sequence.nucleotideCounts && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Nucleotide Composition
                            </h2>
                            <div className="grid grid-cols-4 gap-4">
                                {Object.entries(sequence.nucleotideCounts).map(([nucleotide, count]) => {
                                    const total = Object.values(sequence.nucleotideCounts).reduce((a, b) => a + b, 0);
                                    const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                                    const colors = {
                                        A: 'bg-green-500',
                                        T: 'bg-red-500',
                                        G: 'bg-yellow-500',
                                        C: 'bg-blue-500'
                                    };
                                    return (
                                        <div key={nucleotide} className="text-center">
                                            <div className={`w-12 h-12 ${colors[nucleotide]} rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2`}>
                                                {nucleotide}
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {count.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {percent}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* AI Summary */}
                    {sequence.aiSummary && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-xl">🤖</span> AI Analysis
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {sequence.aiSummary}
                            </p>
                            {sequence.speciesPrediction && (
                                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                        Predicted Species: 
                                    </span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                        {sequence.speciesPrediction}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sequence Display */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Sequence Data
                            </h2>
                            <button
                                onClick={() => setShowFullSequence(!showFullSequence)}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {showFullSequence ? 'Show less' : 'Show full sequence'}
                            </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
                            <pre className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                                {showFullSequence 
                                    ? formatSequence(sequence.sequence)
                                    : (sequence.sequence?.substring(0, 500) || '') + (sequence.sequence?.length > 500 ? '...' : '')
                                }
                            </pre>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {sequence.length?.toLocaleString()} nucleotides total
                        </p>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-center text-white">
                        <h3 className="text-xl font-bold mb-2">
                            Want to analyze your own sequences?
                        </h3>
                        <p className="opacity-90 mb-4">
                            Create a free account to upload, analyze, and share DNA sequences with AI-powered insights.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Sign Up Free
                            </Link>
                            <Link
                                to="/login"
                                className="px-6 py-2 border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors"
                            >
                                Log In
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Powered by SymbioInsight • AI-Powered DNA Sequence Analysis
            </footer>
        </div>
    );
}
