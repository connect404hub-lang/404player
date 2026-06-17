'use client';

import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/lib/store';

export default function Visualizer() {
  const { isPlaying } = usePlayer();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (canvas.parentElement) {
        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight;
        if (w > 0) {
          canvas.width = w;
          canvas.height = h || 150;
        }
      }
    };
    
    handleResize();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    window.addEventListener('resize', handleResize);

    let offset = 0;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      if (width === 0 || height === 0) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Get styles
      const activeAccent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#00FFB3';

      const waveCount = 3;
      const points = 120;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        
        // Dynamic layered colors
        if (w === 0) {
          ctx.strokeStyle = activeAccent;
          ctx.shadowColor = activeAccent;
        } else if (w === 1) {
          ctx.strokeStyle = '#ff007f'; // Synthwave Pink
          ctx.shadowColor = '#ff007f';
        } else {
          ctx.strokeStyle = '#58a6ff'; // GitHub Blue
          ctx.shadowColor = '#58a6ff';
        }
        
        ctx.shadowBlur = 8;

        for (let i = 0; i < points; i++) {
          const x = (i / points) * width;
          
          // Generate wave amplitude based on whether song is playing
          const amplitude = isPlaying 
            ? (Math.sin(i * 0.05 + offset + w) * 25 + Math.cos(i * 0.08 - offset) * 12) * (0.3 + w * 0.3)
            : (Math.sin(i * 0.04 + w) * 2); // Idle soft hum ripple
            
          const y = height / 2 + amplitude;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      if (isPlaying) {
        offset += 0.07;
      } else {
        offset += 0.01;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full min-h-[140px] opacity-90 transition-opacity"
    />
  );
}
