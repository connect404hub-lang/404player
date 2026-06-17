'use client';

import React from 'react';
import { usePlayer } from '@/lib/store';
import Sidebar from './Sidebar';
import CodeTerminal from './CodeTerminal';
import AudioPlayer from './AudioPlayer';
import RetroGrid from './RetroGrid';
import ToastContainer from './Toast';
import ConfirmModal from './ConfirmModal';

export default function AppShell({ children }) {
  const { showTerminal } = usePlayer();

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-bg-primary text-text-primary relative select-none font-mono">
      {/* Visual Background Layers */}
      <RetroGrid />
      <div className="scanline" />

      {/* Sidebar Navigation */}
      <Sidebar />

      <div className="flex flex-1 flex-col h-full overflow-hidden relative z-10">
        {/* Top Header / Status Bar */}
        <header className="h-10 border-b border-white/[0.04] px-6 flex items-center justify-between bg-bg-primary/50 backdrop-blur-md">
          <div className="flex items-center gap-4 text-[10px] text-white/35 tracking-widest font-bold">
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
          <div className="w-full p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* Terminal Overlay */}
        {showTerminal && <CodeTerminal />}

        {/* Player bar is fixed at the very bottom */}
        <AudioPlayer />
      </div>

      <ToastContainer />
      <ConfirmModal />
    </div>
  );
}
