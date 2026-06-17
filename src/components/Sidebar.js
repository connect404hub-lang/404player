'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, Search, Database, ListMusic, Settings, 
  Terminal, ShieldAlert, User, LogOut, Zap
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, showTerminal, setShowTerminal, addLog, haptic, currentSong, isPlaying } = usePlayer();
  const [hovered, setHovered] = useState(null);

  const navItems = [
    { id: 'home', icon: Folder, path: '/', label: 'Explorer' },
    { id: 'search', icon: Search, path: '/search', label: 'Search' },
    { id: 'playlists', icon: ListMusic, path: '/playlists', label: 'Playlists' },
    { id: 'library', icon: Database, path: '/library', label: 'Library' },
    { id: 'settings', icon: Settings, path: '/settings', label: 'Settings' },
  ];

  const isAdmin = user && user.role === 'admin';

  const handleNav = (path) => {
    haptic(15);
    router.push(path);
  };

  return (
    <div className="w-full h-[64px] md:w-[60px] md:h-full bg-[#080b12]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/[0.06] flex flex-row md:flex-col justify-between items-center px-2 md:px-0 py-0 md:py-3 flex-shrink-0 z-30 select-none order-last md:order-first">
      
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden flex items-center justify-around w-full h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.path)}
              whileTap={{ scale: 0.85 }}
              className={`relative w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 ${
                isActive ? 'text-accent' : 'text-[#4a5568] hover:text-[#8892a4]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-glow-mobile"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(var(--accent-rgb), 0.08)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={19} strokeWidth={isActive ? 2 : 1.6} />
            </motion.button>
          );
        })}

        {/* Console (Terminal) Toggle */}
        <motion.button
          onClick={() => { haptic(15); setShowTerminal(!showTerminal); }}
          whileTap={{ scale: 0.85 }}
          className={`relative w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 ${
            showTerminal ? 'text-accent' : 'text-[#4a5568] hover:text-[#8892a4]'
          }`}
        >
          {showTerminal && (
            <motion.div 
              layoutId="nav-glow-mobile" 
              className="absolute inset-0 rounded-xl" 
              style={{ background: 'rgba(var(--accent-rgb), 0.08)' }} 
              transition={{ type: 'spring', stiffness: 380, damping: 30 }} 
            />
          )}
          <Terminal size={19} strokeWidth={showTerminal ? 2 : 1.6} />
        </motion.button>

        {/* Admin Section (if admin) */}
        {isAdmin && (
          <motion.button 
            onClick={() => handleNav('/admin')} 
            whileTap={{ scale: 0.85 }} 
            className={`relative w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all ${
              pathname === '/admin' ? 'text-red-400' : 'text-[#4a5568] hover:text-red-400/70'
            }`}
          >
            {pathname === '/admin' && (
              <motion.div 
                layoutId="nav-glow-mobile" 
                className="absolute inset-0 rounded-xl" 
                style={{ background: 'rgba(239, 68, 68, 0.08)' }} 
                transition={{ type: 'spring', stiffness: 380, damping: 30 }} 
              />
            )}
            <ShieldAlert size={19} />
          </motion.button>
        )}

        {/* User profile / Login */}
        {user ? (
          <motion.button 
            onClick={() => handleNav('/auth')} 
            whileTap={{ scale: 0.9 }} 
            className="relative w-11 h-11 flex items-center justify-center cursor-pointer"
          >
            <div 
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border transition-all ${
                pathname === '/auth' ? 'text-accent border-accent' : 'text-accent/80 border-accent/25'
              }`} 
              style={{ background: 'rgba(var(--accent-rgb), 0.08)' }}
            >
              {user.username.substring(0, 2)}
            </div>
            <div className="absolute bottom-1 right-1 w-[6px] h-[6px] rounded-full bg-emerald-500 border border-[#080b12]" />
          </motion.button>
        ) : (
          <motion.button 
            onClick={() => handleNav('/auth')} 
            whileTap={{ scale: 0.85 }} 
            className={`relative w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all ${
              pathname === '/auth' ? 'text-accent' : 'text-[#4a5568] hover:text-[#8892a4]'
            }`}
          >
            {pathname === '/auth' && (
              <motion.div 
                layoutId="nav-glow-mobile" 
                className="absolute inset-0 rounded-xl" 
                style={{ background: 'rgba(var(--accent-rgb), 0.08)' }} 
                transition={{ type: 'spring', stiffness: 380, damping: 30 }} 
              />
            )}
            <User size={19} />
          </motion.button>
        )}
      </div>

      {/* DESKTOP SIDEBAR - MAIN NAVIGATION */}
      <div className="hidden md:flex flex-col items-center justify-start w-full gap-0.5 h-auto">
        {/* Logo */}
        <motion.div 
          onClick={() => handleNav('/')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-lg items-center justify-center cursor-pointer mb-3 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.15), rgba(var(--accent-rgb), 0.04))' }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(var(--accent-rgb), 0.3), transparent 70%)' }} />
          <Zap size={15} className="text-accent relative z-10" />
        </motion.div>

        <div className="w-7 h-px bg-white/[0.04] mx-auto mb-1" />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.path)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              whileTap={{ scale: 0.85 }}
              className={`relative w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 ${
                isActive 
                  ? 'text-accent' 
                  : 'text-[#4a5568] hover:text-[#8892a4]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(var(--accent-rgb), 0.08)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="nav-bar"
                  className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full bg-accent"
                  style={{ boxShadow: '0 0 8px var(--accent), 0 0 16px rgba(var(--accent-rgb), 0.2)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={18} strokeWidth={isActive ? 2 : 1.6} className="relative z-10" />

              <AnimatePresence>
                {hovered === item.id && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="absolute left-[52px] bg-[#111827] border border-white/[0.08] text-[11px] text-white/80 px-2.5 py-1 rounded-md shadow-xl z-[60] font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        <div className="w-7 h-px bg-white/[0.04] mx-auto my-1" />

        {/* Terminal */}
        <motion.button
          onClick={() => { haptic(15); setShowTerminal(!showTerminal); }}
          onMouseEnter={() => setHovered('term')}
          onMouseLeave={() => setHovered(null)}
          whileTap={{ scale: 0.85 }}
          className={`relative w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 ${
            showTerminal ? 'text-accent' : 'text-[#4a5568] hover:text-[#8892a4]'
          }`}
        >
          {showTerminal && <motion.div layoutId="nav-glow" className="absolute inset-0 rounded-lg" style={{ background: 'rgba(var(--accent-rgb), 0.08)' }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
          <Terminal size={18} strokeWidth={showTerminal ? 2 : 1.6} className="relative z-10" />
          <AnimatePresence>
            {hovered === 'term' && (
              <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="absolute left-[52px] bg-[#111827] border border-white/[0.08] text-[11px] text-white/80 px-2.5 py-1 rounded-md shadow-xl z-[60] font-medium">Console</motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {isAdmin && (
          <motion.button onClick={() => handleNav('/admin')} whileTap={{ scale: 0.85 }} className={`relative w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all ${pathname === '/admin' ? 'text-red-400' : 'text-[#4a5568] hover:text-red-400/70'}`}>
            <ShieldAlert size={18} />
          </motion.button>
        )}
      </div>

      {/* DESKTOP SIDEBAR - BOTTOM SECTION */}
      <div className="hidden md:flex flex-col items-center gap-1.5 px-1">
        {currentSong && (
          <div className="flex items-center justify-center w-10 h-5">
            <div className="flex items-center gap-[2px]">
              {[0,1,2,3].map(i => (
                <motion.div key={i} animate={isPlaying ? { height: [2, 8, 4, 10, 2] } : { height: 2 }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }} className="w-[2px] bg-accent/70 rounded-full" style={{ height: 2 }} />
              ))}
            </div>
          </div>
        )}

        {user ? (
          <>
            <motion.button onClick={() => handleNav('/auth')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} className="relative w-10 h-10 flex items-center justify-center cursor-pointer">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold uppercase text-accent border border-accent/25" style={{ background: 'rgba(var(--accent-rgb), 0.08)' }}>
                {user.username.substring(0, 2)}
              </div>
              <div className="absolute bottom-0.5 right-0.5 w-[6px] h-[6px] rounded-full bg-emerald-500 border border-[#080b12]" />
            </motion.button>
            <motion.button onClick={logout} whileTap={{ scale: 0.85 }} className="w-10 h-10 flex items-center justify-center text-[#4a5568] hover:text-red-400/80 rounded-lg cursor-pointer transition-colors">
              <LogOut size={15} />
            </motion.button>
          </>
        ) : (
          <motion.button onClick={() => handleNav('/auth')} whileTap={{ scale: 0.85 }} className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all ${pathname === '/auth' ? 'text-accent' : 'text-[#4a5568] hover:text-[#8892a4]'}`}>
            <User size={18} />
          </motion.button>
        )}
      </div>
    </div>
  );
}
