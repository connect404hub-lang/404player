'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PlayerContext = createContext(null);

// Zustand Persistent Store Definition
const usePlayerStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentSong: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      volume: 0.8,
      playbackSpeed: 1,
      isMuted: false,
      shuffle: false,
      repeat: 'none',
      theme: 'cyber',
      showTerminal: false,
      terminalTab: 'console',
      logs: [
        '[SYSTEM] Initializing 404player Kernel...',
        '[SYSTEM] Loading audio decoders... OK',
        '[SYSTEM] Theme set to CYBERPUNK NEON',
        '[SYSTEM] Ready. Enter developer guest mode or log in.'
      ],
      favorites: [],
      playlists: [],
      downloads: [],
      history: [],
      toasts: [],
      confirmModal: { isOpen: false, title: '', message: '', onConfirm: null, variant: 'default', confirmLabel: '' },
      pwaPrompt: null,
      isInstallable: false,
      isStandalone: false,
      isIOS: false,
      tourActive: false,
      tourStep: 0,
      mobileDockOpen: false,
      languages: ['english', 'tamil'],
      setLanguages: (languages) => set({ languages }),

      // State setters
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setCurrentSong: (currentSong) => set({ currentSong }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setQueue: (queue) => set({ queue }),
      setCurrentIndex: (currentIndex) => set({ currentIndex }),
      setVolume: (volume) => set({ volume }),
      setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
      setIsMuted: (isMuted) => set({ isMuted }),
      setShuffle: (shuffle) => set({ shuffle }),
      setRepeat: (repeat) => set({ repeat }),
      setTheme: (theme) => set({ theme }),
      setShowTerminal: (showTerminal) => set({ showTerminal }),
      setTerminalTab: (terminalTab) => set({ terminalTab }),
      setLogs: (logs) => set({ logs }),
      setFavorites: (favorites) => set({ favorites }),
      setPlaylists: (playlists) => set({ playlists }),
      setDownloads: (downloads) => set({ downloads }),
      setHistory: (history) => set({ history }),
      setToasts: (toasts) => set({ toasts }),
      setConfirmModal: (confirmModal) => set({ confirmModal }),
      setPwaPrompt: (pwaPrompt) => set({ pwaPrompt, isInstallable: !!pwaPrompt }),
      setIsStandalone: (isStandalone) => set({ isStandalone }),
      setIsIOS: (isIOS) => set({ isIOS }),
      setTourActive: (tourActive) => set({ tourActive }),
      setTourStep: (tourStep) => set({ tourStep }),
      setMobileDockOpen: (mobileDockOpen) => set({ mobileDockOpen }),
    }),
    {
      name: '404player-store-v1',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        currentSong: state.currentSong,
        isPlaying: state.isPlaying,
        queue: state.queue,
        currentIndex: state.currentIndex,
        volume: state.volume,
        playbackSpeed: state.playbackSpeed,
        isMuted: state.isMuted,
        shuffle: state.shuffle,
        repeat: state.repeat,
        theme: state.theme,
        showTerminal: state.showTerminal,
        terminalTab: state.terminalTab,
        logs: state.logs,
        favorites: state.favorites,
        playlists: state.playlists,
        downloads: state.downloads,
        history: state.history,
        languages: state.languages,
      }),
    }
  )
);

// Safe haptic feedback helper
const haptic = (ms = 25) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

export function PlayerProvider({ children }) {
  const store = usePlayerStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Use rehydrated store values on the client, and defaults on the server/first paint
  const user = isHydrated ? store.user : null;
  const setUser = store.setUser;

  const token = isHydrated ? store.token : null;
  const setToken = store.setToken;

  const currentSong = isHydrated ? store.currentSong : null;
  const setCurrentSong = store.setCurrentSong;

  const isPlaying = isHydrated ? store.isPlaying : false;
  const setIsPlaying = store.setIsPlaying;

  const queue = isHydrated ? store.queue : [];
  const setQueue = store.setQueue;

  const currentIndex = isHydrated ? store.currentIndex : -1;
  const setCurrentIndex = store.setCurrentIndex;

  const volume = isHydrated ? store.volume : 0.8;
  const setVolumeState = store.setVolume;

  const playbackSpeed = isHydrated ? store.playbackSpeed : 1;
  const setPlaybackSpeedState = store.setPlaybackSpeed;

  const isMuted = isHydrated ? store.isMuted : false;
  const setIsMuted = store.setIsMuted;

  const shuffle = isHydrated ? store.shuffle : false;
  const setShuffle = store.setShuffle;

  const repeat = isHydrated ? store.repeat : 'none';
  const setRepeat = store.setRepeat;

  const theme = isHydrated ? store.theme : 'cyber';
  const setThemeState = store.setTheme;

  const languages = isHydrated ? store.languages : ['english', 'tamil'];
  const setLanguagesState = store.setLanguages;

  const showTerminal = isHydrated ? store.showTerminal : false;
  const setShowTerminal = store.setShowTerminal;

  const terminalTab = isHydrated ? store.terminalTab : 'console';
  const setTerminalTab = store.setTerminalTab;

  const pwaPrompt = isHydrated ? store.pwaPrompt : null;
  const setPwaPrompt = store.setPwaPrompt;
  const isInstallable = isHydrated ? store.isInstallable : false;
  const isStandalone = isHydrated ? store.isStandalone : false;
  const setIsStandalone = store.setIsStandalone;
  const isIOS = isHydrated ? store.isIOS : false;
  const setIsIOS = store.setIsIOS;

  const tourActive = isHydrated ? store.tourActive : false;
  const setTourActive = store.setTourActive;
  const tourStep = isHydrated ? store.tourStep : 0;
  const setTourStep = store.setTourStep;

  const mobileDockOpen = isHydrated ? store.mobileDockOpen : false;
  const setMobileDockOpen = store.setMobileDockOpen;

  const logs = isHydrated ? store.logs : [];
  const setLogs = store.setLogs;

  const favorites = isHydrated ? store.favorites : [];
  const setFavorites = store.setFavorites;

  const playlists = isHydrated ? store.playlists : [];
  const setPlaylists = store.setPlaylists;

  const downloads = isHydrated ? store.downloads : [];
  const setDownloads = store.setDownloads;

  const history = isHydrated ? store.history : [];
  const setHistory = store.setHistory;

  const toasts = store.toasts;
  const setToasts = store.setToasts;

  const confirmModal = store.confirmModal;
  const setConfirmModal = store.setConfirmModal;

  const toastTimersRef = useRef({});
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
    usePlayerStore.setState(state => ({
      toasts: [{ id, message, type }, ...state.toasts].slice(0, 5)
    }));

    // Auto-dismiss after 3.5s
    toastTimersRef.current[id] = setTimeout(() => {
      usePlayerStore.setState(state => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
      delete toastTimersRef.current[id];
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    usePlayerStore.setState(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
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
  const addLog = useCallback((text) => {
    const timestamp = new Date().toLocaleTimeString();
    usePlayerStore.setState(state => ({
      logs: [...state.logs.slice(-99), `[${timestamp}] ${text}`]
    }));
  }, []);

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
      }
    } catch (err) {
      console.error(err);
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
      },
    });
  };

  // Sync Database / LocalStorage helpers
  const addSongToHistory = useCallback(async (song) => {
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
  }, [user, token]);

  // Playback Control Functions
  const playSong = useCallback((song, newQueue = null) => {
    if (!song) return;
    
    addLog(`[PLAYBACK] Mounting: "${song.title}" by "${song.artist}"`);
    haptic(20);

    // Set source and start play synchronously to satisfy browser user-gesture requirements
    if (audioRef.current && song.url) {
      try {
        audioRef.current.src = song.url;
        audioRef.current.load();
        audioRef.current.play().catch(e => {
          addLog(`[ERROR] Audio play failed: ${e.message}`);
        });
      } catch (e) {
        addLog(`[ERROR] Audio load failed: ${e.message}`);
      }
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
  }, [queue, audioRef, addLog, addSongToHistory]);

  const togglePlay = useCallback(() => {
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
  }, [currentSong, isPlaying, audioRef, addLog]);

  const nextSong = useCallback(() => {
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
  }, [queue, currentIndex, shuffle, repeat, addLog]);

  const prevSong = useCallback(() => {
    if (queue.length === 0) return;

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeat === 'all' ? queue.length - 1 : 0;
    }

    setCurrentIndex(prevIdx);
    setCurrentSong(queue[prevIdx]);
    setIsPlaying(true);
    addLog(`[PLAYBACK] Prev track triggered: "${queue[prevIdx].title}"`);
  }, [queue, currentIndex, repeat, addLog]);

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

  const setLanguages = (langs) => {
    setLanguagesState(langs);
    addLog(`[SYSTEM] Client language preferences set to: ${langs.join(', ').toUpperCase()}`);
    addToast(`Languages updated: ${langs.join(', ').toUpperCase()}`, 'success');
  };

  // Sync Database / LocalStorage helpers

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

  // Initialize audio element / authenticate user on store hydration
  useEffect(() => {
    if (isHydrated) {
      // Legacy migration check on first launch
      const legacyToken = localStorage.getItem('404_token');
      const activeToken = token || legacyToken;

      if (legacyToken && !token) {
        setToken(legacyToken);
      }

      if (activeToken) {
        fetchMe(activeToken);
      } else {
        // Migrate legacy guest data to Zustand store if present and store is empty
        const legacyFavs = localStorage.getItem('404_guest_favorites');
        if (legacyFavs && favorites.length === 0) {
          setFavorites(JSON.parse(legacyFavs));
        }
        const legacyPlaylists = localStorage.getItem('404_guest_playlists');
        if (legacyPlaylists && playlists.length === 0) {
          setPlaylists(JSON.parse(legacyPlaylists));
        }
        const legacyHistory = localStorage.getItem('404_guest_history');
        if (legacyHistory && history.length === 0) {
          setHistory(JSON.parse(legacyHistory));
        }
        const legacyDownloads = localStorage.getItem('404_guest_downloads');
        if (legacyDownloads && downloads.length === 0) {
          setDownloads(JSON.parse(legacyDownloads));
        }

        addLog('[AUTH] Offline guest workspace mounted. Profile data stored locally.');
      }

      // Check if onboarding tour is completed, else trigger it
      const tourCompleted = localStorage.getItem('404_tour_completed');
      if (!tourCompleted) {
        const timer = setTimeout(() => {
          setTourActive(true);
          setTourStep(0);
          addLog('[SYSTEM] Onboarding sequence initialized. First-time session detected.');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isHydrated, setTourActive, setTourStep, addLog]);

  // Sync theme to body element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Global PWA installation lifecycle listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Standalone checking
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator.standalone === true);
    setIsStandalone(isStandaloneMode);

    // 2. beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setPwaPrompt(e);
      addLog('[SYSTEM] PWA installation criteria satisfied. Local installer ready.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !/lkcontext/.test(userAgent);
    if (isIOSDevice) {
      setIsIOS(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isHydrated, setPwaPrompt, setIsStandalone, setIsIOS, addLog]);

  const triggerPwaInstall = useCallback(async () => {
    if (!pwaPrompt) return;
    haptic(40);
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    addLog(`[SYSTEM] PWA installation user outcome: ${outcome.toUpperCase()}`);
    if (outcome === 'accepted') {
      setPwaPrompt(null);
    }
  }, [pwaPrompt, addLog, setPwaPrompt]);

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

  // Proactive background pre-fetcher for the next track in the queue
  useEffect(() => {
    if (queue.length === 0 || currentIndex === -1) return;
    const nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) return;

    const nextSongItem = queue[nextIdx];
    if (!nextSongItem || nextSongItem.url) return;

    let active = true;
    const prefetchNext = async () => {
      try {
        const res = await fetch(`/api/songs/details?id=${nextSongItem.id}&type=song`);
        if (res.ok && active) {
          const data = await res.json();
          if (data.song && data.song.url) {
            const resolved = data.song;
            // Update the next song inside the queue state to cache its stream URL
            setQueue(prev => prev.map((s, idx) => idx === nextIdx ? { ...s, url: resolved.url } : s));
            addLog(`[PLAYBACK] Proactively pre-fetched stream URL for next track: "${resolved.title}"`);
          }
        }
      } catch (e) {
        console.error('Pre-fetch failed:', e);
      }
    };

    prefetchNext();

    return () => {
      active = false;
    };
  }, [queue, currentIndex, addLog]);

  // Unified audio element synchronizer to prevent race conditions during track updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong?.url) {
      if (isPlaying) {
        setIsPlaying(false);
      }
      return;
    }

    const isSrcChanged = audio.src !== currentSong.url;

    if (isSrcChanged) {
      audio.src = currentSong.url;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(e => {
        // Ignore AbortError caused by changing src/loading a new track asynchronously
        if (e.name === 'AbortError' || e.message.includes('interrupted')) {
          return;
        }
        addLog(`[ERROR] Audio playback failed: ${e.message}`);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentSong, isPlaying, addLog]);

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
  }, [queue, currentIndex, repeat, currentSong, nextSong]);

  return (
    <PlayerContext.Provider
      value={{
        user,
        token,
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        setCurrentIndex,
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
        languages,
        setLanguages,
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
        pwaPrompt,
        isInstallable,
        isStandalone,
        isIOS,
        triggerPwaInstall,
        tourActive,
        setTourActive,
        tourStep,
        setTourStep,
        mobileDockOpen,
        setMobileDockOpen,
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
