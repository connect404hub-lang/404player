'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '@/lib/store';
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X
} from 'lucide-react';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: {
    border: 'border-accent/40',
    bg: 'bg-accent/5',
    icon: 'text-accent',
    text: 'text-accent',
  },
  error: {
    border: 'border-red-500/40',
    bg: 'bg-red-500/5',
    icon: 'text-red-400',
    text: 'text-red-400',
  },
  info: {
    border: 'border-blue-400/40',
    bg: 'bg-blue-400/5',
    icon: 'text-blue-400',
    text: 'text-blue-400',
  },
  warning: {
    border: 'border-amber-400/40',
    bg: 'bg-amber-400/5',
    icon: 'text-amber-400',
    text: 'text-amber-400',
  },
};

const prefixMap = {
  success: '[OK]',
  error: '[ERR]',
  info: '[INFO]',
  warning: '[WARN]',
};

function ToastItem({ toast, onRemove }) {
  const colors = colorMap[toast.type] || colorMap.info;
  const Icon = iconMap[toast.type] || Info;
  const prefix = prefixMap[toast.type] || '[LOG]';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg border ${colors.border} ${colors.bg} backdrop-blur-md shadow-2xl max-w-sm w-full font-mono select-none cursor-default`}
    >
      <Icon size={15} className={`${colors.icon} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${colors.text} block`}>
          {prefix}
        </span>
        <p className="text-[11px] text-text-primary mt-0.5 leading-snug break-words">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex-shrink-0"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = usePlayer();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 4).map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
