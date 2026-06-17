'use client';

import React, { useEffect, useState } from 'react';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Plus, 
  FolderHeart, 
  Cpu, 
  Clock, 
  FolderPlus,
  Check
} from 'lucide-react';

export default function DirectoryExplorer({ id, type, onClose }) {
  const { playSong, playlists, addSongToPlaylist, addLog } = usePlayer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playlistDropdown, setPlaylistDropdown] = useState(null); // trackId of active dropdown
  const [addedNotify, setAddedNotify] = useState(null); // trackId that was just added

  useEffect(() => {
    if (!id || !type) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      addLog(`[SYSTEM] Compiling directory payload for type=${type.toUpperCase()} ID=${id}...`);
      try {
        const res = await fetch(`/api/songs/details?id=${id}&type=${type}`);
        if (res.ok) {
          const json = await res.json();
          const target = type === 'album' ? json.album : json.playlist;
          if (target) {
            setData(target);
            addLog(`[SYSTEM] Directory "${target.title}" resolved with ${target.songs?.length || 0} track modules.`);
          } else {
            setError('Target database record is empty.');
          }
        } else {
          setError('Failed to query directory logs.');
        }
      } catch (err) {
        setError('Network socket timeout.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type]);

  const handlePlaySong = (song, idx) => {
    if (!data || !data.songs) return;
    addLog(`[PLAYBACK] Playing track index [${idx + 1}] from "${data.title}"`);
    playSong(song, data.songs);
  };

  const handlePlayAll = () => {
    if (!data || !data.songs || data.songs.length === 0) return;
    addLog(`[PLAYBACK] Compiling and starting stream queue for directory: "${data.title}"`);
    playSong(data.songs[0], data.songs);
  };

  const handleAddToPlaylist = (playlistId, song) => {
    addSongToPlaylist(playlistId, {
      id: song.id,
      title: song.title,
      artist: song.artist,
      image: song.image,
      duration: song.duration,
      url: song.url
    });
    setPlaylistDropdown(null);
    setAddedNotify(song.id);
    setTimeout(() => setAddedNotify(null), 2000);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!id || !type) return null;

  return (
    <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-55 flex items-center justify-center p-4 md:p-6 font-mono select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="bg-bg-secondary border border-border-color rounded-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
      >
        
        {/* Glow accent bubble */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full neon-radial-blur" />

        {/* Header bar */}
        <div className="h-14 bg-bg-tertiary border-b border-border-color/80 px-4 md:px-6 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="text-accent animate-pulse" size={14} />
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">{"// DIR_EXPLORER.exe --inspect"}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-red-500 hover:border-red-500/20 border border-transparent rounded cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 z-10">
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-accent text-xs animate-pulse">
              <Cpu className="animate-spin text-accent" size={20} />
              <span>[SYSTEM QUERY] Retrieving directory tracks...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-red-500 text-xs gap-3">
              <span>[EXCEPTION] {error}</span>
              <button 
                onClick={onClose}
                className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-400 font-semibold cursor-pointer"
              >
                Close Connection
              </button>
            </div>
          ) : data && (
            <div className="flex flex-col gap-6">
              
              {/* Directory metadata header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-5 bg-bg-tertiary/40 border border-border-color/60 p-4 rounded-lg">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded overflow-hidden flex-shrink-0 border border-border-color/60 shadow-lg">
                  <img src={data.image} alt="" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col gap-1 min-w-0 text-center sm:text-left">
                  <span className="text-[8px] md:text-[9px] text-accent font-bold uppercase tracking-widest border border-accent/20 bg-accent/5 px-2 py-0.5 rounded self-center sm:self-start mb-1">
                    {type} CONFIG
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-text-primary truncate">{data.title}</h3>
                  <p className="text-[11px] text-text-secondary truncate">{data.artist || data.subtitle || 'Various Artists'}</p>
                  <span className="text-[10px] text-text-secondary/70 mt-1 block">
                    Total files: {data.songs?.length || 0} tracks | Source: saavncdn_decrypted
                  </span>
                </div>

                <button
                  onClick={handlePlayAll}
                  disabled={!data.songs || data.songs.length === 0}
                  className="px-4 py-2 bg-accent text-bg-primary hover:bg-accent/90 border border-transparent rounded text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_var(--accent-glow)] active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
                >
                  <Play size={12} fill="currentColor" />
                  <span>COMPILE STREAM</span>
                </button>
              </div>

              {/* Tracks list */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>compiled_track_registers</span>
                  <Clock size={11} className="text-text-secondary" />
                </h4>
                
                {(!data.songs || data.songs.length === 0) ? (
                  <div className="text-xs text-text-secondary italic p-4 text-center border border-dashed border-border-color rounded">
                    No songs registered in this directory.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-1">
                    {data.songs.map((song, idx) => (
                      <motion.div 
                        key={song.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={() => handlePlaySong(song, idx)}
                        className="flex items-center justify-between p-2 rounded border border-border-color/30 bg-bg-secondary/40 hover:bg-bg-tertiary/50 transition-colors text-xs text-text-secondary group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-[9px] text-text-secondary w-4 text-right">{idx + 1}.</span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-text-primary truncate">{song.title}</span>
                            <span className="text-[10px] text-text-secondary truncate mt-0.5">{song.artist}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 relative">
                          <span className="text-[10px] font-mono">{formatDuration(song.duration)}</span>
                          
                          {/* Play button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlaySong(song, idx);
                            }}
                            className="p-1 hover:text-accent cursor-pointer transition-colors text-text-secondary"
                            title="Play this file"
                          >
                            <Play size={12} fill="currentColor" />
                          </button>

                          {/* Add to Playlist button */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlaylistDropdown(playlistDropdown === song.id ? null : song.id);
                              }}
                              className="p-1 hover:text-accent cursor-pointer transition-colors text-text-secondary"
                              title="Mount into local folder"
                            >
                              {addedNotify === song.id ? (
                                <Check size={12} className="text-green-400" />
                              ) : (
                                <Plus size={13} />
                              )}
                            </button>

                            {/* Dropdown menu */}
                            {playlistDropdown === song.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 bottom-6 w-40 bg-bg-secondary border border-border-color rounded shadow-xl py-1 z-55 flex flex-col text-[10px]"
                              >
                                <div className="px-2 py-1 border-b border-border-color/60 text-[9px] text-accent/60 uppercase font-bold tracking-wider flex items-center gap-1">
                                  <FolderPlus size={10} />
                                  <span>mount to folder</span>
                                </div>
                                {playlists.length === 0 ? (
                                  <span className="px-2 py-1.5 text-text-secondary italic">No local folders.</span>
                                ) : (
                                  playlists.map((pl) => (
                                    <button
                                      key={pl.id || pl._id}
                                      onClick={() => handleAddToPlaylist(pl.id || pl._id, song)}
                                      className="w-full text-left px-2 py-1.5 transition-colors hover:bg-bg-tertiary hover:text-accent text-text-secondary truncate"
                                    >
                                      {pl.name}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>
  );
}
