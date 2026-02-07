import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * ShareSequence Component
 * 
 * Modal for generating and managing shareable links for sequences.
 * 
 * @param {Object} props
 * @param {Object} props.sequence - The sequence to share
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 */
export default function ShareSequence({ sequence, isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(false);
    const [shareData, setShareData] = useState(null);
    const [expiresInDays, setExpiresInDays] = useState(7);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    // Fetch current share status when modal opens
    useEffect(() => {
        if (isOpen && sequence) {
            fetchShareStatus();
        }
    }, [isOpen, sequence]);

    const fetchShareStatus = async () => {
        if (!sequence) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('symbio_token');
            const sequenceId = sequence._id || sequence.id;
            
            const response = await fetch(`${API_URL}/sequences/${sequenceId}/share`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setShareData(data);
            }
        } catch (err) {
            console.error('Failed to fetch share status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const generateShareLink = async () => {
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('symbio_token');
            const sequenceId = sequence._id || sequence.id;

            const response = await fetch(`${API_URL}/sequences/${sequenceId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ expiresInDays })
            });

            if (!response.ok) {
                throw new Error('Failed to generate share link');
            }

            const data = await response.json();
            setShareData({
                isShared: true,
                shareUrl: data.shareUrl,
                expiresAt: data.expiresAt,
                viewCount: 0
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const revokeShareLink = async () => {
        if (!confirm('Are you sure you want to revoke this share link? Anyone with the link will no longer be able to access this sequence.')) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('symbio_token');
            const sequenceId = sequence._id || sequence.id;

            const response = await fetch(`${API_URL}/sequences/${sequenceId}/share`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to revoke share link');
            }

            setShareData({ isShared: false });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!shareData?.shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareData.shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareData.shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Share Sequence
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {sequence?.name || 'Unnamed Sequence'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        ) : shareData?.isShared ? (
                            /* Share link exists */
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Public link active</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Anyone with the link can view this sequence.
                                    </p>
                                </div>

                                {/* Share URL */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Share URL
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={shareData.shareUrl}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 truncate"
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                copied
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {shareData.viewCount || 0}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Total Views
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {shareData.expiresAt === 'Never' 
                                                ? 'Never' 
                                                : new Date(shareData.expiresAt).toLocaleDateString()
                                            }
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Expires
                                        </div>
                                    </div>
                                </div>

                                {/* Revoke Button */}
                                <button
                                    onClick={revokeShareLink}
                                    className="w-full py-2 px-4 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                                >
                                    Revoke Share Link
                                </button>
                            </div>
                        ) : (
                            /* No share link - show creation form */
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Create a public link that anyone can use to view this sequence. 
                                        You can set an expiration time or revoke access at any time.
                                    </p>
                                </div>

                                {/* Expiry Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Link Expiration
                                    </label>
                                    <select
                                        value={expiresInDays}
                                        onChange={(e) => setExpiresInDays(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value={1}>24 hours</option>
                                        <option value={7}>7 days</option>
                                        <option value={30}>30 days</option>
                                        <option value={90}>90 days</option>
                                        <option value={0}>Never expires</option>
                                    </select>
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={generateShareLink}
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Generate Share Link
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
