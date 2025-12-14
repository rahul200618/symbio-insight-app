import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './Icons';

/**
 * A custom confirm dialog to replace browser's native confirm()
 * Usage: 
 * const [showConfirm, setShowConfirm] = useState(false);
 * <ConfirmDialog 
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={() => { handleDelete(); setShowConfirm(false); }}
 *   title="Delete File"
 *   message="Are you sure you want to delete this file?"
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   type="danger" // 'danger' | 'warning' | 'info'
 * />
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
}) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: Icons.Trash,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmText: 'text-white',
    },
    warning: {
      icon: Icons.AlertCircle,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
      confirmText: 'text-white',
    },
    info: {
      icon: Icons.Info,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      confirmText: 'text-white',
    },
  };

  const style = typeStyles[type] || typeStyles.info;
  const IconComponent = style.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101]"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${style.iconColor}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: type === 'danger' ? '#dc2626' : type === 'warning' ? '#d97706' : '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = type === 'danger' ? '#b91c1c' : type === 'warning' ? '#b45309' : '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = type === 'danger' ? '#dc2626' : type === 'warning' ? '#d97706' : '#2563eb'}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook for easier confirm dialog usage
 */
import { useState, useCallback } from 'react';

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {},
  });

  const showConfirm = useCallback(({ title, message, type = 'danger', onConfirm }) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    dialogState.onConfirm();
    closeConfirm();
  }, [dialogState.onConfirm, closeConfirm]);

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      onClose={closeConfirm}
      onConfirm={handleConfirm}
      title={dialogState.title}
      message={dialogState.message}
      type={dialogState.type}
    />
  );

  return { showConfirm, closeConfirm, ConfirmDialogComponent };
}
