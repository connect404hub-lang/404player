'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, ArrowUp, ArrowDown, X, Play, Terminal, FileText, ListMusic, Activity
} from 'lucide-react';
import Visualizer from './Visualizer';

export default function CodeTerminal() {
  const { 
    currentSong, queue, setQueue, logs, terminalTab, setTerminalTab, setShowTerminal,
    removeFromQueue, playSong, addLog 
  } = usePlayer();

  const [lyrics, setLyrics] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const consoleBottomRef = useRef(null);

  // Auto scroll console to bottom
  useEffect(() => {
    if (terminalTab === 'console' && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, terminalTab]);

  // Fetch lyrics when song changes
  useEffect(() => {
    let active = true;

    if (!currentSong) {
      const timer = setTimeout(() => {
        if (active) setLyrics('');
      }, 0);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }

    const fetchLyrics = async () => {
      if (!active) return;
      setLoadingLyrics(true);
      setLyrics('');
      try {
        const res = await fetch(`/api/songs/lyrics?id=${currentSong.id}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setLyrics(data.lyrics);
        } else {
          if (active) setLyrics('[SYSTEM WARNING] Unable to fetch lyrics stream from provider.');
        }
      } catch (err) {
        if (active) setLyrics('[SYSTEM ERROR] Connection failure while loading lyrics.');
      } finally {
        if (active) setLoadingLyrics(false);
      }
    };

    const timer = setTimeout(() => {
      fetchLyrics();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [currentSong]);

  const moveQueueItem = (index, direction) => {
    const newQueue = [...queue];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newQueue.length) return;

    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIdx];
    newQueue[targetIdx] = temp;

    setQueue(newQueue);
    addLog(`[QUEUE] Swapped index ${index} with ${targetIdx}`);
  };

  const tabs = [
    { id: 'console', label: 'Console Logs', shortLabel: 'Console', icon: Terminal },
    { id: 'lyrics', label: 'lyrics.md', shortLabel: 'Lyrics', icon: FileText },
    { id: 'queue', label: 'queue.log', shortLabel: 'Queue', icon: ListMusic },
    { id: 'visualizer', label: 'visualizer.exe', shortLabel: 'Visualizer', icon: Activity },
  ];

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="h-60 w-full bg-[#080b12]/85 backdrop-blur-xl border-t border-white/[0.04] flex flex-col flex-shrink-0 select-none z-30 font-sans"
    >
      {/* Tabs Menu Bar */}
      <div className="h-10 w-full bg-black/20 border-b border-white/[0.04] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex h-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = terminalTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTerminalTab(tab.id)}
                className={`h-full px-4 flex items-center gap-2 text-xs transition-colors cursor-pointer relative font-medium ${
                  isActive 
                    ? 'text-accent font-semibold' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-terminal-tab"
                    className="absolute top-0 left-0 right-0 h-[2px] bg-accent" 
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={12} className={isActive ? 'text-accent' : 'text-white/40'} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowTerminal(false)}
          className="text-white/30 hover:text-red-400 transition-colors p-1 cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Tab Contents Viewport */}
      <div className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed text-white/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={terminalTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="h-full"
          >
        
            {/* Tab 1: Console Logs */}
            {terminalTab === 'console' && (
              <div className="h-full overflow-y-auto flex flex-col gap-1 pr-2 font-mono text-[11px]">
                {logs.map((log, i) => {
                  let color = 'text-white/45';
                  if (log.includes('[ERROR]')) color = 'text-red-400 font-bold';
                  else if (log.includes('[SYSTEM]')) color = 'text-accent/80';
                  else if (log.includes('[PLAYBACK]')) color = 'text-blue-400';
                  else if (log.includes('[AUTH]')) color = 'text-purple-400';
                  else if (log.includes('[DOWNLOAD]')) color = 'text-yellow-400';
                  
                  return (
                    <div key={i} className={`whitespace-pre-wrap ${color}`}>
                      {log}
                    </div>
                  );
                })}
                <div className="flex items-center gap-1.5 mt-1 flex-shrink-0">
                  <span className="text-accent/60">404player@kernel:~#</span>
                  <span className="w-1.5 h-3.5 bg-accent animate-pulse" />
                </div>
                <div ref={consoleBottomRef} />
              </div>
            )}

            {/* Tab 2: Lyrics */}
            {terminalTab === 'lyrics' && (
              <div className="h-full overflow-y-auto pr-2 text-center flex flex-col items-center">
                {currentSong ? (
                  loadingLyrics ? (
                    <div className="my-auto text-accent animate-pulse font-mono">[SYSTEM] Decoding lyrics sequence...</div>
                  ) : (
                    <div className="whitespace-pre-line text-white/80 max-w-lg leading-loose py-2 font-medium">
                      {lyrics}
                    </div>
                  )
                ) : (
                  <div className="my-auto text-white/20 italic">No active track loaded. Select a track to compile lyrics.</div>
                )}
              </div>
            )}

            {/* Tab 3: Queue Management */}
            {terminalTab === 'queue' && (
              <div className="h-full overflow-y-auto pr-2 flex flex-col gap-1.5 font-sans">
                {queue.length === 0 ? (
                  <div className="my-auto text-center text-white/20 italic">Queue list is currently empty.</div>
                ) : (
                  queue.map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div 
                        key={song.id + '-' + idx}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                          isCurrent 
                            ? 'bg-white/[0.04] text-accent font-medium' 
                            : 'bg-white/[0.01] hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-[10px] text-white/20 w-5 text-right font-mono">
                            {idx + 1}.
                          </span>
                          <img src={song.image} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0 bg-white/[0.03]" />
                          <div className="flex flex-col min-w-0">
                            <span className={`text-[11px] font-semibold truncate ${isCurrent ? 'text-accent' : 'text-white/85'}`}>
                              {song.title}
                            </span>
                            <span className="text-[9px] text-white/40 truncate mt-0.5">
                              {song.artist}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button 
                            onClick={() => playSong(song)}
                            className="p-1.5 text-white/30 hover:text-accent cursor-pointer transition-colors"
                          >
                            <Play size={11} fill="currentColor" />
                          </button>
                          <button 
                            onClick={() => moveQueueItem(idx, -1)}
                            disabled={idx === 0}
                            className="p-1.5 text-white/35 hover:text-accent cursor-pointer transition-colors disabled:opacity-20"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button 
                            onClick={() => moveQueueItem(idx, 1)}
                            disabled={idx === queue.length - 1}
                            className="p-1.5 text-white/35 hover:text-accent cursor-pointer transition-colors disabled:opacity-20"
                          >
                            <ArrowDown size={11} />
                          </button>
                          <button 
                            onClick={() => removeFromQueue(song.id)}
                            className="p-1.5 text-white/30 hover:text-red-400 cursor-pointer transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 4: Audio Visualizer */}
            {terminalTab === 'visualizer' && (
              <div className="h-full w-full flex items-center justify-center relative">
                <Visualizer />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
