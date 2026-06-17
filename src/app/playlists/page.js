'use client';

import React, { useEffect, useState } from 'react';
import { usePlayer } from '@/lib/store';
import { motion } from 'framer-motion';
import SongCard from '@/components/SongCard';
import { 
  Terminal, 
  ListMusic, 
  Search, 
  Play, 
  ChevronLeft, 
  Disc, 
  Music,
  FolderOpen,
  Cpu
} from 'lucide-react';

export default function PlaylistsBrowser() {
  const { 
    playlists, 
    playSong, 
    addLog 
  } = usePlayer();

  const [curatedPlaylists, setCuratedPlaylists] = useState([]);
  const [loadingCurated, setLoadingCurated] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch curated playlists on mount from home proxy
  useEffect(() => {
    const fetchCurated = async () => {
      addLog('[SYSTEM] Loading curated global playlist registries...');
      try {
        const res = await fetch('/api/songs/home');
        if (res.ok) {
          const data = await res.json();
          if (data.topPlaylists) {
            setCuratedPlaylists(data.topPlaylists);
          }
          addLog('[SYSTEM] Curated global playlists resolved.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCurated(false);
      }
    };
    fetchCurated();
  }, []);

  const handleOpenPlaylistDetails = async (pl, isCustom = false) => {
    setSelectedPlaylist(null);
    setLoadingDetails(true);
    addLog(`[SYSTEM] Compiling details for playlist: "${pl.title || pl.name}"`);

    if (isCustom) {
      // Custom playlist tracks are already in state
      setSelectedPlaylist({
        id: pl.id || pl._id,
        title: pl.name,
        description: pl.description || 'Custom local directory.',
        isCustom: true,
        songs: pl.songs.map(s => ({
          id: s.songId || s.id,
          title: s.title,
          artist: s.artist,
          image: s.image,
          duration: s.duration,
          url: s.url
        }))
      });
      setLoadingDetails(false);
    } else {
      // Fetch curated playlist details on-demand
      try {
        const res = await fetch(`/api/songs/details?id=${pl.id}&type=playlist`);
        if (res.ok) {
          const json = await res.json();
          if (json.playlist) {
            setSelectedPlaylist({
              id: json.playlist.id,
              title: json.playlist.title,
              description: json.playlist.description || 'Curated external bundle.',
              isCustom: false,
              songs: json.playlist.songs
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handlePlayAll = (pl) => {
    if (!pl || !pl.songs || pl.songs.length === 0) return;
    addLog(`[PLAYBACK] Playing playlist stream: "${pl.title}"`);
    playSong(pl.songs[0], pl.songs);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter both groups by search term
  const filteredCustom = playlists.filter(p => p.name.toLowerCase().includes(searchFilter.toLowerCase()));
  const filteredCurated = curatedPlaylists.filter(p => p.title.toLowerCase().includes(searchFilter.toLowerCase()));

  return (
    <div className="p-4 md:p-8 font-mono select-none flex flex-col gap-5 md:gap-6 pb-20 md:pb-12">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-border-color pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="text-accent" size={14} />
          <span className="text-[11px] text-text-secondary">{"// EXPLORER: ROOT/ALL_PLAYLISTS.md"}</span>
        </div>
      </div>

      {selectedPlaylist ? (
        /* DETAIL SCREEN */
        <div className="flex flex-col gap-5 md:gap-6">
          <button 
            onClick={() => setSelectedPlaylist(null)}
            className="flex items-center gap-1 text-[11px] md:text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer self-start"
          >
            <ChevronLeft size={14} />
            <span>cd .. (Back to Directories)</span>
          </button>

          {/* Metadata Card */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-bg-secondary/40 border border-border-color/60 p-4 md:p-6 rounded-lg">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded bg-accent/5 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                <FolderOpen size={24} />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="text-sm md:text-base font-bold text-text-primary truncate">{selectedPlaylist.title}</h2>
                <p className="text-[10px] md:text-xs text-text-secondary truncate">{selectedPlaylist.description}</p>
                <span className="text-[9px] md:text-[10px] text-text-secondary mt-1 font-semibold">
                  Source type: {selectedPlaylist.isCustom ? 'LOCAL_DB' : 'JIOSAAVN_API'} | Size: {selectedPlaylist.songs?.length || 0} modules
                </span>
              </div>
            </div>

            <button
              onClick={() => handlePlayAll(selectedPlaylist)}
              disabled={!selectedPlaylist.songs || selectedPlaylist.songs.length === 0}
              className="px-3 py-1.5 bg-accent text-bg-primary hover:bg-accent/90 border border-transparent rounded text-[10px] md:text-xs font-bold cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              <Play size={11} fill="currentColor" />
              <span>COMPILE STREAM</span>
            </button>
          </div>

          {/* Songs list */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider">files_compiled</h3>
            {(!selectedPlaylist.songs || selectedPlaylist.songs.length === 0) ? (
              <div className="text-[11px] md:text-xs text-text-secondary italic p-4 border border-dashed border-border-color rounded text-center">
                No songs compiled in this folder.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedPlaylist.songs.map((song) => (
                  <SongCard key={song.id} song={song} customQueue={selectedPlaylist.songs} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MAIN LIST SCREEN */
        <div className="flex flex-col gap-5 md:gap-6">
          
          {/* Search/Filter Bar */}
          <div className="relative max-w-md w-full bg-bg-secondary/40 p-1 rounded-lg border border-border-color/60">
            <input
              type="text"
              placeholder="Filter playlists by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-1.5 pl-8 text-[11px] md:text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
            />
            <Search size={12} className="absolute left-3.5 top-3 text-text-secondary" />
          </div>

          {/* Loader */}
          {loadingDetails && (
            <div className="flex items-center gap-1.5 text-accent text-xs animate-pulse">
              <Cpu className="animate-spin" size={13} />
              <span>[COMPILING] Resolving directory track details...</span>
            </div>
          )}

          {/* Section 1: Custom Directories */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Disc size={12} />
              <span>Custom Local Directories ({filteredCustom.length})</span>
            </h3>
            {filteredCustom.length === 0 ? (
              <div className="text-xs text-text-secondary italic">No local playlist configurations found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredCustom.map((pl) => (
                  <div
                    key={pl.id || pl._id}
                    onClick={() => handleOpenPlaylistDetails(pl, true)}
                    className="p-3.5 rounded-lg border bg-bg-secondary/30 border-border-color/60 hover-beam-card hover:bg-bg-secondary/85 hover:border-accent/30 hover:shadow-[0_0_12px_rgba(0,255,179,0.04)] cursor-pointer transition-all flex items-center justify-between interactive-card"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded bg-accent/5 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                        <ListMusic size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-xs md:text-sm font-semibold truncate text-text-primary">{pl.name}</h4>
                        <span className="text-[10px] text-text-secondary truncate mt-0.5">{pl.songs?.length || 0} track modules</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Global Curated Directories */}
          <div className="flex flex-col gap-4 mt-2">
            <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Music size={12} />
              <span>Global Curated Directories ({filteredCurated.length})</span>
            </h3>

            {loadingCurated ? (
              <div className="text-xs text-accent animate-pulse">[QUERY RUNNING] Resolving global Jiosaavn streams...</div>
            ) : filteredCurated.length === 0 ? (
              <div className="text-xs text-text-secondary italic">No matching curated playlists found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredCurated.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => handleOpenPlaylistDetails(pl, false)}
                    className="p-3.5 rounded-lg border bg-bg-secondary/30 border-border-color/60 hover-beam-card hover:bg-bg-secondary/85 hover:border-accent/30 hover:shadow-[0_0_12px_rgba(0,255,179,0.04)] cursor-pointer transition-all flex items-center justify-between interactive-card"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-border-color/60">
                        <img src={pl.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-xs md:text-sm font-semibold truncate text-text-primary">{pl.title}</h4>
                        <span className="text-[10px] text-text-secondary truncate mt-0.5">{pl.subtitle || 'Global curated playlist'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
