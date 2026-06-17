'use client';

import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/lib/store';
import SongCard from '@/components/SongCard';
import DirectoryExplorer from '@/components/DirectoryExplorer';
import { Cpu, Zap, FolderOpen, ChevronRight, Disc, ListMusic } from 'lucide-react';

function useHomeData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/songs/home')
      .then(res => {
        if (!res.ok) throw new Error('Home API failed');
        return res.json();
      })
      .then(json => {
        setData({
          trendingSongs: json.trending.filter(item => item.type === 'song'),
          albums: json.newReleases || [],
          playlists: json.topPlaylists || []
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

const SectionHeader = ({ title, path }) => (
  <div className="flex items-center justify-between mb-6 border-b border-white/[0.05] pb-3">
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 bg-accent shadow-[0_0_10px_var(--accent)]" />
      <div>
        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/90">{title}</h3>
        <p className="text-[8px] text-white/20 font-mono mt-0.5">LOCATION: {path}</p>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const { data, loading } = useHomeData();
  const [explorerTarget, setExplorerTarget] = useState(null);

  if (loading) {
    return (
      <div className="flex flex-col gap-12 select-none animate-pulse">
        <div className="w-full h-64 md:h-80 rounded-3xl bg-white/[0.02] border border-white/[0.04] flex items-end p-8">
          <div className="flex flex-col gap-3 max-w-md w-full">
            <div className="w-24 h-3 bg-white/10 rounded" />
            <div className="w-3/4 h-8 bg-white/10 rounded" />
            <div className="w-1/2 h-4 bg-white/10 rounded" />
          </div>
        </div>
        <div>
          <div className="w-48 h-6 bg-white/[0.03] rounded-md mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col gap-3">
                <div className="w-full aspect-square bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
                <div className="w-3/4 h-3 bg-white/10 rounded" />
                <div className="w-1/2 h-2.5 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 select-none pb-20">
      {/* Hero Module */}
      <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden glass-panel flex items-end p-8 group">
         <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent z-10" />
         <div className="absolute top-0 right-0 p-8 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu size={200} className="text-accent" />
         </div>
         
         <div className="relative z-20 max-w-2xl">
            <div className="flex items-center gap-2 text-accent text-[10px] font-bold tracking-widest uppercase mb-4">
               <Zap size={14} className="fill-current" />
               Kernel_Priority_Stream
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tighter">
              UNLEASH THE <span className="text-accent">WAVEFORMS.</span>
            </h1>
            <p className="text-sm text-white/40 max-w-md font-semibold leading-relaxed font-sans">
              Decrypted audio streams from the core. High-fidelity playback with integrated diagnostic logging.
            </p>
         </div>
      </section>

      {/* Section 1: Trending Tracks */}
      {data?.trendingSongs && data.trendingSongs.length > 0 && (
        <section>
          <SectionHeader title="Trending_Modules" path="root/trending" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {data.trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} customQueue={data.trendingSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Albums (Fresh Compiles) */}
      {data?.albums && data.albums.length > 0 && (
        <section>
          <SectionHeader title="Fresh_Compiles" path="root/albums" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {data.albums.map((album) => (
              <div 
                key={album.id}
                onClick={() => setExplorerTarget({ id: album.id, type: 'album' })}
                className="group relative flex flex-col p-3 rounded-2xl border bg-white/[0.02] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 cursor-pointer"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-white/[0.03]">
                  <img src={album.image} alt={album.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] border border-accent text-accent bg-accent/5 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 font-sans">
                      <FolderOpen size={10} />
                      <span>OPEN ALBUM</span>
                    </span>
                  </div>
                </div>
                <h4 className="text-[13px] font-bold truncate tracking-tight transition-colors group-hover:text-accent">
                  {album.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5 text-white/40">
                  <Disc size={10} />
                  <p className="text-[11px] truncate flex-1">{album.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Playlists (Curated Packages) */}
      {data?.playlists && data.playlists.length > 0 && (
        <section>
          <SectionHeader title="Curated_Packages" path="root/playlists" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {data.playlists.map((playlist) => (
              <div 
                key={playlist.id}
                onClick={() => setExplorerTarget({ id: playlist.id, type: 'playlist' })}
                className="group relative flex flex-col p-3 rounded-2xl border bg-white/[0.02] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 cursor-pointer"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-white/[0.03]">
                  <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] border border-accent text-accent bg-accent/5 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 font-sans">
                      <FolderOpen size={10} />
                      <span>OPEN PLAYLIST</span>
                    </span>
                  </div>
                </div>
                <h4 className="text-[13px] font-bold truncate tracking-tight transition-colors group-hover:text-accent">
                  {playlist.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5 text-white/40">
                  <ListMusic size={10} />
                  <p className="text-[11px] truncate flex-1">{playlist.subtitle || 'System list'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Directory Details Modal */}
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
