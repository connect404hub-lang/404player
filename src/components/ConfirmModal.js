'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '@/lib/store';
import { AlertTriangle, Terminal, X } from 'lucide-react';

export default function ConfirmModal() {
  const { confirmModal, closeConfirmModal } = usePlayer();

  const handleConfirm = useCallback(() => {
    if (confirmModal?.onConfirm) {
      confirmModal.onConfirm();
    }
    // Haptic feedback on confirm
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(80);
    }
    closeConfirmModal();
  }, [confirmModal, closeConfirmModal]);

  const handleCancel = useCallback(() => {
    closeConfirmModal();
  }, [closeConfirmModal]);

  // Keyboard bindings
  useEffect(() => {
    if (!confirmModal?.isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModal?.isOpen, handleConfirm, handleCancel]);

  const isDestructive = confirmModal?.variant === 'destructive';

  return (
    <AnimatePresence>
      {confirmModal?.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] flex items-center justify-center p-4 font-mono select-none"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-effect rounded-xl w-full max-w-sm overflow-hidden"
          >
            {/* Terminal-style header */}
            <div className="h-10 bg-bg-tertiary border-b border-border-color px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={12} className={isDestructive ? 'text-red-400' : 'text-accent'} />
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  {"// confirm_action.sh"}
                </span>
              </div>
              <button
                onClick={handleCancel}
                className="p-0.5 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDestructive 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                    : 'bg-accent/10 border border-accent/30 text-accent'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-sm font-bold text-text-primary">
                    {confirmModal?.title || 'Confirm Action'}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {confirmModal?.message || 'Are you sure you want to proceed?'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 justify-end pt-1">
                <button
                  onClick={handleCancel}
                  className="px-3.5 py-1.5 border border-border-color text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/40 rounded text-xs font-semibold cursor-pointer transition-all"
                >
                  Abort (Esc)
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-3.5 py-1.5 rounded text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                    isDestructive
                      ? 'bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25'
                      : 'bg-accent text-bg-primary hover:bg-accent/90 shadow-[0_0_10px_var(--accent-glow)]'
                  }`}
                >
                  {confirmModal?.confirmLabel || 'Confirm (Enter)'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
