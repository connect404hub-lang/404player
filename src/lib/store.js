'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const PlayerContext = createContext(null);

// Safe haptic feedback helper
const haptic = (ms = 25) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

export function PlayerProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [volume, setVolumeState] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // 'none' | 'all' | 'one'
  const [theme, setThemeState] = useState('cyber'); // 'cyber' | 'dark' | 'github'
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalTab, setTerminalTab] = useState('console');
  const [logs, setLogs] = useState([
    '[SYSTEM] Initializing 404player Kernel...',
    '[SYSTEM] Loading audio decoders... OK',
    '[SYSTEM] Theme set to CYBERPUNK NEON',
    '[SYSTEM] Ready. Enter developer guest mode or log in.'
  ]);

  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [history, setHistory] = useState([]);

  // Toast notification state
  const [toasts, setToasts] = useState([]);
  const toastTimersRef = useRef({});

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, variant: 'default', confirmLabel: '' });

  const audioRef = useRef(null);

  // Initialize audio element synchronously on first render (client-side)
  if (audioRef.current == null) {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
  }

  // Toast helpers
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    haptic(30);
    setToasts(prev => [{ id, message, type }, ...prev].slice(0, 5));

    // Auto-dismiss after 3.5s
    toastTimersRef.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete toastTimersRef.current[id];
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (toastTimersRef.current[id]) {
      clearTimeout(toastTimersRef.current[id]);
      delete toastTimersRef.current[id];
    }
  }, []);

  // Confirm modal helpers
  const showConfirmModal = useCallback(({ title, message, onConfirm, variant = 'default', confirmLabel = 'Confirm (Enter)' }) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant, confirmLabel });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, variant: 'default', confirmLabel: '' });
  }, []);



  // Add system console log
  const addLog = (text) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-99), `[${timestamp}] ${text}`]);
  };

  // Fetch logged in user details
  const fetchMe = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        addLog(`[AUTH] Welcome back, developer user "${data.user.username}"`);
        loadUserData(authToken);
      } else {
        localStorage.removeItem('404_token');
        setToken(null);
        loadGuestData();
      }
    } catch (err) {
      console.error(err);
      loadGuestData();
    }
  };

  // Load database items for logged-in user
  const loadUserData = async (authToken) => {
    const headers = { Authorization: `Bearer ${authToken}` };
    try {
      // History
      const histRes = await fetch('/api/history', { headers });
      if (histRes.ok) {
        const data = await histRes.json();
        setHistory(data.history || []);
      }
      // Favorites
      const favRes = await fetch('/api/history?type=favorite', { headers });
      if (favRes.ok) {
        const data = await favRes.json();
        setFavorites(data.favorites || []);
      }
      // Playlists
      const plRes = await fetch('/api/playlists', { headers });
      if (plRes.ok) {
        const data = await plRes.json();
        setPlaylists(data.playlists || []);
      }
      // Downloads
      const dlRes = await fetch('/api/downloads', { headers });
      if (dlRes.ok) {
        const data = await dlRes.json();
        setDownloads(data.downloads || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load guest local state
  const loadGuestData = () => {
    const localHistory = JSON.parse(localStorage.getItem('404_guest_history') || '[]');
    setHistory(localHistory);
    const localFavorites = JSON.parse(localStorage.getItem('404_guest_favorites') || '[]');
    setFavorites(localFavorites);
    const localPlaylists = JSON.parse(localStorage.getItem('404_guest_playlists') || '[]');
    setPlaylists(localPlaylists);
    const localDownloads = JSON.parse(localStorage.getItem('404_guest_downloads') || '[]');
    setDownloads(localDownloads);
    addLog('[AUTH] Guest compilation mounted. Profile data stored locally.');
  };

  // User Actions
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('404_token', authToken);
    addLog(`[AUTH] Logged in as: ${userData.username}`);
    addToast(`Authenticated as ${userData.username}`, 'success');
    loadUserData(authToken);
  };

  const logout = () => {
    showConfirmModal({
      title: 'Terminate Session',
      message: 'Are you sure you want to logout? Local guest mode will be activated and cloud-synced data will no longer be accessible.',
      variant: 'destructive',
      confirmLabel: 'exit 0 (Logout)',
      onConfirm: () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('404_token');
        addLog('[AUTH] User logged out. Switching back to guest session.');
        addToast('Session terminated. Guest mode active.', 'info');
        loadGuestData();
      },
    });
  };

  // Playback Control Functions
  const playSong = (song, newQueue = null) => {
    if (!song) return;
    
    addLog(`[PLAYBACK] Mounting: "${song.title}" by "${song.artist}"`);
    haptic(20);

    // Bless the audio element synchronously for mobile compatibility
    if (audioRef.current) {
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            audioRef.current.pause();
          }).catch(() => {});
        }
      } catch (e) {}
    }
    
    let targetQueue = queue;
    if (newQueue) {
      targetQueue = newQueue;
      setQueue(newQueue);
      localStorage.setItem('404_queue', JSON.stringify(newQueue));
    } else if (!queue.some(s => s.id === song.id)) {
      targetQueue = [...queue, song];
      setQueue(targetQueue);
    }

    const index = targetQueue.findIndex(s => s.id === song.id);
    setCurrentIndex(index);
    setCurrentSong(song);
    setIsPlaying(true);

    // Record listening history
    addSongToHistory(song);
  };

  const togglePlay = () => {
    if (!currentSong) return;
    haptic(15);
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);

    if (audioRef.current) {
      if (nextPlaying) {
        audioRef.current.play().catch(e => {
          addLog(`[ERROR] Audio playback failed: ${e.message}`);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
    addLog(`[PLAYBACK] Play state toggled to: ${nextPlaying ? 'PLAYING' : 'PAUSED'}`);
  };

  const nextSong = () => {
    if (queue.length === 0) return;
    
    let nextIdx = currentIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = repeat === 'all' ? 0 : -1;
    }

    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
      setCurrentSong(queue[nextIdx]);
      setIsPlaying(true);
      addLog(`[PLAYBACK] Next track triggered: "${queue[nextIdx].title}"`);
    } else {
      setIsPlaying(false);
      addLog('[PLAYBACK] End of queue queue stack reached.');
    }
  };

  const prevSong = () => {
    if (queue.length === 0) return;

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeat === 'all' ? queue.length - 1 : 0;
    }

    setCurrentIndex(prevIdx);
    setCurrentSong(queue[prevIdx]);
    setIsPlaying(true);
    addLog(`[PLAYBACK] Prev track triggered: "${queue[prevIdx].title}"`);
  };

  const addToQueue = (song) => {
    if (!song) return;
    if (queue.some(s => s.id === song.id)) {
      addLog(`[INFO] "${song.title}" is already present in queue stack.`);
      addToast(`"${song.title}" is already in the queue`, 'warning');
      return;
    }
    const updated = [...queue, song];
    setQueue(updated);
    localStorage.setItem('404_queue', JSON.stringify(updated));
    addLog(`[PLAYBACK] Appended to queue stack: "${song.title}"`);
    addToast(`Added "${song.title}" to queue`, 'success');
  };

  const removeFromQueue = (songId) => {
    const updated = queue.filter(s => s.id !== songId);
    setQueue(updated);
    localStorage.setItem('404_queue', JSON.stringify(updated));
    addLog(`[PLAYBACK] Removed song ID [${songId}] from queue stack.`);
  };

  const setVolume = (vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    localStorage.setItem('404_volume', clamped);
  };

  const setPlaybackSpeed = (speed) => {
    setPlaybackSpeedState(speed);
    localStorage.setItem('404_speed', speed);
    addLog(`[PLAYBACK] Speed scale factor configured: ${speed}x`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    addLog(`[PLAYBACK] Mute state toggled to: ${!isMuted ? 'MUTED' : 'UNMUTED'}`);
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
    addLog(`[PLAYBACK] Shuffle mode set to: ${!shuffle ? 'ON' : 'OFF'}`);
    addToast(`Shuffle ${!shuffle ? 'enabled' : 'disabled'}`, 'info');
  };

  const toggleRepeat = () => {
    let nextRepeat = 'none';
    if (repeat === 'none') nextRepeat = 'all';
    else if (repeat === 'all') nextRepeat = 'one';
    setRepeat(nextRepeat);
    addLog(`[PLAYBACK] Repeat mode updated: ${nextRepeat.toUpperCase()}`);
    addToast(`Repeat: ${nextRepeat === 'none' ? 'Off' : nextRepeat === 'all' ? 'All' : 'One'}`, 'info');
  };

  const setTheme = (themeName) => {
    setThemeState(themeName);
    localStorage.setItem('404_theme', themeName);
    addLog(`[SYSTEM] Client workspace stylesheet set to: ${themeName.toUpperCase()}`);
    addToast(`Theme applied: ${themeName.toUpperCase()}`, 'success');
  };

  // Sync Database / LocalStorage helpers
  const addSongToHistory = async (song) => {
    const historyItem = { ...song, playedAt: new Date().toISOString() };
    setHistory(prev => [historyItem, ...prev.filter(item => item.id !== song.id)].slice(0, 50));

    if (user && token) {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(song),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      const currentHist = JSON.parse(localStorage.getItem('404_guest_history') || '[]');
      const updatedHist = [historyItem, ...currentHist.filter(item => item.id !== song.id)].slice(0, 50);
      localStorage.setItem('404_guest_history', JSON.stringify(updatedHist));
    }
  };

  const toggleFavorite = async (song) => {
    const isFav = favorites.some(f => f.id === song.id);
    let updated;
    if (isFav) {
      updated = favorites.filter(f => f.id !== song.id);
      addLog(`[INFO] Removed from Favorites: "${song.title}"`);
      addToast(`Removed "${song.title}" from favorites`, 'info');
    } else {
      updated = [{ ...song, createdAt: new Date().toISOString() }, ...favorites];
      addLog(`[INFO] Added to Favorites: "${song.title}"`);
      addToast(`Added "${song.title}" to favorites`, 'success');
    }
    haptic(25);
    setFavorites(updated);

    if (user && token) {
      try {
        await fetch('/api/history?type=favorite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ song, action: isFav ? 'remove' : 'add' }),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('404_guest_favorites', JSON.stringify(updated));
    }
  };

  const addDownload = async (song) => {
    if (downloads.some(d => d.id === song.id)) {
      addLog(`[INFO] "${song.title}" already exists in downloads ledger.`);
      addToast(`"${song.title}" is already downloaded`, 'warning');
      return;
    }
    
    addLog(`[DOWNLOAD] Initializing audio chunk fetch for: "${song.title}"`);
    haptic(30);
    
    // Simulate buffer download & local storage log
    const dlItem = { ...song, downloadedAt: new Date().toISOString() };
    const updated = [dlItem, ...downloads];
    setDownloads(updated);

    if (user && token) {
      try {
        await fetch('/api/downloads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(song),
        });
        addLog(`[DOWNLOAD] Completed fetch. Track registry updated in database.`);
        addToast(`Downloaded "${song.title}"`, 'success');
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('404_guest_downloads', JSON.stringify(updated));
      addLog(`[DOWNLOAD] Completed fetch. Offline audio registry saved in localStorage.`);
      addToast(`Downloaded "${song.title}" to local storage`, 'success');
    }
  };

  const createPlaylist = async (name, description = '') => {
    if (!name) return;

    if (user && token) {
      try {
        const res = await fetch('/api/playlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description }),
        });
        if (res.ok) {
          const data = await res.json();
          setPlaylists(prev => [data.playlist, ...prev]);
          addLog(`[PLAYLIST] Created playlist: "${name}"`);
          addToast(`Playlist "${name}" created`, 'success');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const newPlaylist = {
        id: 'guest_pl_' + Math.random().toString(36).substr(2, 9),
        name,
        description,
        songs: [],
        createdAt: new Date().toISOString(),
      };
      const updated = [newPlaylist, ...playlists];
      setPlaylists(updated);
      localStorage.setItem('404_guest_playlists', JSON.stringify(updated));
      addLog(`[PLAYLIST] Created guest playlist: "${name}"`);
      addToast(`Playlist "${name}" created`, 'success');
    }
  };

  const deletePlaylist = async (playlistId) => {
    const targetPlaylist = playlists.find(p => (p.id || p._id) === playlistId);
    const playlistName = targetPlaylist?.name || 'Unknown';
    
    const updated = playlists.filter(p => (p.id || p._id) !== playlistId);
    setPlaylists(updated);
    addLog(`[PLAYLIST] Deleted playlist ID [${playlistId}]`);
    addToast(`Playlist "${playlistName}" deleted`, 'info');

    if (user && token) {
      try {
        await fetch(`/api/playlists?id=${playlistId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('404_guest_playlists', JSON.stringify(updated));
    }
  };

  const addSongToPlaylist = async (playlistId, song) => {
    const updated = playlists.map(pl => {
      const plId = pl.id || pl._id;
      if (plId === playlistId) {
        if (pl.songs.some(s => s.songId === song.id || s.id === song.id)) {
          addLog(`[INFO] "${song.title}" already exists in playlist "${pl.name}".`);
          addToast(`"${song.title}" already in "${pl.name}"`, 'warning');
          return pl;
        }
        addToast(`Added "${song.title}" to "${pl.name}"`, 'success');
        return {
          ...pl,
          songs: [...pl.songs, { ...song, songId: song.id, addedAt: new Date().toISOString() }],
        };
      }
      return pl;
    });

    setPlaylists(updated);
    addLog(`[PLAYLIST] Appended "${song.title}" to playlist.`);

    if (user && token) {
      try {
        await fetch(`/api/playlists?id=${playlistId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ song, action: 'add' }),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('404_guest_playlists', JSON.stringify(updated));
    }
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    const updated = playlists.map(pl => {
      const plId = pl.id || pl._id;
      if (plId === playlistId) {
        return {
          ...pl,
          songs: pl.songs.filter(s => (s.songId || s.id) !== songId),
        };
      }
      return pl;
    });

    setPlaylists(updated);
    addLog(`[PLAYLIST] Removed song ID [${songId}] from playlist.`);

    if (user && token) {
      try {
        await fetch(`/api/playlists?id=${playlistId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ songId, action: 'remove' }),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('404_guest_playlists', JSON.stringify(updated));
    }
  };

  // Cleanup toast timers on unmount
  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Initialize audio element on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('404_volume');
      const savedSpeed = localStorage.getItem('404_speed');
      const savedTheme = localStorage.getItem('404_theme');
      const savedToken = localStorage.getItem('404_token');

      setTimeout(() => {
        if (savedVolume !== null) setVolumeState(parseFloat(savedVolume));
        if (savedSpeed !== null) setPlaybackSpeedState(parseFloat(savedSpeed));
        if (savedTheme !== null) setThemeState(savedTheme);

        if (savedToken) {
          setToken(savedToken);
          fetchMe(savedToken);
        } else {
          // Load offline guest items
          loadGuestData();
        }
      }, 0);
    }
  }, []);

  // Sync theme to body element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Sync state changes to audio element
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Fetch song details if URL is missing (e.g., from global autocomplete search)
  useEffect(() => {
    if (!currentSong || currentSong.url) return;

    let active = true;
    const fetchDetails = async () => {
      addLog(`[PLAYBACK] Missing stream URL. Fetching node details for ID [${currentSong.id}]...`);
      try {
        const res = await fetch(`/api/songs/details?id=${currentSong.id}&type=song`);
        if (res.ok && active) {
          const data = await res.json();
          if (data.song && data.song.url) {
            addLog(`[PLAYBACK] Successfully compiled node details for: "${data.song.title}"`);
            const resolved = data.song;
            setCurrentSong(resolved);
            setQueue(prev => prev.map(s => s.id === resolved.id ? resolved : s));
          } else {
            addLog(`[ERROR] Song details compilation returned empty URL.`);
          }
        }
      } catch (err) {
        addLog(`[ERROR] Details fetch failed: ${err.message}`);
      }
    };
    
    fetchDetails();

    return () => {
      active = false;
    };
  }, [currentSong]);

  useEffect(() => {
    if (!audioRef.current || !currentSong?.url) return;
    
    const wasPlaying = isPlaying;
    audioRef.current.src = currentSong.url;
    audioRef.current.load();
    
    if (wasPlaying) {
      audioRef.current.play().catch(e => {
        addLog(`[ERROR] Audio playback failed to start: ${e.message}`);
        setIsPlaying(false);
      });
    }
  }, [currentSong]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (audioRef.current.src) {
        audioRef.current.play().catch(e => {
          addLog(`[ERROR] Audio playback failed: ${e.message}`);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Audio event listeners
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      addLog(`[INFO] Completed playback: "${currentSong?.title}"`);
      if (repeat === 'one') {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } else {
        nextSong();
      }
    };

    const handleError = (e) => {
      addLog(`[ERROR] Playback stream failed for: "${currentSong?.title}"`);
      setIsPlaying(false);
    };

    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handleError);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, [queue, currentIndex, repeat, currentSong]);

  return (
    <PlayerContext.Provider
      value={{
        user,
        token,
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        volume,
        playbackSpeed,
        isMuted,
        shuffle,
        repeat,
        theme,
        showTerminal,
        terminalTab,
        logs,
        favorites,
        playlists,
        downloads,
        history,
        audioRef,
        toasts,
        confirmModal,
        login,
        logout,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        addToQueue,
        removeFromQueue,
        setQueue,
        setVolume,
        setPlaybackSpeed,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        setTheme,
        addLog,
        toggleFavorite,
        addDownload,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        setShowTerminal,
        setTerminalTab,
        addToast,
        removeToast,
        showConfirmModal,
        closeConfirmModal,
        haptic,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
