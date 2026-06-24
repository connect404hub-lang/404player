"use client";

import React, { useState, useEffect } from "react";
import { usePlayer } from "@/lib/store";
import { motion } from "framer-motion";
import SongCard from "@/components/SongCard";
import DirectoryExplorer from "@/components/DirectoryExplorer";
import {
  Search,
  Terminal,
  Disc,
  ListMusic,
  Music,
  Loader,
  FolderOpen,
  History,
} from "lucide-react";

export default function SearchPage() {
  const { playSong, addLog, setQueue, setCurrentIndex, languages } = usePlayer();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("global"); // 'global' | 'songs' | 'albums' | 'playlists'
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [explorerTarget, setExplorerTarget] = useState(null); // { id, type }
  const [recentSearches, setRecentSearches] = useState([]);

  const langQuery = languages ? languages.join(",") : "english,tamil";

  // Featured content states (Trending content when search results are empty)
  const [featuredData, setFeaturedData] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  // Suggestion states
  const [suggestions, setSuggestions] = useState({ topquery: [], songs: [], artists: [], albums: [], playlists: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Fetch featured content on mount
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      try {
        const res = await fetch(`/api/songs/home?language=${encodeURIComponent(langQuery)}`);
        if (res.ok) {
          const json = await res.json();
          setFeaturedData(json);
        }
      } catch (e) {
        console.error("Failed to fetch featured content", e);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, [langQuery]);

  useEffect(() => {
    const stored = localStorage.getItem("404_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions({ topquery: [], songs: [], artists: [], albums: [], playlists: [] });
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/songs/suggest?query=${encodeURIComponent(query)}&language=${encodeURIComponent(langQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          const hasData = 
            (data.topquery?.length > 0) ||
            (data.songs?.length > 0) ||
            (data.artists?.length > 0) ||
            (data.albums?.length > 0) ||
            (data.playlists?.length > 0);
          setShowSuggestions(hasData);
          setActiveSuggestionIndex(-1);
        }
      } catch (e) {
        console.error("Failed to fetch suggestions", e);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, langQuery]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest("#search-query-container")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const addToRecents = (term) => {
    if (!term || !term.trim()) return;
    const trimmed = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (t) => t.toLowerCase() !== trimmed.toLowerCase(),
      );
      const updated = [trimmed, ...filtered].slice(0, 8);
      localStorage.setItem("404_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const triggerSearch = async (term = query, type = searchType, autoPlayId = null) => {
    if (!term.trim()) return;

    setLoading(true);
    setError("");
    addLog(`[SHELL] Executing query: search.exe --type=${type} "${term}"`);
    addToRecents(term);

    try {
      const res = await fetch(
        `/api/songs/search?query=${encodeURIComponent(term)}&type=${type}`,
      );
      if (res.ok) {
        const json = await res.json();
        console.log(json);
        setResults(json);
        addLog(`[SHELL] Query success. Fetched matches successfully.`);

        if (autoPlayId && json.songs && json.songs.length > 0) {
          const songIndex = json.songs.findIndex((s) => s.id === autoPlayId);
          if (songIndex !== -1) {
            setQueue(json.songs);
            setCurrentIndex(songIndex);
            addLog(`[SYSTEM] Synchronized player queue with search matches. Index: ${songIndex}`);
          }
        }
      } else {
        setError("Search directory error.");
        addLog(`[ERROR] Search directory compilation failed.`);
      }
    } catch (e) {
      setError("Connection socket timeout.");
      addLog(`[ERROR] Timeout during search.exe execution.`);
    } finally {
      setLoading(false);
    }
  };

  const playSongById = async (id) => {
    try {
      addLog(`[SYSTEM] Initializing audio fetch for song ID: ${id}`);
      const res = await fetch(`/api/songs/details?id=${id}&type=song`);
      if (res.ok) {
        const json = await res.json();
        if (json.song) {
          addLog(`[SYSTEM] Audio decrypted. Playing track: "${json.song.title}"`);
          playSong(json.song, [json.song]);
        }
      } else {
        addLog(`[ERROR] Decryption error for song ID: ${id}`);
      }
    } catch (e) {
      console.error("Failed to play song from suggestion", e);
      addLog(`[ERROR] Connection error fetching song ID: ${id}`);
    }
  };

  const getFlatSuggestions = () => {
    if (!suggestions) return [];
    const list = [];
    
    if (suggestions.topquery?.length > 0) {
      list.push(...suggestions.topquery.map(item => ({ ...item, headerName: "Top Result" })));
    }
    if (suggestions.songs?.length > 0) {
      list.push(...suggestions.songs.map(item => ({ ...item, headerName: "Songs" })));
    }
    if (suggestions.artists?.length > 0) {
      list.push(...suggestions.artists.map(item => ({ ...item, headerName: "Artists" })));
    }
    if (suggestions.albums?.length > 0) {
      list.push(...suggestions.albums.map(item => ({ ...item, headerName: "Albums" })));
    }
    if (suggestions.playlists?.length > 0) {
      list.push(...suggestions.playlists.map(item => ({ ...item, headerName: "Playlists" })));
    }
    
    return list;
  };

  const flatSuggestions = getFlatSuggestions();

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    if (item.type === "song") {
      setQuery(item.title);
      playSong(item, [item]);
      triggerSearch(item.title, "songs", item.id);
    } else if (item.type === "album") {
      setQuery(item.title);
      setExplorerTarget({ id: item.id, type: "album" });
      triggerSearch(item.title, "albums");
    } else if (item.type === "playlist") {
      setQuery(item.title);
      setExplorerTarget({ id: item.id, type: "playlist" });
      triggerSearch(item.title, "playlists");
    } else if (item.type === "artist") {
      setQuery(item.title);
      triggerSearch(item.title, "global");
    } else {
      setQuery(item.title);
      triggerSearch(item.title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (showSuggestions && activeSuggestionIndex >= 0 && activeSuggestionIndex < flatSuggestions.length) {
        e.preventDefault();
        const selected = flatSuggestions[activeSuggestionIndex];
        handleSuggestionClick(selected);
      } else {
        setShowSuggestions(false);
        triggerSearch();
      }
    } else if (e.key === "ArrowDown") {
      if (showSuggestions && flatSuggestions.length > 0) {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < flatSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      if (showSuggestions && flatSuggestions.length > 0) {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : flatSuggestions.length - 1
        );
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
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
          <span className="text-[11px] text-text-secondary">
            {"// SOURCE: ROOT/SEARCH.sh"}
          </span>
        </div>
      </div>

      {/* Input panel */}
      <div className="flex gap-2.5 bg-bg-secondary/40 p-3 md:p-4 rounded-lg border border-border-color/60 max-w-2xl">
        <div id="search-query-container" className="relative flex-1">
          <input
            id="search-query-input"
            type="text"
            placeholder="Search songs, albums, or playlists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim().length >= 2 && flatSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onClick={() => {
              if (query.trim().length >= 2 && flatSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            autoComplete="off"
            className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 pl-9 text-[11px] md:text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
          />
          <Search
            size={13}
            className="absolute left-3 top-3.5 md:top-3 text-text-secondary"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && flatSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-bg-secondary/95 backdrop-blur-md border border-border-color rounded shadow-[0_4px_30px_rgba(0,0,0,0.6)] z-50 overflow-hidden divide-y divide-border-color/30 max-h-[28rem] overflow-y-auto custom-scrollbar">
              {flatSuggestions.map((item, idx) => {
                const prevItem = idx > 0 ? flatSuggestions[idx - 1] : null;
                const showHeader = !prevItem || prevItem.headerName !== item.headerName;
                
                const getSuggestionSubtitle = (i) => {
                  if (i.type === "song") {
                    return i.artist || i.subtitle || "Song";
                  }
                  if (i.type === "artist") {
                    return "Artist";
                  }
                  if (i.type === "album") {
                    return i.description || "Album";
                  }
                  if (i.type === "playlist") {
                    return i.subtitle ? `Playlist · ${i.subtitle}` : "Playlist";
                  }
                  return i.subtitle || i.description || "";
                };

                return (
                  <React.Fragment key={`${item.headerName}-${item.id || idx}`}>
                    {showHeader && (
                      <div className="px-3 py-1.5 bg-bg-tertiary/40 text-[9px] text-accent font-bold uppercase tracking-wider select-none font-mono border-t border-border-color/20 first:border-t-0">
                        {item.headerName}
                      </div>
                    )}
                    <div
                      onClick={() => handleSuggestionClick(item)}
                      onMouseEnter={() => setActiveSuggestionIndex(idx)}
                      className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all text-[11px] md:text-xs font-mono select-none border-l-2 ${
                        activeSuggestionIndex === idx
                          ? "bg-accent/10 border-accent text-accent font-bold pl-4"
                          : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/20"
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className={`object-cover border border-border-color/40 flex-shrink-0 ${
                            item.type === "artist" ? "rounded-full w-7 h-7" : "w-7 h-7 rounded"
                          }`}
                        />
                      ) : (
                        <div className={`bg-bg-tertiary/60 border border-border-color/40 flex items-center justify-center text-text-secondary flex-shrink-0 ${
                          item.type === "artist" ? "rounded-full w-7 h-7" : "w-7 h-7 rounded"
                        }`}>
                          <Music size={12} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-text-primary">
                          {item.title}
                        </div>
                        <div className="text-[9px] text-text-secondary truncate mt-0.5">
                          {getSuggestionSubtitle(item)}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setShowSuggestions(false);
            triggerSearch();
          }}
          className="px-3.5 md:px-5 py-2 bg-accent text-bg-primary hover:bg-accent/90 border border-transparent rounded text-xs font-bold shadow-[0_0_10px_var(--accent-glow)] active:scale-[0.98] transition-all cursor-pointer flex-shrink-0"
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
                localStorage.removeItem("404_recent_searches");
                setRecentSearches([]);
                addLog("[SYSTEM] Search history cleared.");
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
        {["global", "songs", "albums", "playlists"].map((type) => (
          <button
            key={type}
            onClick={() => handleTabChange(type)}
            className={`flex-1 md:flex-initial px-3 py-1.5 text-[10px] md:text-xs font-semibold rounded cursor-pointer transition-colors uppercase ${
              searchType === type
                ? "bg-bg-secondary text-accent border border-border-color"
                : "text-text-secondary hover:text-text-primary"
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
        <div className="text-red-500 text-xs mt-2">[SEARCH ERROR] {error}</div>
      )}

      {/* Featured / Trending Content (JioSaavn/Spotify Style when no search results) */}
      {!loading && !results && featuredData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 md:gap-8 mt-2"
        >
          {/* Section: Trending Now (Songs) */}
          {featuredData.trending?.filter(item => item.type === "song").length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Music size={12} />
                <span>Trending Now</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {featuredData.trending
                  .filter(item => item.type === "song")
                  .slice(0, 12)
                  .map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      customQueue={featuredData.trending.filter(item => item.type === "song")}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Section: Hot New Releases (Albums) */}
          {featuredData.newReleases?.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Disc size={12} />
                <span>Hot Albums</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {featuredData.newReleases.slice(0, 6).map((album) => (
                  <div
                    key={album.id}
                    onClick={() =>
                      setExplorerTarget({ id: album.id, type: "album" })
                    }
                    className="group p-3 rounded-lg border bg-bg-secondary/30 border-border-color/60 hover-beam-card hover:bg-bg-secondary/80 hover:border-accent hover:shadow-[0_0_12px_rgba(0,255,179,0.04)] cursor-pointer transition-all duration-300 interactive-card"
                  >
                    <div className="relative aspect-square w-full rounded overflow-hidden bg-bg-tertiary mb-3 group-hover:scale-[1.01] transition-transform duration-300">
                      <img
                        src={album.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
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
                      {album.artist || "Unknown Artist"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading featured placeholder */}
      {loadingFeatured && (
        <div className="flex items-center gap-2 text-accent text-xs mt-4 animate-pulse">
          <Loader className="animate-spin" size={13} />
          <span>[SYSTEM] Querying trending modules...</span>
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
          {((searchType === "global" && results.songs?.length > 0) ||
            searchType === "songs") && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Music size={12} />
                <span>Matches Found: Songs ({results.songs?.length || 0})</span>
              </h3>

              {results.songs?.length === 0 ? (
                <div className="text-xs text-text-secondary italic">
                  No song logs found.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {results.songs?.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      customQueue={results.songs}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Albums */}
          {((searchType === "global" && results.albums?.length > 0) ||
            searchType === "albums") && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Disc size={12} />
                <span>
                  Matches Found: Albums ({results.albums?.length || 0})
                </span>
              </h3>

              {results.albums?.length === 0 ? (
                <div className="text-xs text-text-secondary italic">
                  No album folders found.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {results.albums?.map((album) => (
                    <div
                      key={album.id}
                      onClick={() =>
                        setExplorerTarget({ id: album.id, type: "album" })
                      }
                      className="group p-3 rounded-lg border bg-bg-secondary/30 border-border-color/60 hover-beam-card hover:bg-bg-secondary/80 hover:border-accent hover:shadow-[0_0_12px_rgba(0,255,179,0.04)] cursor-pointer transition-all duration-300 interactive-card"
                    >
                      <div className="relative aspect-square w-full rounded overflow-hidden bg-bg-tertiary mb-3 group-hover:scale-[1.01] transition-transform duration-300">
                        <img
                          src={album.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
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
                        {album.artist || "Unknown Artist"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Playlists */}
          {((searchType === "global" && results.playlists?.length > 0) ||
            searchType === "playlists") && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest flex items-center gap-1.5">
                <ListMusic size={12} />
                <span>
                  Matches Found: Playlists ({results.playlists?.length || 0})
                </span>
              </h3>

              {results.playlists?.length === 0 ? (
                <div className="text-xs text-text-secondary italic">
                  No playlist indices found.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {results.playlists?.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() =>
                        setExplorerTarget({ id: playlist.id, type: "playlist" })
                      }
                      className="group p-3 rounded-lg border bg-bg-secondary/30 border-border-color/60 hover-beam-card hover:bg-bg-secondary/80 hover:border-accent hover:shadow-[0_0_12px_rgba(0,255,179,0.04)] cursor-pointer transition-all duration-300 interactive-card"
                    >
                      <div className="relative aspect-square w-full rounded overflow-hidden bg-bg-tertiary mb-3 group-hover:scale-[1.01] transition-transform duration-300">
                        <img
                          src={playlist.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
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
                        {playlist.subtitle || "Curated Playlist"}
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
