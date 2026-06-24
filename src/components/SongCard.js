'use client';

import React, { useState, useRef } from 'react';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, ShieldCheck, Heart, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function SongCard({ song, customQueue = null }) {
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    togglePlay, 
    haptic,
    favorites = [],
    playlists = [],
    toggleFavorite,
    addSongToPlaylist
  } = usePlayer();

  const isCurrent = currentSong?.id === song.id;
  const isFav = favorites.some(f => f.id === song.id);

  const [showActions, setShowActions] = useState(false);
  const [showPlaylistsList, setShowPlaylistsList] = useState(false);

  const longPressTimer = useRef(null);
  const isLongPressTriggered = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const handleAction = (e) => {
    e.stopPropagation();
    if (isLongPressTriggered.current) {
      isLongPressTriggered.current = false;
      return;
    }
    haptic(15);
    if (isCurrent) togglePlay();
    else playSong(song, customQueue);
  };

  const handleTouchStart = (e) => {
    isLongPressTriggered.current = false;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      haptic(35);
      setShowPlaylistsList(false);
      setShowActions(true);
    }, 600);
  };

  const handleTouchMove = (e) => {
    if (!longPressTimer.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isLongPressTriggered.current) {
      e.preventDefault();
    }
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    isLongPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      haptic(35);
      setShowPlaylistsList(false);
      setShowActions(true);
    }, 600);
  };

  const handleMouseUp = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <>
      <motion.div
        onClick={handleAction}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        whileHover={{ y: -6, scale: 1.02 }}
        className={`group relative flex flex-col p-3 rounded-2xl border transition-all duration-500 cursor-pointer ${
          isCurrent 
          ? 'bg-accent/5 border-accent shadow-[0_0_25px_rgba(var(--accent-rgb),0.1)]' 
          : 'bg-bg-secondary/40 border-border-color/30 hover:border-accent/40 hover:bg-bg-secondary/70'
        }`}
      >
        {/* Artwork Area */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-bg-secondary/20">
          {song.image ? (
            <img 
              src={song.image} 
              alt={song.title} 
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isCurrent && isPlaying ? 'brightness-50 blur-[2px]' : ''}`} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary/20">
              <Music size={24} />
            </div>
          )}
          
          {/* Play State Indicator Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 bg-black/40'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCurrent ? 'bg-accent scale-100 shadow-[0_0_15px_var(--accent)]' : 'bg-bg-secondary/40 border border-border-color/30 backdrop-blur-md scale-75 group-hover:scale-100'}`}>
               {isCurrent && isPlaying ? (
                 <Pause size={20} fill="currentColor" className="text-bg-primary" />
               ) : (
                 <Play size={20} fill="currentColor" className="text-bg-primary ml-1" />
               )}
            </div>
          </div>

          {/* Small Data Chip */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-bg-secondary/60 backdrop-blur-md border border-border-color/30 flex items-center gap-1">
             <ShieldCheck size={8} className="text-accent" />
             <span className="text-[7px] text-text-secondary font-bold tracking-tighter">SECURED_NODE</span>
          </div>
        </div>

        {/* Track Metadata */}
        <div className="px-1 flex flex-col gap-0.5">
          <h4 className={`text-[13px] font-bold truncate tracking-tight transition-colors ${isCurrent ? 'text-accent' : 'text-text-primary group-hover:text-accent'}`}>
            {song.title}
          </h4>
          <div className="flex items-center justify-between gap-2">
             <p className="text-[11px] text-text-secondary/60 truncate flex-1">{song.artist}</p>
             {isCurrent && isPlaying && (
               <div className="flex items-center gap-[2px] h-3">
                 {[0.1, 0.2, 0.3].map((delay, i) => (
                   <motion.div key={i} animate={{ height: [2, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay }} className="w-[1.5px] bg-accent rounded-full" />
                 ))}
               </div>
             )}
          </div>
        </div>
      </motion.div>

      {/* Song Actions Context Menu Portal */}
      {showActions && typeof window !== 'undefined' && document.body && createPortal(
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-mono select-none"
          onClick={() => setShowActions(false)}
        >
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-bg-secondary border border-border-color/60 rounded-xl w-full max-w-xs overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-color/30 bg-bg-tertiary/50">
                <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                  {"// inspect_module.sh"}
                </span>
                <button 
                  onClick={() => setShowActions(false)}
                  className="text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Artwork & Info */}
              <div className="flex items-center gap-3 p-4 border-b border-border-color/30">
                {song.image ? (
                  <img src={song.image} alt="" className="w-10 h-10 object-cover rounded border border-border-color/30 flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-bg-secondary/20 rounded border border-border-color/30 flex items-center justify-center text-text-secondary flex-shrink-0">
                    <Music size={16} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-text-primary truncate">{song.title}</h4>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">{song.artist}</p>
                </div>
              </div>

              {/* Actions List */}
              <div className="flex flex-col">
                {!showPlaylistsList ? (
                  <>
                    <button
                      onClick={() => {
                        toggleFavorite(song);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs hover:bg-bg-secondary/40 border-b border-border-color/30 transition-colors text-left text-text-primary cursor-pointer"
                    >
                      <Heart size={14} className={isFav ? "text-accent fill-accent" : "text-text-secondary"} />
                      <span>{isFav ? "REMOVE_FROM_FAVORITES" : "ADD_TO_FAVORITES"}</span>
                    </button>
                    <button
                      onClick={() => setShowPlaylistsList(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs hover:bg-bg-secondary/40 border-b border-border-color/30 transition-colors text-left text-text-primary cursor-pointer"
                    >
                      <Plus size={14} className="text-text-secondary" />
                      <span>ADD_TO_PLAYLIST</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col bg-bg-tertiary/20">
                    <div className="px-4 py-2 text-[9px] text-accent font-bold border-b border-border-color/30 flex items-center justify-between">
                      <span>SELECT_PLAYLIST</span>
                      <button 
                        onClick={() => setShowPlaylistsList(false)}
                        className="text-text-secondary hover:text-text-primary cursor-pointer"
                      >
                        BACK
                      </button>
                    </div>
                    <div className="max-h-[160px] overflow-y-auto">
                      {playlists.length === 0 ? (
                        <div className="px-4 py-3 text-[10px] text-text-secondary italic">
                          No custom playlists created.
                        </div>
                      ) : (
                        playlists.map((pl) => (
                          <button
                            key={pl.id || pl._id}
                            onClick={() => {
                              addSongToPlaylist(pl.id || pl._id, song);
                              setShowActions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-bg-secondary/40 text-[10px] text-text-secondary hover:text-accent transition-colors truncate cursor-pointer"
                          >
                            {pl.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowActions(false)}
                className="w-full py-2.5 text-[11px] text-center text-red-400 hover:bg-red-500/10 transition-colors uppercase font-bold border-t border-border-color/30 cursor-pointer"
              >
                CANCEL
              </button>
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}
    </>
  );
}
