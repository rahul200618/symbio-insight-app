import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './Icons';
import { toast } from 'sonner';
import { 
  getStorageStatus, 
  connectStorage, 
  disconnectStorage, 
  saveSequencesToStorage 
} from '../utils/sequenceApi.js';

export function StorageOptions({ sequences, onSaveComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState({ isConnected: false, connectionType: 'none' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch storage status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const result = await getStorageStatus();
      setStatus(result);
    } catch (error) {
      console.log('Storage status check failed (backend may not be running)');
    }
  };

  const handleConnect = async (type) => {
    setLoading(true);
    try {
      const result = await connectStorage(type);
      if (result.success) {
        toast.success(`Connected to MongoDB (${type})`);
        setStatus({ isConnected: true, connectionType: type });
      } else {
        toast.error(result.error || 'Connection failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectStorage();
      toast.success('Disconnected from MongoDB');
      setStatus({ isConnected: false, connectionType: 'none' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (storageType) => {
    if (!sequences || sequences.length === 0) {
      toast.error('No sequences to save');
      return;
    }

    setSaving(true);
    try {
      const result = await saveSequencesToStorage(sequences, storageType);
      if (result.success) {
        toast.success(`Saved ${result.savedCount} sequence(s) to ${storageType}`);
        if (onSaveComplete) onSaveComplete(result);
      } else {
        toast.error(result.error || 'Save failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          status.isConnected 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        } hover:shadow-md`}
      >
        <Icons.Database className="w-4 h-4" />
        <span className="text-sm font-medium">
          {status.isConnected ? `${status.connectionType.toUpperCase()}` : 'Storage'}
        </span>
        <Icons.ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.Database className="w-5 h-5 text-purple-600" />
                Storage Options
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Save sequences to local MongoDB or cloud Atlas
              </p>
            </div>

            {/* Connection Status */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  status.isConnected ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    status.isConnected ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  {status.isConnected ? `Connected (${status.connectionType})` : 'Not connected'}
                </span>
              </div>
            </div>

            {/* Connection Options */}
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Connect to:</p>
              
              {/* Local MongoDB */}
              <button
                onClick={() => handleConnect('local')}
                disabled={loading || (status.isConnected && status.connectionType === 'local')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  status.connectionType === 'local'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                } disabled:opacity-50`}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Icons.Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Local MongoDB</p>
                  <p className="text-xs text-gray-500">localhost:27017</p>
                </div>
                {status.connectionType === 'local' && (
                  <Icons.CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </button>

              {/* MongoDB Atlas */}
              <button
                onClick={() => handleConnect('atlas')}
                disabled={loading || (status.isConnected && status.connectionType === 'atlas')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  status.connectionType === 'atlas'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                } disabled:opacity-50`}
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Icons.Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">MongoDB Atlas</p>
                  <p className="text-xs text-gray-500">Cloud Database</p>
                </div>
                {status.connectionType === 'atlas' && (
                  <Icons.CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </button>

              {/* Disconnect Button */}
              {status.isConnected && (
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full text-center text-sm text-red-600 hover:text-red-700 py-2"
                >
                  Disconnect
                </button>
              )}
            </div>

            {/* Save Options */}
            {sequences && sequences.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-3">
                  Save {sequences.length} sequence(s) to:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave('local')}
                    disabled={saving}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Icons.Server className="w-4 h-4" />
                    Local
                  </button>
                  <button
                    onClick={() => handleSave('atlas')}
                    disabled={saving}
                    className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Icons.Cloud className="w-4 h-4" />
                    Atlas
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
