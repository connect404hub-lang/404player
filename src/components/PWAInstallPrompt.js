'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Download, Share, PlusSquare, ArrowUpRight, Cpu } from 'lucide-react';

export default function PWAInstallPrompt() {
  const { isInstallable, isStandalone, isIOS, triggerPwaInstall } = usePlayer();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isStandalone) {
      setShowPrompt(false);
      return;
    }

    // Check if dismissed recently (within last 7 days)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const diff = Date.now() - parseInt(dismissedAt, 10);
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Check if running on a mobile device (user-agent based)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /mobi|android|iphone|ipad|ipod|webos|iemobile|blackberry/i.test(userAgent);
    if (!isMobileDevice) return;

    if (isInstallable) {
      setShowPrompt(true);
    } else if (isIOS) {
      // Delayed prompt for better user experience on iOS Safari
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isStandalone, isIOS]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  }, []);

  const handleInstall = useCallback(async () => {
    await triggerPwaInstall();
    setShowPrompt(false);
  }, [triggerPwaInstall]);

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99] flex items-center justify-center p-4 font-mono select-none"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-bg-secondary border border-border-color rounded-xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative"
        >
          {/* Neon border decoration */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/0 via-accent/80 to-accent/0 shadow-[0_0_10px_var(--accent)]" />

          {/* Terminal Header */}
          <div className="h-11 bg-bg-tertiary border-b border-border-color px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-accent animate-pulse" />
              <span className="text-[11px] text-text-secondary uppercase tracking-widest font-bold">
                {"// install_404player.sh"}
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded text-text-secondary hover:text-red-400 hover:bg-white/[0.03] transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-5">
            {/* Logo/Icon with Neon Ring */}
            <div className="flex justify-center py-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-accent/15 blur-xl animate-pulse" />
                <div className="w-16 h-16 rounded-2xl border-2 border-accent/40 bg-bg-primary flex items-center justify-center relative shadow-[0_0_20px_rgba(0,255,179,0.15)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5" />
                  <Cpu className="text-accent w-8 h-8 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="text-center flex flex-col gap-1.5">
              <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">
                Install 404 Player
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                Add 404 Player to your home screen for an app-like experience, offline capabilities, and instant loading.
              </p>
            </div>

            {/* System Info Box */}
            <div className="bg-bg-tertiary/60 border border-white/[0.03] rounded-lg p-3 text-[10px] text-text-secondary flex flex-col gap-1.5 font-mono">
              <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                <span>[ENV]: LOCALHOST_CLIENT</span>
                <span className="text-accent font-bold">READY</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                <span>[OFFLINE]: SW_CACHING_ACTIVE</span>
                <span className="text-accent">TRUE</span>
              </div>
              <div className="flex justify-between">
                <span>[SIZE]: MINIMAL_DISK_USAGE</span>
                <span>~250 KB</span>
              </div>
            </div>

            {/* iOS specific installation steps */}
            {isIOS ? (
              <div className="flex flex-col gap-3 p-3 bg-accent/5 border border-accent/15 rounded-lg text-xs">
                <div className="font-semibold text-accent flex items-center gap-1.5">
                  <Share size={14} /> iOS Installation Instructions:
                </div>
                <ol className="list-decimal list-inside flex flex-col gap-1.5 text-text-secondary text-[11px] leading-relaxed">
                  <li>
                    Tap the <strong className="text-text-primary">Share</strong> button in Safari (at the bottom/top navigation bar).
                  </li>
                  <li>
                    Scroll down and tap <strong className="text-text-primary">Add to Home Screen</strong> <PlusSquare size={12} className="inline-block align-text-bottom mx-0.5 text-accent" />.
                  </li>
                  <li>
                    Tap <strong className="text-text-primary">Add</strong> in the top right to complete installation.
                  </li>
                </ol>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end pt-1">
              <button
                onClick={handleDismiss}
                className="flex-1 sm:flex-none px-4 py-2 border border-border-color text-text-secondary hover:text-text-primary hover:bg-white/[0.02] rounded-lg text-xs font-semibold cursor-pointer transition-all"
              >
                Abort
              </button>
              
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="flex-1 sm:flex-none px-4 py-2 bg-accent text-bg-primary hover:bg-accent/90 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_var(--accent-glow)]"
                >
                  <Download size={14} /> Run Installer
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
