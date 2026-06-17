'use client';

import React, { useState } from 'react';
import { usePlayer } from '@/lib/store';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Palette, 
  Settings2, 
  Info,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, addLog } = usePlayer();

  const [toggleStates, setToggleStates] = useState({
    autoplay: true,
    prefetch: true,
    glow: true,
  });

  const themes = [
    { id: 'cyber', label: 'Cyber Neon', desc: 'Dark theme with glowing neon teal accents' },
    { id: 'github', label: 'GitHub Dark', desc: 'Inspired by GitHub dark interface' },
    { id: 'synthwave', label: 'Synthwave', desc: 'Neon pink and retro purple gradients' },
  ];

  const handleThemeChange = (id) => {
    setTheme(id);
    addLog(`[SYSTEM] Applied active stylesheet configuration: ${id.toUpperCase()}`);
  };

  return (
    <div className="p-4 md:p-8 font-mono select-none flex flex-col gap-5 md:gap-6 pb-20 md:pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border-color pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="text-accent" size={14} />
          <span className="text-[11px] text-text-secondary">// PREFERENCES: SETTINGS.json</span>
        </div>
      </div>

      <div className="max-w-2xl flex flex-col gap-6 md:gap-8">
        
        {/* Section 1: Themes */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={14} />
            <span>01. theme_config</span>
          </h3>

          <div className="flex flex-col gap-3">
            {themes.map((t) => {
              const isActive = theme === t.id;
              return (
                <div 
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isActive 
                      ? 'bg-bg-secondary border-accent shadow-[0_0_10px_var(--accent-glow)]' 
                      : 'bg-bg-secondary/30 border-border-color/60 hover:bg-bg-secondary/80 hover:border-accent/30'
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <h4 className={`text-xs md:text-sm font-semibold ${isActive ? 'text-accent' : 'text-text-primary'}`}>{t.label}</h4>
                    <span className="text-[11px] md:text-xs text-text-secondary">{t.desc}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-5 h-5 rounded-full bg-accent text-bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_var(--accent-glow)]"
                    >
                      <Check size={11} strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Audio Settings (Visual Mock Checks) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Settings2 size={14} />
            <span>02. playback_flags</span>
          </h3>

          <div className="bg-bg-secondary/30 border border-border-color/60 rounded-lg p-4 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-text-primary block">AUTOPLAY_NEXT</span>
                <span className="text-text-secondary text-[10px] md:text-[11px] block mt-0.5">Automatically pull the next queue slot upon completion</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-[10px] font-mono">{toggleStates.autoplay ? '1' : '0'}</span>
                <div
                  onClick={() => {
                    const next = !toggleStates.autoplay;
                    setToggleStates(s => ({...s, autoplay: next}));
                    addLog(`[SYSTEM] AUTOPLAY_NEXT updated to: ${next}`);
                  }}
                  className={`dev-toggle ${toggleStates.autoplay ? 'active' : ''}`}
                />
              </div>
            </div>
            
            <div className="w-full h-[1px] bg-border-color/40" />

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-text-primary block">PRE_FETCH_METADATA</span>
                <span className="text-text-secondary text-[10px] md:text-[11px] block mt-0.5">Decrypt stream targets asynchronously before next song</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-[10px] font-mono">{toggleStates.prefetch ? '1' : '0'}</span>
                <div
                  onClick={() => {
                    const next = !toggleStates.prefetch;
                    setToggleStates(s => ({...s, prefetch: next}));
                    addLog(`[SYSTEM] PRE_FETCH_METADATA updated to: ${next}`);
                  }}
                  className={`dev-toggle ${toggleStates.prefetch ? 'active' : ''}`}
                />
              </div>
            </div>
            
            <div className="w-full h-[1px] bg-border-color/40" />

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-text-primary block">CYBER_GLOW_EFFECTS</span>
                <span className="text-text-secondary text-[10px] md:text-[11px] block mt-0.5">Enable active borders, shadows, and scanlines filters</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-[10px] font-mono">{toggleStates.glow ? '1' : '0'}</span>
                <div
                  onClick={() => {
                    const next = !toggleStates.glow;
                    setToggleStates(s => ({...s, glow: next}));
                    addLog(`[SYSTEM] CYBER_GLOW_EFFECTS updated to: ${next}`);
                  }}
                  className={`dev-toggle ${toggleStates.glow ? 'active' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Diagnostic Specs */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Info size={14} />
            <span>03. system_diagnostics</span>
          </h3>

          <div className="bg-bg-tertiary border border-border-color rounded-lg p-4 flex flex-col gap-2 text-[10px] text-text-secondary leading-loose">
            <div><span className="text-accent">RUNTIME_PLATFORM:</span> Next.js App Router (Node.js 18+)</div>
            <div><span className="text-accent">DATABASE_URI:</span> mongodb://127.0.0.1:27017/404player</div>
            <div><span className="text-accent">CIPHER_ALGORITHM:</span> Pure JS DES-ECB Decryption Engine</div>
            <div><span className="text-accent">API_ENDPOINTS_RESOLVED:</span> /api/songs/*, /api/auth/*, /api/playlists, /api/history</div>
          </div>
        </div>

      </div>
    </div>
  );
}
