'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '@/lib/store';
import Sidebar from './Sidebar';
import CodeTerminal from './CodeTerminal';
import AudioPlayer from './AudioPlayer';
import RetroGrid from './RetroGrid';
import ToastContainer from './Toast';
import ConfirmModal from './ConfirmModal';
import PWAInstallPrompt from './PWAInstallPrompt';
import AppTour from './AppTour';
import LanguageOnboardingModal from './LanguageOnboardingModal';

export default function AppShell({ children }) {
  const { showTerminal, theme } = usePlayer();
  const pathname = usePathname();
  const isLiquidGlass = theme?.includes('liquid-glass');

  return (
    <div className="app-shell-container flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-bg-primary text-text-primary relative select-none font-mono">
      {/* Visual Background Layers */}
      <RetroGrid />
      <div className="scanline" />

      {/* Apple-style Liquid Glass Floating Blobs */}
      {isLiquidGlass && (
        <>
          <div className="liquid-blob liquid-blob-1" />
          <div className="liquid-blob liquid-blob-2" />
          <div className="liquid-blob liquid-blob-3" />
        </>
      )}

      {/* Sidebar Navigation */}
      <Sidebar />

      <div className="flex flex-1 flex-col h-full overflow-hidden relative z-10">
        {/* Top Header / Status Bar */}
        <header className="h-10 border-b border-border-color/30 px-6 flex items-center justify-between bg-bg-primary/50 backdrop-blur-md">
          <div className="flex items-center gap-4 text-[10px] text-text-secondary/40 tracking-widest font-bold">
            <span className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
               SYSTEM_ACTIVE
            </span>
            <span className="hidden sm:block">PORT: 8080</span>
          </div>
          <div className="text-[10px] text-accent/60 font-mono">
             DECRYPT_ENGINE_V2.0
          </div>
        </header>

        {/* Main scrollable workspace - Added bottom padding for Player */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[148px] md:pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full p-4 md:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Terminal Overlay */}
        {showTerminal && <CodeTerminal />}

        {/* Player bar is fixed at the very bottom */}
        <AudioPlayer />
      </div>

      <ToastContainer />
      <ConfirmModal />
      <PWAInstallPrompt />
      <AppTour />
      <LanguageOnboardingModal />
    </div>
  );
}
