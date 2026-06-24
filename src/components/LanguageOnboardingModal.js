'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '@/lib/store';
import { Terminal, Check, Music } from 'lucide-react';

export default function LanguageOnboardingModal() {
  const { languages, setLanguages, addLog, addToast } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    // Check if user has already onboarded their language selection
    const onboarded = localStorage.getItem('404_languages_onboarded');
    if (!onboarded) {
      // Set initial selections from current store state, default is ['english', 'tamil']
      setSelected(languages || ['english', 'tamil']);
      setIsOpen(true);
      addLog('[SYSTEM] Language onboarding required. Launching modal...');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const languagesList = [
    { id: 'english', label: 'English', desc: 'Global pop, Rock, Electronic' },
    { id: 'tamil', label: 'Tamil', desc: 'Kollywood hits, AR Rahman, Anirudh' },
    { id: 'hindi', label: 'Hindi', desc: 'Bollywood releases, Arijit Singh, Pritam' },
    { id: 'telugu', label: 'Telugu', desc: 'Tollywood tracks, Keeravani, Thaman' },
    { id: 'punjabi', label: 'Punjabi', desc: 'Bhangra beats, Diljit Dosanjh, AP Dhillon' },
    { id: 'malayalam', label: 'Malayalam', desc: 'Mollywood melodies, Sushin Shyam' },
    { id: 'kannada', label: 'Kannada', desc: 'Sandalwood hits, Arjun Janya, Vijay Prakash' },
  ];

  const handleToggle = (id) => {
    if (selected.includes(id)) {
      // Prevent emptying languages completely
      if (selected.length === 1) {
        addToast('Selection requirement: Choose at least one language', 'warning');
        return;
      }
      setSelected(selected.filter(l => l !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = () => {
    if (selected.length === 0) {
      addToast('Selection requirement: Choose at least one language', 'warning');
      return;
    }
    setLanguages(selected);
    localStorage.setItem('404_languages_onboarded', 'true');
    setIsOpen(false);
    addLog(`[SYSTEM] User selected languages: ${selected.join(', ').toUpperCase()}`);
    addToast('Preferences saved successfully!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[95] flex items-center justify-center p-4 font-mono select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-effect rounded-2xl w-full max-w-lg border border-accent/20 overflow-hidden shadow-[0_0_50px_rgba(0,255,179,0.15)]"
      >
        {/* Terminal Header */}
        <div className="h-11 bg-bg-tertiary border-b border-border-color/50 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-accent animate-pulse" />
            <span className="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider font-bold">
              {"// audio_stream_onboarding.sh"}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg md:text-xl font-black text-text-primary tracking-tight uppercase flex items-center gap-2">
              <Music className="text-accent" size={20} />
              <span>Configure Audio Prefs</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Choose your preferred song languages. This will customize your trending tracks, hot albums, and curated global playlists. Search will search across all languages.
            </p>
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
            {languagesList.map((lang) => {
              const isActive = selected.includes(lang.id);
              return (
                <div
                  key={lang.id}
                  onClick={() => handleToggle(lang.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-bg-secondary border-accent shadow-[0_0_12px_rgba(0,255,179,0.2)]'
                      : 'bg-bg-secondary/20 border-border-color/40 hover:bg-bg-secondary/60 hover:border-accent/20'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-2 font-sans">
                    <span className={`text-xs font-bold font-mono ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                      {lang.label}
                    </span>
                    <span className="text-[9px] text-text-secondary truncate">
                      {lang.desc}
                    </span>
                  </div>
                  {isActive ? (
                    <div className="w-4 h-4 rounded-full bg-accent text-bg-primary flex items-center justify-center flex-shrink-0">
                      <Check size={9} strokeWidth={4} />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-border-color flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2.5 bg-accent text-bg-primary hover:bg-accent/90 shadow-[0_0_20px_var(--accent-glow)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Initialize System Core</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
