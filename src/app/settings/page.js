"use client";

import React, { useState } from "react";
import { usePlayer } from "@/lib/store";
import { motion } from "framer-motion";
import {
  Terminal,
  Palette,
  Settings2,
  Info,
  Check,
  Download,
  Music,
} from "lucide-react";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    addLog,
    isInstallable,
    isStandalone,
    isIOS,
    triggerPwaInstall,
    setTourActive,
    setTourStep,
    languages,
    setLanguages,
    addToast,
  } = usePlayer();

  const [toggleStates, setToggleStates] = useState({
    autoplay: true,
    prefetch: true,
    glow: true,
  });

  const languagesList = [
    { id: "english", label: "English" },
    { id: "tamil", label: "Tamil" },
    { id: "hindi", label: "Hindi" },
    { id: "telugu", label: "Telugu" },
    { id: "punjabi", label: "Punjabi" },
    { id: "malayalam", label: "Malayalam" },
    { id: "kannada", label: "Kannada" },
  ];

  const handleLanguageToggle = (id) => {
    if (languages?.includes(id)) {
      if (languages.length === 1) {
        addToast("Choose at least one language preference", "warning");
        return;
      }
      setLanguages(languages.filter((l) => l !== id));
    } else {
      setLanguages([...(languages || []), id]);
    }
  };

  const themes = [
    {
      id: "cyber",
      label: "Cyber Neon",
      desc: "Dark theme with glowing neon teal accents",
    },
    {
      id: "github",
      label: "GitHub Dark",
      desc: "Inspired by GitHub dark interface",
    },
    {
      id: "synthwave",
      label: "Synthwave",
      desc: "Neon pink and retro purple gradients",
    },
    {
      id: "glass-dark",
      label: "Fluid Glass (Dark)",
      desc: "Consumer dark theme with smooth glassmorphism and pink accents",
    },
    {
      id: "glass-light",
      label: "Fluid Glass (Light)",
      desc: "Minimalist light theme with soft shadows and indigo accents",
    },
    // { id: 'liquid-glass-dark', label: 'Liquid Glass (Dark)', desc: 'Ultra-translucent dark theme with fluid animated gradients & cyan borders' },
    // { id: 'liquid-glass-light', label: 'Liquid Glass (Light)', desc: 'Ultra-translucent light theme with pastel animated gradients & violet borders' },
  ];

  const handleThemeChange = (id) => {
    setTheme(id);
    addLog(
      `[SYSTEM] Applied active stylesheet configuration: ${id.toUpperCase()}`,
    );
  };

  return (
    <div className="p-4 md:p-8 font-mono select-none flex flex-col gap-5 md:gap-6 pb-20 md:pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border-color pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="text-accent" size={14} />
          <span className="text-[11px] text-text-secondary">
            {"// PREFERENCES: SETTINGS.json"}
          </span>
        </div>
      </div>

      <div className="max-w-2xl flex flex-col gap-6 md:gap-8">
        {/* Section 1: Themes */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={14} />
            <span>01. theme_config</span>
          </h3>

          <div id="settings-theme-selector" className="flex flex-col gap-3">
            {themes.map((t) => {
              const isActive = theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isActive
                      ? "bg-bg-secondary border-accent shadow-[0_0_10px_var(--accent-glow)]"
                      : "bg-bg-secondary/30 border-border-color/60 hover:bg-bg-secondary/80 hover:border-accent/30"
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <h4
                      className={`text-xs md:text-sm font-semibold ${isActive ? "text-accent" : "text-text-primary"}`}
                    >
                      {t.label}
                    </h4>
                    <span className="text-[11px] md:text-xs text-text-secondary">
                      {t.desc}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
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
                <span className="font-bold text-text-primary block">
                  AUTOPLAY_NEXT
                </span>
                <span className="text-text-secondary text-[10px] md:text-[11px] block mt-0.5">
                  Automatically pull the next queue slot upon completion
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-[10px] font-mono">
                  {toggleStates.autoplay ? "1" : "0"}
                </span>
                <div
                  onClick={() => {
                    const next = !toggleStates.autoplay;
                    setToggleStates((s) => ({ ...s, autoplay: next }));
                    addLog(`[SYSTEM] AUTOPLAY_NEXT updated to: ${next}`);
                  }}
                  className={`dev-toggle ${toggleStates.autoplay ? "active" : ""}`}
                />
              </div>
            </div>

            <div className="w-full h-[1px] bg-border-color/40" />

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-text-primary block">
                  PRE_FETCH_METADATA
                </span>
                <span className="text-text-secondary text-[10px] md:text-[11px] block mt-0.5">
                  Decrypt stream targets asynchronously before next song
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-[10px] font-mono">
                  {toggleStates.prefetch ? "1" : "0"}
                </span>
                <div
                  onClick={() => {
                    const next = !toggleStates.prefetch;
                    setToggleStates((s) => ({ ...s, prefetch: next }));
                    addLog(`[SYSTEM] PRE_FETCH_METADATA updated to: ${next}`);
                  }}
                  className={`dev-toggle ${toggleStates.prefetch ? "active" : ""}`}
                />
              </div>
            </div>

            <div className="w-full h-[1px] bg-border-color/40" />

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-text-primary block">
                  CYBER_GLOW_EFFECTS
                </span>
                <span className="text-text-secondary text-[10px] md:text-[11px] block mt-0.5">
                  Enable active borders, shadows, and scanlines filters
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-[10px] font-mono">
                  {toggleStates.glow ? "1" : "0"}
                </span>
                <div
                  onClick={() => {
                    const next = !toggleStates.glow;
                    setToggleStates((s) => ({ ...s, glow: next }));
                    addLog(`[SYSTEM] CYBER_GLOW_EFFECTS updated to: ${next}`);
                  }}
                  className={`dev-toggle ${toggleStates.glow ? "active" : ""}`}
                />
              </div>
            </div>

            <div className="w-full h-[1px] bg-border-color/40" />

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-text-primary block">
                  SYSTEM_ONBOARDING_TOUR
                </span>
                <span className="text-text-secondary text-[10px] md:text-[11px] block mt-0.5">
                  Replay the orientation guided tutorial step sequence
                </span>
              </div>
              <div>
                <button
                  onClick={() => {
                    setTourActive(true);
                    setTourStep(0);
                    addLog(
                      "[SYSTEM] Interactive orientation replay triggered manually.",
                    );
                  }}
                  className="px-3 py-1 bg-accent/10 border border-accent text-accent hover:bg-accent hover:text-bg-primary text-[10px] font-bold rounded uppercase tracking-wider transition-colors active:scale-95 cursor-pointer"
                >
                  Replay Tour
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Language Preferences */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Music size={14} />
            <span>03. language_preferences</span>
          </h3>

          <div className="bg-bg-secondary/30 border border-border-color/60 rounded-lg p-4 flex flex-col gap-4">
            <span className="text-[11px] text-text-secondary leading-relaxed font-sans">
              Choose your preferred song languages to filter trending tracks, new release albums, and curated global playlists. Search results will remain global.
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languagesList.map((lang) => {
                const isActive = languages?.includes(lang.id);
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageToggle(lang.id)}
                    className={`px-3 py-2 rounded-lg border text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-all ${
                      isActive
                        ? "bg-bg-secondary border-accent text-accent shadow-[0_0_8px_rgba(0,255,179,0.15)]"
                        : "bg-bg-secondary/10 border-border-color hover:bg-bg-secondary/50 hover:border-accent/20 text-text-primary"
                    }`}
                  >
                    <span className="font-mono">{lang.label}</span>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section: PWA Installation */}
        {!isStandalone && (
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Download size={14} />
              <span>04. pwa_installation</span>
            </h3>

            <div className="bg-bg-secondary/30 border border-border-color/60 rounded-lg p-4 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-text-primary block">
                  DESKTOP / MOBILE APPLICATION
                </span>
                <span className="text-text-secondary text-[11px] leading-relaxed">
                  Install 404 Player directly to your system for a native app
                  experience, offline loading, and dedicated audio background
                  playback.
                </span>
              </div>

              {isIOS ? (
                <div className="flex flex-col gap-2 p-3 bg-accent/5 border border-accent/15 rounded-lg text-[11px] text-text-secondary leading-relaxed">
                  <div className="font-bold text-accent">
                    iOS Installation Steps:
                  </div>
                  <ol className="list-decimal list-inside flex flex-col gap-1">
                    <li>
                      Tap the Share button in Safari (bottom navigation bar).
                    </li>
                    <li>Scroll and tap "Add to Home Screen".</li>
                    <li>Tap "Add" in the top-right corner.</li>
                  </ol>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="text-[10px] text-text-secondary">
                    {isInstallable
                      ? "[STATUS]: App is ready for local compilation."
                      : "[STATUS]: Web wrapper active. Installation pending browser check."}
                  </div>
                  <button
                    onClick={triggerPwaInstall}
                    disabled={!isInstallable}
                    className={`px-4 py-2 rounded font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer ${
                      isInstallable
                        ? "bg-accent text-bg-primary hover:bg-accent/90 shadow-[0_0_15px_var(--accent-glow)] active:scale-95"
                        : "bg-bg-secondary/40 border border-border-color text-text-secondary cursor-not-allowed opacity-50"
                    }`}
                  >
                    <Download size={13} />
                    Run Installer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 5: Diagnostic Specs */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] md:text-xs text-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Info size={14} />
            <span>
              {isStandalone
                ? "04. system_diagnostics"
                : "05. system_diagnostics"}
            </span>
          </h3>

          <div className="bg-bg-tertiary border border-border-color rounded-lg p-4 flex flex-col gap-2 text-[10px] text-text-secondary leading-loose">
            <div>
              <span className="text-accent">RUNTIME_PLATFORM:</span> Next.js App
              Router (Node.js 18+)
            </div>
            <div>
              <span className="text-accent">DATABASE_URI:</span>{" "}
              mongodb://127.0.0.1:27017/404player
            </div>
            <div>
              <span className="text-accent">CIPHER_ALGORITHM:</span> Pure JS
              DES-ECB Decryption Engine
            </div>
            <div>
              <span className="text-accent">API_ENDPOINTS_RESOLVED:</span>{" "}
              /api/songs/*, /api/auth/*, /api/playlists, /api/history
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
