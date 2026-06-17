'use client';

import React, { useEffect, useState } from 'react';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, RotateCw, 
  ChevronUp, ChevronDown, Gauge, Music, Maximize2, Terminal, ListMusic
} from 'lucide-react';
import Visualizer from './Visualizer';

export default function AudioPlayer() {
  const { 
    currentSong, isPlaying, togglePlay, nextSong, prevSong, volume, setVolume, 
    isMuted, toggleMute, shuffle, toggleShuffle, repeat, toggleRepeat, 
    playbackSpeed, setPlaybackSpeed, lyricsText, loadingLyrics, audioRef, 
    addLog, logs, queue, haptic 
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [speedDropdown, setSpeedDropdown] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight') { e.preventDefault(); nextSong(); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); prevSong(); }
      if (e.code === 'Escape' && isExpanded) { e.preventDefault(); setIsExpanded(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextSong, prevSong, isExpanded]);

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const handleSpeedChange = (val) => {
    setPlaybackSpeed(val);
    setSpeedDropdown(false);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeProgressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* COMPACT BOTTOM CONTROLLER */}
      <div className="h-20 w-full bg-[#080b12]/75 backdrop-blur-2xl border-t border-white/[0.04] flex items-center justify-between px-6 flex-shrink-0 select-none z-40 relative">
        
        {/* Left Column: Track Details */}
        <div 
          onClick={() => setIsExpanded(true)}
          className="flex items-center w-3/4 md:w-1/4 min-w-0 gap-3.5 cursor-pointer group"
          title="Maximize view"
        >
          {currentSong ? (
            <>
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/[0.03] flex-shrink-0 relative">
                <img 
                  src={currentSong.image || ''} 
                  alt={currentSong.title} 
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isPlaying ? 'animate-spin-slow' : ''}`}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronUp size={16} className="text-white" />
                </div>
              </div>
              
              <div className="flex flex-col min-w-0">
                <h5 className="text-[13px] font-semibold truncate text-white/90 group-hover:text-accent transition-colors">
                  {currentSong.title}
                </h5>
                <p className="text-[11px] text-white/40 truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/20 flex-shrink-0">
                <Music size={18} />
              </div>
              <div className="flex flex-col">
                <h5 className="text-[12px] font-semibold text-white/30">No track compiled</h5>
                <p className="text-[10px] text-white/20 mt-0.5">Select a compilation node</p>
              </div>
            </>
          )}
        </div>

        {/* Center Column: Execution Controls */}
        <div className="hidden md:flex flex-col items-center w-2/5 gap-2">
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleShuffle}
              className={`cursor-pointer transition-colors ${shuffle ? 'text-accent' : 'text-white/30 hover:text-white/60'}`}
              title="Toggle Shuffle"
            >
              <Shuffle size={14} />
            </button>

            <button 
              onClick={prevSong}
              className="cursor-pointer text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
              disabled={!currentSong}
            >
              <SkipBack size={15} fill="currentColor" />
            </button>

            <motion.button 
              onClick={() => { haptic(20); togglePlay(); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-accent text-bg-primary flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] transition-all disabled:opacity-50"
              disabled={!currentSong}
            >
              {isPlaying ? (
                <Pause size={15} fill="currentColor" />
              ) : (
                <Play size={15} fill="currentColor" className="ml-0.5" />
              )}
            </motion.button>

            <button 
              onClick={nextSong}
              className="cursor-pointer text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
              disabled={!currentSong}
            >
              <SkipForward size={15} fill="currentColor" />
            </button>

            <button 
              onClick={toggleRepeat}
              className={`cursor-pointer relative transition-colors ${repeat !== 'none' ? 'text-accent' : 'text-white/30 hover:text-white/60'}`}
            >
              <RotateCw size={14} />
              {repeat === 'one' && (
                <span className="absolute -top-1 -right-2 text-[7px] font-bold bg-accent text-bg-primary w-2.5 h-2.5 rounded-full flex items-center justify-center scale-90">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Seek Progress */}
          <div className="flex items-center w-full gap-3 text-[10px] text-white/30 font-semibold font-mono">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 relative h-1 flex items-center">
              <input 
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={!currentSong}
                className="w-full h-1 bg-white/[0.04] rounded-lg appearance-none cursor-pointer accent-accent relative z-10"
              />
              <div 
                className="absolute left-0 top-0 bottom-0 bg-accent rounded-l-lg pointer-events-none" 
                style={{ width: `${activeProgressPercent}%` }}
              />
            </div>
            <span className="w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Column: Volume / Speed Control */}
        <div className="flex items-center justify-end w-1/4 gap-4 flex-shrink-0">
          
          {/* Mobile Play and Maximize */}
          <div className="md:hidden flex items-center gap-2">
            {currentSong && (
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-9 h-9 rounded-full bg-accent text-bg-primary flex items-center justify-center cursor-pointer shadow-[0_0_8px_rgba(var(--accent-rgb),0.3)] active:scale-95 transition-all"
              >
                {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
              className="p-1.5 text-white/40 hover:text-white"
            >
              <ChevronUp size={20} />
            </button>
          </div>

          {/* Desktop details */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Speed */}
            <div className="relative">
              <button
                onClick={() => setSpeedDropdown(!speedDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-lg text-[11px] text-white/50 hover:text-accent cursor-pointer transition-all"
                disabled={!currentSong}
              >
                <Gauge size={12} />
                <span>{playbackSpeed}x</span>
              </button>

              <AnimatePresence>
                {speedDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute bottom-10 right-0 w-22 bg-[#0c101b] border border-white/[0.06] rounded-xl shadow-2xl py-1 z-55 flex flex-col"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`w-full text-left px-3.5 py-1.5 text-[11px] transition-colors hover:bg-white/[0.04] hover:text-accent ${
                          playbackSpeed === s ? 'text-accent font-bold' : 'text-white/60'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white/30 hover:text-white/60 transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input 
                type="range" 
                min={0} 
                max={1} 
                step={0.01} 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange} 
                className="w-16 h-1 bg-white/[0.04] rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Fullscreen toggle */}
            <button onClick={() => setIsExpanded(true)} className="p-1 text-white/30 hover:text-accent cursor-pointer transition-all">
              <Maximize2 size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* FULLSCREEN IMMERSIVE PLAYER */}
      <AnimatePresence>
        {isExpanded && currentSong && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed inset-0 bg-[#04060b] z-50 flex flex-col select-none overflow-hidden"
          >
            {/* Ambient blur backdrops */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-[0.05] filter blur-[100px] scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${currentSong.image})` }}
            />

            {/* Header */}
            <div className="h-16 w-full bg-[#080b12]/30 border-b border-white/[0.03] flex items-center justify-between px-6 z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono">Kernel Core Sound Deck</span>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="px-4 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl text-xs text-white/50 hover:text-accent cursor-pointer transition-all"
              >
                Close (Esc)
              </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col md:flex-row p-6 md:p-12 gap-8 items-stretch justify-between overflow-y-auto md:overflow-hidden z-10 pb-24 md:pb-12">
              
              {/* Col 1: Disc Visualizer & Info */}
              <div className="flex flex-col justify-center items-center gap-6 md:w-1/3">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border border-white/[0.06] shadow-2xl flex-shrink-0 group">
                  <div className="absolute inset-0 rounded-full border-[10px] border-black/35 z-10 pointer-events-none" />
                  <div className="absolute inset-0 rounded-full border-[22px] border-black/15 z-10 pointer-events-none" />
                  <img 
                    src={currentSong.image || ''} 
                    alt="" 
                    className={`w-full h-full object-cover rounded-full vinyl-rotation ${isPlaying ? '' : 'vinyl-rotation-paused'}`} 
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg-primary border border-white/[0.08] z-20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                </div>

                <div className="text-center mt-2">
                  <h2 className="text-lg md:text-xl font-bold text-white/95 truncate px-4">{currentSong.title}</h2>
                  <p className="text-xs text-accent mt-1">{currentSong.artist}</p>
                </div>
              </div>

              {/* Col 2: Lyrics Stream & Controller */}
              <div className="flex flex-col justify-between gap-6 md:w-1/3 overflow-hidden">
                <div className="flex-1 bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6 overflow-y-auto flex flex-col items-center justify-center relative min-h-[220px]">
                  <div className="absolute top-4 left-4 text-[9px] text-white/30 uppercase tracking-widest font-bold font-mono">Stream lyrics.txt</div>
                  <div className="w-full overflow-y-auto max-h-[85%] text-xs text-white/70 leading-loose whitespace-pre-line text-center scrollbar-none font-medium">
                    {loadingLyrics ? (
                      <span className="text-accent animate-pulse">Compiling lyrics file...</span>
                    ) : lyricsText ? (
                      lyricsText
                    ) : (
                      <span className="text-white/20 italic">No lyrics file compiled for track</span>
                    )}
                  </div>
                </div>

                {/* Dashboard Panel */}
                <div className="bg-white/[0.02] border border-white/[0.03] rounded-2xl p-5 flex flex-col gap-4 flex-shrink-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex-1 relative h-1.5 flex items-center">
                      <input 
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-white/[0.04] rounded-lg appearance-none cursor-pointer accent-accent relative z-10"
                      />
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-accent rounded-l-lg pointer-events-none" 
                        style={{ width: `${activeProgressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 font-semibold font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <button onClick={toggleShuffle} className={`p-2 transition-colors ${shuffle ? 'text-accent' : 'text-white/30 hover:text-white/60'}`}>
                      <Shuffle size={15} />
                    </button>
                    <div className="flex items-center gap-4">
                      <button onClick={prevSong} className="p-2 text-white/30 hover:text-white/60">
                        <SkipBack size={18} fill="currentColor" />
                      </button>
                      <motion.button 
                        onClick={() => { haptic(25); togglePlay(); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-full bg-accent text-bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-accent/20"
                      >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                      </motion.button>
                      <button onClick={nextSong} className="p-2 text-white/30 hover:text-white/60">
                        <SkipForward size={18} fill="currentColor" />
                      </button>
                    </div>
                    <button onClick={toggleRepeat} className={`p-2 relative transition-colors ${repeat !== 'none' ? 'text-accent' : 'text-white/30 hover:text-white/60'}`}>
                      <RotateCw size={15} />
                      {repeat === 'one' && <span className="absolute top-0 right-0 text-[7px] font-bold bg-accent text-bg-primary w-2.5 h-2.5 rounded-full flex items-center justify-center">1</span>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Col 3: Visualizer & Log Feed */}
              <div className="flex flex-col justify-between gap-6 md:w-1/3 overflow-hidden">
                <div className="flex-1 bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 flex flex-col gap-3 relative min-h-[180px]">
                  <div className="absolute top-4 left-4 text-[9px] text-white/30 uppercase tracking-widest font-bold font-mono">Visualizer.exe</div>
                  <div className="w-full h-full flex items-center justify-center pt-6">
                    <Visualizer />
                  </div>
                </div>

                <div className="h-32 flex flex-col gap-2 flex-shrink-0">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-wider font-mono">diagnostics_feed.log</span>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-2 bg-white/[0.01] border border-white/[0.03] rounded-xl p-3 text-[10px] text-white/40 font-semibold font-mono">
                    {logs.slice(-5).map((log, i) => (
                      <div key={i} className="truncate">{log}</div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
