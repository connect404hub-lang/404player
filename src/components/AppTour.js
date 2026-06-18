'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePlayer } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Terminal, Cpu } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: '// INIT_ORIENTATION_SEQUENCE',
    text: 'Welcome, operator. 404 Player is a terminal-inspired, decentralized audio streaming environment. Let\'s inspect the system nodes to optimize your workspace.',
    target: null,
    position: 'center',
    route: '/'
  },
  {
    title: '// SYSTEM_WORKSPACE',
    text: 'This is the main workspace explorer. Here you browse featured tracks, guest logs, and compiled databases. Selecting a song initiates the decryption pipeline.',
    target: 'main',
    position: 'center',
    route: '/'
  },
  {
    title: '// EXPLORATION_INTERFACE',
    text: 'Navigate between the central directory, search query terminal, guest playlists, local libraries, and settings from this control panel.',
    target: '#desktop-nav',
    position: 'right',
    route: '/'
  },
  {
    title: '// DECRYPTION_CONSOLE',
    text: 'Open the live log console to inspect compilation logs, real-time lyrics decryption streams, and active queue stack frames.',
    target: '#nav-console',
    position: 'right',
    route: '/'
  },
  {
    title: '// SEARCH_NODES',
    text: 'Execute queries against global catalog nodes. Results pre-populate audio stream mirrors automatically for instant compilation.',
    target: '#search-query-input',
    position: 'bottom',
    route: '/search'
  },
  {
    title: '// KERNEL_PREFERENCES',
    text: 'Configure stylesheet themes (Cyber, GitHub, Synthwave), audio play flags, and install the local standalone PWA wrapper here.',
    target: '#settings-theme-selector',
    position: 'bottom',
    route: '/settings'
  },
  {
    title: '// SEQUENCE_COMPLETED',
    text: 'All system checks complete. Core network interfaces initialized. Your developer music terminal is now fully operational.',
    target: null,
    position: 'center',
    route: '/settings'
  }
];

export default function AppTour() {
  const { tourActive, setTourActive, tourStep, setTourStep, haptic, addLog } = usePlayer();
  const router = useRouter();
  const pathname = usePathname();
  const [rect, setRect] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check responsiveness
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync route navigation and locate element bounding rect
  useEffect(() => {
    if (!tourActive) return;

    const step = TOUR_STEPS[tourStep];
    if (!step) return;

    // Navigate if route differs
    if (step.route && pathname !== step.route) {
      router.push(step.route);
      setRect(null); // Clear rect during navigation transition
      return;
    }

    if (!step.target || step.position === 'center') {
      setRect(null);
      return;
    }

    let attempts = 0;
    const findElementRect = () => {
      const el = document.querySelector(step.target);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else if (attempts < 30) {
        attempts++;
        setTimeout(findElementRect, 100);
      }
    };

    findElementRect();

    // Resize / scroll listener updates
    const handleUpdate = () => {
      const el = document.querySelector(step.target);
      if (el) setRect(el.getBoundingClientRect());
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [tourStep, tourActive, pathname, router]);

  const handleNext = useCallback(() => {
    haptic(15);
    const nextStep = tourStep + 1;
    if (nextStep >= TOUR_STEPS.length) {
      handleComplete();
    } else {
      setTourStep(nextStep);
    }
  }, [tourStep, setTourStep, haptic]);

  const handleBack = useCallback(() => {
    haptic(15);
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  }, [tourStep, setTourStep, haptic]);

  const handleComplete = useCallback(() => {
    haptic(30);
    localStorage.setItem('404_tour_completed', 'true');
    setTourActive(false);
    addLog('[SYSTEM] Onboarding orientation completed. Registry updated.');
  }, [setTourActive, addLog, haptic]);

  if (!tourActive) return null;

  const currentStep = TOUR_STEPS[tourStep];
  if (!currentStep) return null;

  // Compute spotlight circle position & radius
  let spotlightStyle = 'rgba(3, 7, 18, 0.85)';
  let highlightStyle = null;

  if (rect && currentStep.position !== 'center') {
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.max(rect.width, rect.height) / 2 + 10;
    spotlightStyle = `radial-gradient(circle at ${x}px ${y}px, transparent ${radius}px, rgba(3, 7, 18, 0.85) ${radius + 2}px)`;

    highlightStyle = {
      left: rect.left - 5,
      top: rect.top - 5,
      width: rect.width + 10,
      height: rect.height + 10
    };
  }

  // Calculate Tour Card placement
  let cardStyle = {};
  if (rect && !isMobile && currentStep.position !== 'center') {
    const margin = 20;
    if (currentStep.position === 'right') {
      cardStyle = {
        left: rect.right + margin,
        top: rect.top + rect.height / 2,
        transform: 'translateY(-50%)'
      };
    } else if (currentStep.position === 'bottom') {
      cardStyle = {
        left: rect.left + rect.width / 2,
        top: rect.bottom + margin,
        transform: 'translateX(-50%)'
      };
    } else if (currentStep.position === 'left') {
      cardStyle = {
        left: rect.left - margin,
        top: rect.top + rect.height / 2,
        transform: 'translate(-100%, -50%)'
      };
    } else if (currentStep.position === 'top') {
      cardStyle = {
        left: rect.left + rect.width / 2,
        top: rect.top - margin,
        transform: 'translate(-50%, -100%)'
      };
    }
  } else {
    // Mobile or screen center fallback
    cardStyle = {
      left: '50%',
      top: isMobile ? 'auto' : '50%',
      bottom: isMobile ? '130px' : 'auto',
      transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)'
    };
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden select-none font-mono">
      {/* Background Mask Overlay */}
      <div 
        className="absolute inset-0 transition-all duration-300 pointer-events-auto"
        style={{ background: spotlightStyle }}
        onClick={handleComplete} // clicking backdrop skips/completes
      />

      {/* Target spotlight border highlight */}
      {highlightStyle && (
        <div 
          className="absolute border border-accent rounded-lg pointer-events-none transition-all duration-300 shadow-[0_0_20px_var(--accent-glow)] animate-pulse"
          style={highlightStyle}
        />
      )}

      {/* Tour Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute w-[90vw] max-w-[360px] bg-bg-primary border border-border-color shadow-[0_0_35px_rgba(0,0,0,0.8)] rounded-lg p-4 md:p-5 flex flex-col gap-4 text-xs z-60 pointer-events-auto"
        style={cardStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-color pb-2.5">
          <div className="flex items-center gap-1.5 font-bold text-accent">
            <Cpu size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
            <span className="tracking-wide text-[10px] md:text-xs uppercase">{currentStep.title}</span>
          </div>
          <button 
            onClick={handleComplete}
            className="text-text-secondary hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <p className="text-text-secondary text-[11px] md:text-xs leading-relaxed font-mono font-medium">
          {currentStep.text}
        </p>

        {/* Navigation panel */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border-color/65">
          {/* Step indicator */}
          <div className="text-[10px] text-text-secondary font-mono">
            NODE: [{tourStep + 1} / {TOUR_STEPS.length}]
          </div>

          <div className="flex items-center gap-2">
            {tourStep > 0 && (
              <button
                onClick={handleBack}
                className="p-1 px-2.5 bg-white/[0.02] border border-border-color hover:border-text-secondary text-text-secondary hover:text-text-primary rounded text-[10px] uppercase font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={12} />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="p-1 px-3 bg-accent text-bg-primary hover:bg-accent/90 rounded text-[10px] uppercase font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_var(--accent-glow)]"
            >
              {tourStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {tourStep < TOUR_STEPS.length - 1 && <ChevronRight size={12} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
