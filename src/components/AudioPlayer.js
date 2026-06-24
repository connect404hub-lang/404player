'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, RotateCw, 
  ChevronUp, ChevronDown, Gauge, Music, Maximize2, Terminal, ListMusic,
  Plus, FolderPlus
} from 'lucide-react';
import Visualizer from './Visualizer';

export default function AudioPlayer() {
  const { 
    currentSong, isPlaying, togglePlay, nextSong, prevSong, volume, setVolume, 
    isMuted, toggleMute, shuffle, toggleShuffle, repeat, toggleRepeat, 
    playbackSpeed, setPlaybackSpeed, lyricsText, loadingLyrics, audioRef, 
    addLog, logs, queue, haptic, playlists, addSongToPlaylist, theme
  } = usePlayer();
  const isLiquidGlass = theme?.includes('liquid-glass');

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [speedDropdown, setSpeedDropdown] = useState(false);
  const [playlistDropdown, setPlaylistDropdown] = useState(false);
  const [mobileTab, setMobileTab] = useState('core'); // 'core' | 'lyrics' | 'visualizer'
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!playlistDropdown) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#playlist-dropdown-container')) {
        setPlaylistDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [playlistDropdown]);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(t);
      setMounted(false);
    };
  }, []);

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
      <div className="h-20 w-full glass-effect flex items-center justify-between px-6 flex-shrink-0 select-none z-[52] relative">
        
        {/* Left Column: Track Details */}
        <div 
          onClick={() => setIsExpanded(true)}
          className="flex items-center w-3/4 md:w-1/4 min-w-0 gap-3.5 cursor-pointer group"
          title="Maximize view"
        >
          {currentSong ? (
            <>
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-bg-secondary/40 flex-shrink-0 relative">
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
                <h5 className="text-[13px] font-semibold truncate text-text-primary group-hover:text-accent transition-colors">
                  {currentSong.title}
                </h5>
                <p className="text-[11px] text-text-secondary/60 truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-bg-secondary/20 flex items-center justify-center text-text-secondary/50 flex-shrink-0">
                <Music size={18} />
              </div>
              <div className="flex flex-col">
                <h5 className="text-[12px] font-semibold text-text-secondary/50">No track compiled</h5>
                <p className="text-[10px] text-text-secondary/40 mt-0.5">Select a compilation node</p>
              </div>
            </>
          )}
        </div>

        {/* Center Column: Execution Controls */}
        <div className="hidden md:flex flex-col items-center w-2/5 gap-2">
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleShuffle}
              className={`cursor-pointer transition-colors ${shuffle ? 'text-accent' : 'text-text-secondary/50 hover:text-text-primary'}`}
              title="Toggle Shuffle"
            >
              <Shuffle size={14} />
            </button>

            <button 
              onClick={prevSong}
              className="cursor-pointer text-text-secondary/50 hover:text-text-primary transition-colors disabled:opacity-50"
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
              className="cursor-pointer text-text-secondary/50 hover:text-text-primary transition-colors disabled:opacity-50"
              disabled={!currentSong}
            >
              <SkipForward size={15} fill="currentColor" />
            </button>

            <button 
              onClick={toggleRepeat}
              className={`cursor-pointer relative transition-colors ${repeat !== 'none' ? 'text-accent' : 'text-text-secondary/50 hover:text-text-primary'}`}
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
          <div className="flex items-center w-full gap-3 text-[10px] text-text-secondary/50 font-semibold font-mono">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 relative h-1 flex items-center">
              <input 
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={!currentSong}
                className="w-full h-1 bg-border-color/30 rounded-lg appearance-none cursor-pointer accent-accent relative z-10"
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
              className="p-1.5 text-text-secondary/50 hover:text-text-primary"
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
                className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-secondary/40 hover:bg-bg-secondary/60 border border-border-color/40 rounded-lg text-[11px] text-text-secondary hover:text-accent cursor-pointer transition-all"
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
                    className="absolute bottom-10 right-0 w-22 bg-bg-secondary border border-border-color/50 rounded-xl shadow-2xl py-1 z-55 flex flex-col"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`w-full text-left px-3.5 py-1.5 text-[11px] transition-colors hover:bg-bg-tertiary/40 hover:text-accent ${
                          playbackSpeed === s ? 'text-accent font-bold' : 'text-text-secondary'
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
              <button onClick={toggleMute} className="text-text-secondary/50 hover:text-text-primary transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input 
                type="range" 
                min={0} 
                max={1} 
                step={0.01} 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange} 
                className="w-16 h-1 bg-border-color/30 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Fullscreen toggle */}
            <button onClick={() => setIsExpanded(true)} className="p-1 text-text-secondary/50 hover:text-accent cursor-pointer transition-all">
              <Maximize2 size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* FULLSCREEN IMMERSIVE PLAYER */}
      {mounted && typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {isExpanded && currentSong && (
                <motion.div
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                  className="immersive-player-container fixed inset-0 bg-bg-primary z-[60] flex flex-col select-none overflow-hidden"
                >
                  {/* Ambient blur backdrops */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-[0.05] filter blur-[100px] scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${currentSong.image})` }}
                  />

                  {/* Apple-style Liquid Glass Floating Blobs */}
                  {isLiquidGlass && (
                    <>
                      <div className="liquid-blob liquid-blob-1" />
                      <div className="liquid-blob liquid-blob-2" />
                      <div className="liquid-blob liquid-blob-3" />
                    </>
                  )}

                  {/* Header */}
                  <div className="h-16 w-full bg-bg-secondary/30 border-b border-border-color/30 flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] text-text-secondary/40 uppercase tracking-widest font-bold font-mono">Kernel Core Sound Deck</span>
                    </div>
                    <button 
                      onClick={() => setIsExpanded(false)}
                      className="px-4 py-1.5 bg-bg-secondary/40 hover:bg-bg-secondary/60 border border-border-color/30 rounded-xl text-xs text-text-secondary hover:text-accent cursor-pointer transition-all"
                    >
                      Close (Esc)
                    </button>
                  </div>

                  {/* Mobile Tabs */}
                  <div className="md:hidden flex border border-border-color/30 p-1 mx-6 mt-2 bg-bg-secondary/20 rounded-xl font-mono text-[9px] font-bold z-10">
                    <button 
                      onClick={() => setMobileTab('core')}
                      className={`flex-1 py-2 text-center rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                        mobileTab === 'core' ? 'bg-accent text-bg-primary shadow-[0_0_8px_rgba(var(--accent-rgb),0.2)]' : 'text-text-secondary/40 hover:text-text-primary'
                      }`}
                    >
                      Node Core
                    </button>
                    <button 
                      onClick={() => setMobileTab('lyrics')}
                      className={`flex-1 py-2 text-center rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                        mobileTab === 'lyrics' ? 'bg-accent text-bg-primary shadow-[0_0_8px_rgba(var(--accent-rgb),0.2)]' : 'text-text-secondary/40 hover:text-text-primary'
                      }`}
                    >
                      Lyrics.txt
                    </button>
                    <button 
                      onClick={() => setMobileTab('visualizer')}
                      className={`flex-1 py-2 text-center rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                        mobileTab === 'visualizer' ? 'bg-accent text-bg-primary shadow-[0_0_8px_rgba(var(--accent-rgb),0.2)]' : 'text-text-secondary/60 hover:text-text-primary'
                      }`}
                    >
                      Visualizer
                    </button>
                  </div>

                  {/* Main Area */}
                  <div className="flex-1 flex flex-col md:flex-row p-4 md:p-12 gap-6 items-stretch justify-between overflow-hidden z-10 pb-6 md:pb-12">
                    
                    {/* Col 1: Disc Visualizer & Info */}
                    <div className={`${mobileTab === 'core' ? 'flex' : 'hidden'} md:flex flex-col justify-center items-center gap-6 flex-1 md:w-1/3`}>
                      <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full overflow-hidden border border-border-color/40 shadow-2xl flex-shrink-0 group">
                        <div className="absolute inset-0 rounded-full border-[10px] border-black/35 z-10 pointer-events-none" />
                        <div className="absolute inset-0 rounded-full border-[22px] border-black/15 z-10 pointer-events-none" />
                        <img 
                          src={currentSong.image || ''} 
                          alt="" 
                          className={`w-full h-full object-cover rounded-full vinyl-rotation ${isPlaying ? '' : 'vinyl-rotation-paused'}`} 
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg-primary border border-border-color/40 z-20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        </div>
                      </div>

                      <div className="text-center mt-2 flex flex-col items-center gap-1.5">
                        <h2 className="text-lg md:text-xl font-bold text-text-primary truncate px-4 max-w-[280px] sm:max-w-xs">{currentSong.title}</h2>
                        <p className="text-xs text-accent mt-1">{currentSong.artist}</p>
                        
                        {/* Playlist Mount Button */}
                        <div id="playlist-dropdown-container" className="relative mt-2">
                          <button
                            onClick={() => setPlaylistDropdown(!playlistDropdown)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary/40 hover:bg-bg-secondary/60 hover:text-accent border border-border-color/40 rounded-xl text-xs text-text-secondary cursor-pointer transition-all uppercase font-bold"
                            title="Mount into local folder"
                          >
                            <Plus size={13} />
                            <span>ADD TO PLAYLIST</span>
                          </button>

                          <AnimatePresence>
                            {playlistDropdown && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className="absolute top-9 left-1/2 -translate-x-1/2 w-44 bg-bg-secondary border border-border-color/40 rounded-xl shadow-2xl py-1 z-55 flex flex-col text-[11px] font-mono text-left"
                              >
                                <div className="px-2.5 py-1.5 border-b border-border-color/30 text-[9px] text-accent/60 uppercase font-bold tracking-wider flex items-center gap-1">
                                  <FolderPlus size={11} />
                                  <span>mount to folder</span>
                                </div>
                                {playlists.length === 0 ? (
                                  <span className="px-3 py-2 text-text-secondary/60 italic text-center">No local folders.</span>
                                ) : (
                                  playlists.map((pl) => (
                                    <button
                                      key={pl.id || pl._id}
                                      onClick={() => {
                                        addSongToPlaylist(pl.id || pl._id, currentSong);
                                        setPlaylistDropdown(false);
                                      }}
                                      className="w-full text-left px-3.5 py-2 transition-colors hover:bg-bg-tertiary/40 hover:text-accent text-text-secondary truncate cursor-pointer"
                                    >
                                      {pl.name}
                                    </button>
                                  ))
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Lyrics Stream & Controller */}
                    <div className={`${mobileTab === 'lyrics' ? 'flex' : 'hidden'} md:flex flex-col justify-between gap-6 flex-1 md:w-1/3 overflow-hidden`}>
                      <div className="flex-1 bg-bg-secondary/20 border border-border-color/30 rounded-2xl p-6 overflow-y-auto flex flex-col items-center justify-center relative min-h-[220px]">
                        <div className="absolute top-4 left-4 text-[9px] text-text-secondary/40 uppercase tracking-widest font-bold font-mono">Stream lyrics.txt</div>
                        <div className="w-full overflow-y-auto max-h-[85%] text-xs text-text-primary/70 leading-loose whitespace-pre-line text-center scrollbar-none font-medium">
                          {loadingLyrics ? (
                            <span className="text-accent animate-pulse">Compiling lyrics file...</span>
                          ) : lyricsText ? (
                            lyricsText
                          ) : (
                            <span className="text-text-secondary/30 italic">No lyrics file compiled for track</span>
                          )}
                        </div>
                      </div>

                      {/* Dashboard Panel - desktop only */}
                      <div className="hidden md:flex bg-bg-secondary/30 border border-border-color/30 rounded-2xl p-5 flex flex-col gap-4 flex-shrink-0">
                        <div className="flex flex-col gap-2">
                          <div className="flex-1 relative h-1.5 flex items-center">
                            <input 
                              type="range"
                              min={0}
                              max={duration || 100}
                              value={currentTime}
                              onChange={handleSeek}
                              className="w-full h-1.5 bg-border-color/30 rounded-lg appearance-none cursor-pointer accent-accent relative z-10"
                            />
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-accent rounded-l-lg pointer-events-none" 
                              style={{ width: `${activeProgressPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-text-secondary/50 font-semibold font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                          <button onClick={toggleShuffle} className={`p-2 transition-colors ${shuffle ? 'text-accent' : 'text-text-secondary/50 hover:text-text-primary'}`}>
                            <Shuffle size={15} />
                          </button>
                          <div className="flex items-center gap-4">
                            <button onClick={prevSong} className="p-2 text-text-secondary/50 hover:text-text-primary">
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
                            <button onClick={nextSong} className="p-2 text-text-secondary/50 hover:text-text-primary">
                              <SkipForward size={18} fill="currentColor" />
                            </button>
                          </div>
                          <button onClick={toggleRepeat} className={`p-2 relative transition-colors ${repeat !== 'none' ? 'text-accent' : 'text-text-secondary/50 hover:text-text-primary'}`}>
                            <RotateCw size={15} />
                            {repeat === 'one' && <span className="absolute top-0 right-0 text-[7px] font-bold bg-accent text-bg-primary w-2.5 h-2.5 rounded-full flex items-center justify-center">1</span>}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Visualizer & Log Feed */}
                    <div className={`${mobileTab === 'visualizer' ? 'flex' : 'hidden'} md:flex flex-col justify-between gap-6 flex-1 md:w-1/3 overflow-hidden`}>
                      <div className="flex-1 bg-bg-secondary/20 border border-border-color/30 rounded-2xl p-5 flex flex-col gap-3 relative min-h-[180px]">
                        <div className="absolute top-4 left-4 text-[9px] text-text-secondary/40 uppercase tracking-widest font-bold font-mono">Visualizer.exe</div>
                        <div className="w-full flex-1 flex items-center justify-center pt-6 relative min-h-[140px]">
                          <Visualizer />
                        </div>
                      </div>

                      <div className="h-32 flex flex-col gap-2 flex-shrink-0">
                        <span className="text-[10px] text-accent font-bold uppercase tracking-wider font-mono">diagnostics_feed.log</span>
                        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-2 bg-bg-secondary/20 border border-border-color/30 rounded-xl p-3 text-[10px] text-text-secondary/50 font-semibold font-mono">
                          {logs.slice(-5).map((log, i) => (
                            <div key={i} className="truncate">{log}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Mobile Playback Controller Section */}
                  <div className="md:hidden flex flex-col gap-4 bg-bg-secondary/50 border-t border-border-color/40 p-6 pb-8 flex-shrink-0 z-20">
                    <div className="flex flex-col gap-2">
                      <div className="flex-1 relative h-1.5 flex items-center">
                        <input 
                          type="range"
                          min={0}
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1.5 bg-border-color/30 rounded-lg appearance-none cursor-pointer accent-accent relative z-10"
                        />
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-accent rounded-l-lg pointer-events-none" 
                          style={{ width: `${activeProgressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-secondary/50 font-semibold font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-4">
                      <button onClick={toggleShuffle} className={`p-2 transition-colors ${shuffle ? 'text-accent' : 'text-text-secondary/50'}`}>
                        <Shuffle size={16} />
                      </button>
                      <div className="flex items-center gap-6">
                        <button onClick={prevSong} className="p-2 text-text-secondary/60 active:text-text-primary">
                          <SkipBack size={20} fill="currentColor" />
                        </button>
                        <motion.button 
                          onClick={() => { haptic(25); togglePlay(); }}
                          whileTap={{ scale: 0.9 }}
                          className="w-14 h-14 rounded-full bg-accent text-bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-accent/20"
                        >
                          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
                        </motion.button>
                        <button onClick={nextSong} className="p-2 text-text-secondary/60 active:text-text-primary">
                          <SkipForward size={20} fill="currentColor" />
                        </button>
                      </div>
                      <button onClick={toggleRepeat} className={`p-2 relative transition-colors ${repeat !== 'none' ? 'text-accent' : 'text-text-secondary/50'}`}>
                        <RotateCw size={16} />
                        {repeat === 'one' && <span className="absolute top-1 right-0 text-[7px] font-bold bg-accent text-bg-primary w-2.5 h-2.5 rounded-full flex items-center justify-center">1</span>}
                      </button>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
