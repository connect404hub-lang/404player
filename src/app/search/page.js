'use client';

import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/lib/store';
import { motion } from 'framer-motion';
import SongCard from '@/components/SongCard';
import DirectoryExplorer from '@/components/DirectoryExplorer';
import { 
  Search, 
  Terminal, 
  Disc, 
  ListMusic, 
  Music, 
  Loader,
  FolderOpen,
  History
} from 'lucide-react';

export default function SearchPage() {
  const { playSong, addLog } = usePlayer();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('global'); // 'global' | 'songs' | 'albums' | 'playlists'
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [explorerTarget, setExplorerTarget] = useState(null); // { id, type }
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('404_recent_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  const addToRecents = (term) => {
    if (!term || !term.trim()) return;
    const trimmed = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      localStorage.setItem('404_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const triggerSearch = async (term = query, type = searchType) => {
    if (!term.trim()) return;
    
    setLoading(true);
    setError('');
    addLog(`[SHELL] Executing query: search.exe --type=${type} "${term}"`);
    addToRecents(term);

    try {
      const res = await fetch(`/api/songs/search?query=${encodeURIComponent(term)}&type=${type}`);
      if (res.ok) {
        const json = await res.json();
        setResults(json);
        addLog(`[SHELL] Query success. Fetched matches successfully.`);
      } else {
        setError('Search directory error.');
        addLog(`[ERROR] Search directory compilation failed.`);
      }
    } catch (e) {
      setError('Connection socket timeout.');
      addLog(`[ERROR] Timeout during search.exe execution.`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  const handleTabChange = (type) => {
    setSearchType(type);
    if (query) {
      triggerSearch(query, type);
    }
  };

  return (
    <div className="p-4 md:p-8 font-mono select-none flex flex-col gap-5 md:gap-6 pb-20 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="text-accent" size={14} />
          <span className="text-[11px] text-text-secondary">{"// SOURCE: ROOT/SEARCH.sh"}</span>
        </div>
      </div>

      {/* Input panel */}
      <div className="flex gap-2.5 bg-bg-secondary/40 p-3 md:p-4 rounded-lg border border-border-color/60 max-w-2xl">
        <div className="relative flex-1">
          <input
            id="search-query-input"
            type="text"
            placeholder="Search songs, albums, or playlists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 pl-9 text-[11px] md:text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
          />
          <Search size={13} className="absolute left-3 top-3.5 md:top-3 text-text-secondary" />
        </div>
        <button
          onClick={() => triggerSearch()}
          className="px-3.5 md:px-5 py-2 bg-accent text-bg-primary hover:bg-accent/90 border border-transparent rounded text-xs font-bold shadow-[0_0_10px_var(--accent-glow)] active:scale-[0.98] transition-all cursor-pointer"
        >
          EXECUTE
        </button>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !loading && (
        <div className="flex flex-col gap-3 max-w-2xl mt-1">
          <div className="flex items-center justify-between border-b border-border-color/40 pb-1.5">
            <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold flex items-center gap-1.5">
              <History size={11} className="text-accent" />
              {"// RECENT_SEARCHES"}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem('404_recent_searches');
                setRecentSearches([]);
                addLog('[SYSTEM] Search history cleared.');
              }}
              className="text-[9px] text-red-400 hover:underline uppercase tracking-wider font-bold cursor-pointer bg-transparent border-none p-0"
            >
              [CLEAR_HISTORY]
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(term);
                  triggerSearch(term, searchType);
                }}
                className="px-2.5 py-1 bg-bg-secondary/40 border border-border-color/60 hover:border-accent hover:text-accent rounded text-[10px] md:text-xs text-text-secondary font-mono transition-all cursor-pointer hover:bg-bg-secondary/85"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border-color gap-1 bg-bg-tertiary/20 p-1 rounded max-w-md w-full">
        {['global', 'songs', 'albums', 'playlists'].map((type) => (
          <button
            key={type}
            onClick={() => handleTabChange(type)}
            className={`flex-1 md:flex-initial px-3 py-1.5 text-[10px] md:text-xs font-semibold rounded cursor-pointer transition-colors uppercase ${
              searchType === type ? 'bg-bg-secondary text-accent border border-border-color' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-accent text-xs mt-2 animate-pulse">
          <Loader className="animate-spin" size={13} />
          <span>[QUERY RUNNING] Searching metadata indices...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-red-500 text-xs mt-2">
          [SEARCH ERROR] {error}
        </div>
      )}

      {/* Results rendering */}
      {!loading && results && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 md:gap-8 mt-2"
        >
          
          {/* Section 1: Songs */}
          {((searchType === 'global' && results.songs?.length > 0) || searchType === 'songs') && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Music size={12} />
                <span>Matches Found: Songs ({results.songs?.length || 0})</span>
              </h3>
              
              {results.songs?.length === 0 ? (
                <div className="text-xs text-text-secondary italic">No song logs found.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {results.songs?.map((song) => (
                    <SongCard key={song.id} song={song} customQueue={results.songs} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Albums */}
          {((searchType === 'global' && results.albums?.length > 0) || searchType === 'albums') && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Disc size={12} />
                <span>Matches Found: Albums ({results.albums?.length || 0})</span>
              </h3>

              {results.albums?.length === 0 ? (
                <div className="text-xs text-text-secondary italic">No album folders found.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {results.albums?.map((album) => (
                    <div 
                      key={album.id}
                      onClick={() => setExplorerTarget({ id: album.id, type: 'album' })}
                      className="group p-3 rounded-lg border bg-bg-secondary/30 border-border-color/60 hover-beam-card hover:bg-bg-secondary/80 hover:border-accent hover:shadow-[0_0_12px_rgba(0,255,179,0.04)] cursor-pointer transition-all duration-300 interactive-card"
                    >
                      <div className="relative aspect-square w-full rounded overflow-hidden bg-bg-tertiary mb-3 group-hover:scale-[1.01] transition-transform duration-300">
                        <img src={album.image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] border border-accent text-accent bg-accent/5 px-2.5 py-1 rounded tracking-wider uppercase font-bold shadow-[0_0_5px_var(--accent-glow)] flex items-center gap-1">
                            <FolderOpen size={10} />
                            <span>OPEN ALBUM</span>
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs md:text-sm font-semibold truncate text-text-primary group-hover:text-accent transition-colors">
                        {album.title}
                      </h4>
                      <p className="text-[10px] md:text-xs text-text-secondary truncate mt-1">
                        {album.artist || 'Unknown Artist'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Playlists */}
          {((searchType === 'global' && results.playlists?.length > 0) || searchType === 'playlists') && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                <ListMusic size={12} />
                <span>Matches Found: Playlists ({results.playlists?.length || 0})</span>
              </h3>

              {results.playlists?.length === 0 ? (
                <div className="text-xs text-text-secondary italic">No playlist indices found.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {results.playlists?.map((playlist) => (
                    <div 
                      key={playlist.id}
                      onClick={() => setExplorerTarget({ id: playlist.id, type: 'playlist' })}
                      className="group p-3 rounded-lg border bg-bg-secondary/30 border-border-color/60 hover-beam-card hover:bg-bg-secondary/80 hover:border-accent hover:shadow-[0_0_12px_rgba(0,255,179,0.04)] cursor-pointer transition-all duration-300 interactive-card"
                    >
                      <div className="relative aspect-square w-full rounded overflow-hidden bg-bg-tertiary mb-3 group-hover:scale-[1.01] transition-transform duration-300">
                        <img src={playlist.image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] border border-accent text-accent bg-accent/5 px-2.5 py-1 rounded tracking-wider uppercase font-bold shadow-[0_0_5px_var(--accent-glow)] flex items-center gap-1">
                            <FolderOpen size={10} />
                            <span>OPEN PLAYLIST</span>
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs md:text-sm font-semibold truncate text-text-primary group-hover:text-accent transition-colors">
                        {playlist.title}
                      </h4>
                      <p className="text-[10px] md:text-xs text-text-secondary truncate mt-1">
                        {playlist.subtitle || 'Curated Playlist'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Directory details modal drawer overlay */}
      {explorerTarget && (
        <DirectoryExplorer 
          id={explorerTarget.id} 
          type={explorerTarget.type} 
          onClose={() => setExplorerTarget(null)} 
        />
      )}

    </div>
  );
}
