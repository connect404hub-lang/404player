'use client';

import React from 'react';
import { usePlayer } from '@/lib/store';
import { motion } from 'framer-motion';
import { Play, Pause, Music, ShieldCheck } from 'lucide-react';

export default function SongCard({ song, customQueue = null }) {
  const { currentSong, isPlaying, playSong, togglePlay, haptic } = usePlayer();
  const isCurrent = currentSong?.id === song.id;

  const handleAction = (e) => {
    e.stopPropagation();
    haptic(15);
    if (isCurrent) togglePlay();
    else playSong(song, customQueue);
  };

  return (
    <motion.div
      onClick={handleAction}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`group relative flex flex-col p-3 rounded-2xl border transition-all duration-500 ${
        isCurrent 
        ? 'bg-accent/5 border-accent shadow-[0_0_25px_rgba(var(--accent-rgb),0.1)]' 
        : 'bg-white/[0.02] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.05]'
      }`}
    >
      {/* Artwork Area */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-white/[0.03]">
        {song.image ? (
          <img 
            src={song.image} 
            alt={song.title} 
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isCurrent && isPlaying ? 'brightness-50 blur-[2px]' : ''}`} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <Music size={24} />
          </div>
        )}
        
        {/* Play State Indicator Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 bg-black/40'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCurrent ? 'bg-accent scale-100 shadow-[0_0_15px_var(--accent)]' : 'bg-white/10 backdrop-blur-md scale-75 group-hover:scale-100'}`}>
             {isCurrent && isPlaying ? (
               <Pause size={20} fill="currentColor" className="text-bg-primary" />
             ) : (
               <Play size={20} fill="currentColor" className="text-bg-primary ml-1" />
             )}
          </div>
        </div>

        {/* Small Data Chip */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1">
           <ShieldCheck size={8} className="text-accent" />
           <span className="text-[7px] text-white/50 font-bold tracking-tighter">SECURED_NODE</span>
        </div>
      </div>

      {/* Track Metadata */}
      <div className="px-1 flex flex-col gap-0.5">
        <h4 className={`text-[13px] font-bold truncate tracking-tight transition-colors ${isCurrent ? 'text-accent' : 'text-white/90 group-hover:text-accent'}`}>
          {song.title}
        </h4>
        <div className="flex items-center justify-between gap-2">
           <p className="text-[11px] text-white/40 truncate flex-1">{song.artist}</p>
           {isCurrent && isPlaying && (
             <div className="flex items-center gap-[2px] h-3">
               {[0.1, 0.2, 0.3].map((delay, i) => (
                 <motion.div key={i} animate={{ height: [2, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay }} className="w-[1.5px] bg-accent rounded-full" />
               ))}
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}
