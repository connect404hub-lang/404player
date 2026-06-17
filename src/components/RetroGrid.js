'use client';

import React from 'react';

export default function RetroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.08] select-none">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--accent) 1px, transparent 1px),
            linear-gradient(to bottom, var(--accent) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)',
        }}
      />
    </div>
  );
}
