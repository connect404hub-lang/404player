'use client';

import React, { useState } from 'react';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import SongCard from '@/components/SongCard';
import { 
  Terminal, 
  ListMusic, 
  Heart, 
  History as HistIcon, 
  DownloadCloud,
  Plus,
  Play,
  Trash2,
  ChevronLeft,
  Database
} from 'lucide-react';

export default function LibraryPage() {
  const { 
    playlists, 
    favorites, 
    history, 
    downloads, 
    createPlaylist, 
    deletePlaylist,
    removeSongFromPlaylist,
    playSong,
    addLog,
    showConfirmModal
  } = usePlayer();

  const [activeSubTab, setActiveSubTab] = useState('playlists'); // 'playlists' | 'favorites' | 'history' | 'downloads'
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlName, setNewPlName] = useState('');
  const [newPlDesc, setNewPlDesc] = useState('');
  const [showPlForm, setShowPlForm] = useState(false);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlName.trim()) return;
    createPlaylist(newPlName, newPlDesc);
    setNewPlName('');
    setNewPlDesc('');
    setShowPlForm(false);
  };

  const handlePlayPlaylist = (pl) => {
    if (!pl || !pl.songs || pl.songs.length === 0) return;
    const songs = pl.songs.map(s => ({
      id: s.songId || s.id,
      title: s.title,
      artist: s.artist,
      image: s.image,
      duration: s.duration,
      url: s.url
    }));
    addLog(`[PLAYBACK] Compiling queue stack from playlist: "${pl.name}"`);
    playSong(songs[0], songs);
  };

  const handlePlayPlaylistSong = (pl, songIndex) => {
    const songs = pl.songs.map(s => ({
      id: s.songId || s.id,
      title: s.title,
      artist: s.artist,
      image: s.image,
      duration: s.duration,
      url: s.url
    }));
    playSong(songs[songIndex], songs);
  };

  const handleDeletePlaylist = (plId, plName) => {
    showConfirmModal({
      title: 'Delete Playlist Directory',
      message: `This will permanently remove "${plName}" and all its track references. This action cannot be reversed.`,
      variant: 'destructive',
      confirmLabel: 'rm -rf (Delete)',
      onConfirm: () => {
        deletePlaylist(plId);
        setSelectedPlaylist(null);
      },
    });
  };

  const handleRemoveSong = (plId, songId) => {
    removeSongFromPlaylist(plId, songId);
    setSelectedPlaylist(prev => {
      if (!prev) return null;
      return {
        ...prev,
        songs: prev.songs.filter(s => (s.songId || s.id) !== songId)
      };
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const subTabs = [
    { id: 'playlists', label: '01. playlists.conf', icon: ListMusic },
    { id: 'favorites', label: '02. favorites.db', icon: Heart },
    { id: 'history', label: '03. history.log', icon: HistIcon },
    { id: 'downloads', label: '04. downloads.iso', icon: DownloadCloud },
  ];

  return (
    <div className="p-4 md:p-8 font-mono select-none flex flex-col gap-5 md:gap-6 pb-20 md:pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border-color pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="text-accent" size={14} />
          <span className="text-[11px] text-text-secondary">{"// SOURCE: ROOT/LIBRARY.sh"}</span>
        </div>
      </div>

      {/* Tabs */}
      {!selectedPlaylist && (
        <div className="flex border-b border-border-color gap-1 bg-bg-tertiary/20 p-1 rounded max-w-full overflow-x-auto scrollbar-none">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 text-[10px] md:text-xs font-semibold rounded cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 md:gap-2 ${
                  activeSubTab === tab.id ? 'bg-bg-secondary text-accent border border-border-color' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* VIEW A: Playlist Details Page */}
      {selectedPlaylist ? (
        <div className="flex flex-col gap-5 md:gap-6">
          <button 
            onClick={() => setSelectedPlaylist(null)}
            className="flex items-center gap-1 text-[11px] md:text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer self-start"
          >
            <ChevronLeft size={14} />
            <span>cd .. (Back to Playlists)</span>
          </button>

          {/* Playlist header details */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-bg-secondary/40 border border-border-color/60 p-4 md:p-6 rounded-lg">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded bg-accent/5 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                <Database size={24} />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="text-sm md:text-base font-bold text-text-primary truncate">{selectedPlaylist.name}</h2>
                <p className="text-[10px] md:text-xs text-text-secondary truncate">{selectedPlaylist.description || 'No description config compiled.'}</p>
                <span className="text-[9px] md:text-[10px] text-text-secondary mt-1 font-semibold">
                  Track stack size: {selectedPlaylist.songs?.length || 0} modules
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePlayPlaylist(selectedPlaylist)}
                disabled={!selectedPlaylist.songs || selectedPlaylist.songs.length === 0}
                className="px-3 py-1.5 bg-accent text-bg-primary hover:bg-accent/90 border border-transparent rounded text-[10px] md:text-xs font-bold cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Play size={11} fill="currentColor" />
                <span>COMPILE</span>
              </button>
              <button
                onClick={() => handleDeletePlaylist(selectedPlaylist.id || selectedPlaylist._id, selectedPlaylist.name)}
                className="px-3 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded text-[10px] md:text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={11} />
                <span>RMDIR</span>
              </button>
            </div>
          </div>

          {/* Playlist Tracks Table */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider">tracks_registry</h3>
            {(!selectedPlaylist.songs || selectedPlaylist.songs.length === 0) ? (
              <div className="text-[11px] md:text-xs text-text-secondary italic p-4 border border-dashed border-border-color rounded text-center">
                No songs compiled in this playlist folder. Query and add tracks from the Search panel!
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {selectedPlaylist.songs.map((song, idx) => {
                  const songId = song.songId || song.id;
                  return (
                    <div 
                      key={songId + '-' + idx}
                      className="flex items-center justify-between p-2 rounded border border-border-color/30 bg-bg-secondary/20 hover:bg-bg-secondary/50 transition-all text-[11px] md:text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-[9px] text-text-secondary w-4 text-right">{idx + 1}.</span>
                        {song.image && (
                          <img src={song.image} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-text-primary truncate">{song.title}</span>
                          <span className="text-[9px] text-text-secondary truncate mt-0.5">{song.artist}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-text-secondary text-[10px] font-mono">
                          {formatDuration(song.duration)}
                        </span>
                        
                        <button 
                          onClick={() => handlePlayPlaylistSong(selectedPlaylist, idx)}
                          className="p-1 hover:text-accent cursor-pointer transition-colors text-text-secondary"
                        >
                          <Play size={12} fill="currentColor" />
                        </button>
                        
                        <button 
                          onClick={() => handleRemoveSong(selectedPlaylist.id || selectedPlaylist._id, songId)}
                          className="p-1 hover:text-red-400 cursor-pointer transition-colors text-text-secondary"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VIEW B: Sub Tabs content list */
        <div className="flex flex-col gap-5 md:gap-6">
          
          {/* Sub Tab 1: Playlists List */}
          {activeSubTab === 'playlists' && (
            <div className="flex flex-col gap-5 md:gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider">directories_folders</h3>
                <button
                  onClick={() => setShowPlForm(!showPlForm)}
                  className="px-2.5 py-1 bg-bg-secondary border border-border-color hover:border-accent hover:text-accent rounded text-[10px] md:text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Plus size={11} />
                  <span>mkdir playlist</span>
                </button>
              </div>

              {/* Create Playlist Form Panel */}
              {showPlForm && (
                <form onSubmit={handleCreatePlaylist} className="p-4 bg-bg-secondary/40 border border-border-color rounded-lg max-w-md flex flex-col gap-3">
                  <div className="text-[10px] font-bold text-accent uppercase tracking-wider">{"// New Playlist parameters"}</div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-text-secondary font-bold uppercase">playlist_name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. cyber_beats"
                      value={newPlName}
                      onChange={(e) => setNewPlName(e.target.value)}
                      className="bg-bg-tertiary border border-border-color rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-text-secondary font-bold uppercase">description_config</label>
                    <input
                      type="text"
                      placeholder="Optional details..."
                      value={newPlDesc}
                      onChange={(e) => setNewPlDesc(e.target.value)}
                      className="bg-bg-tertiary border border-border-color rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => setShowPlForm(false)}
                      className="px-2.5 py-1.5 border border-border-color text-text-secondary hover:text-text-primary rounded text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-accent text-bg-primary hover:bg-accent/90 rounded text-xs font-bold cursor-pointer"
                    >
                      Create
                    </button>
                  </div>
                </form>
              )}

              {/* Grid lists */}
              {playlists.length === 0 ? (
                <div className="text-[11px] md:text-xs text-text-secondary italic p-4 border border-dashed border-border-color rounded text-center">
                  {'No active playlist folders compiled. Click "mkdir playlist" to initialize one!'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {playlists.map((pl) => {
                    const plId = pl.id || pl._id;
                    return (
                      <div 
                        key={plId}
                        onClick={() => setSelectedPlaylist(pl)}
                        className="p-3.5 rounded-lg border bg-bg-secondary/30 border-border-color/60 hover-beam-card hover:bg-bg-secondary/80 hover:border-accent/30 hover:shadow-[0_0_12px_rgba(0,255,179,0.04)] cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded bg-accent/5 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                            <ListMusic size={18} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-xs md:text-sm font-semibold truncate text-text-primary">{pl.name}</h4>
                            <span className="text-[9px] md:text-[10px] text-text-secondary truncate mt-0.5">
                              {pl.songs?.length || 0} modules
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab 2: Favorites List */}
          {activeSubTab === 'favorites' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider">liked_favorites_stack</h3>
              {favorites.length === 0 ? (
                <div className="text-xs text-text-secondary italic">
                  No favorited track addresses cached.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {favorites.map((song) => (
                    <SongCard key={song.id} song={song} customQueue={favorites} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab 3: History List */}
          {activeSubTab === 'history' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider">recently_played_log</h3>
              {history.length === 0 ? (
                <div className="text-xs text-text-secondary italic">
                  No listening history logged yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {history.map((song) => (
                    <SongCard key={song.id} song={song} customQueue={history} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab 4: Downloads List */}
          {activeSubTab === 'downloads' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider">downloaded_iso_packages</h3>
              {downloads.length === 0 ? (
                <div className="text-xs text-text-secondary italic">
                  No offline downloaded bundles loaded.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {downloads.map((song) => (
                    <SongCard key={song.id} song={song} customQueue={downloads} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
