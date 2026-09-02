import React, { useEffect, useState } from 'react';
import { Leaf, Sparkles, Atom } from 'lucide-react';

export function FloatingBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Soft Ambient Aurora Glows (Subtle Blurs) */}
      <div 
        className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
      />
      <div 
        className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)` }}
      />
      <div 
        className="absolute bottom-10 left-1/4 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` }}
      />

      {/* 2. Small, Transparent Floating Botanical Leaves */}
      <div 
        className="absolute top-20 left-[10%] opacity-35 animate-float-slow text-emerald-700"
        style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}
      >
        <Leaf className="w-5 h-5 rotate-12" />
      </div>

      <div 
        className="absolute top-36 left-[22%] opacity-30 animate-float-reverse text-ayur-700"
        style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
      >
        <Leaf className="w-4 h-4 -rotate-45" />
      </div>

      <div 
        className="absolute top-1/2 left-[6%] opacity-25 animate-float-slow text-emerald-800"
        style={{ transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)` }}
      >
        <Leaf className="w-4 h-4 rotate-90" />
      </div>

      <div 
        className="absolute top-28 right-[14%] opacity-35 animate-float-reverse text-emerald-700"
        style={{ transform: `translate(${mousePos.x * -45}px, ${mousePos.y * -45}px)` }}
      >
        <Leaf className="w-5 h-5 -rotate-12" />
      </div>

      <div 
        className="absolute top-[60%] right-[8%] opacity-30 animate-float-slow text-ayur-700"
        style={{ transform: `translate(${mousePos.x * -35}px, ${mousePos.y * -35}px)` }}
      >
        <Leaf className="w-4 h-4 45deg" />
      </div>

      <div 
        className="absolute bottom-28 left-[18%] opacity-30 animate-float-reverse text-emerald-600"
        style={{ transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)` }}
      >
        <Leaf className="w-4 h-4 rotate-180" />
      </div>

      <div 
        className="absolute bottom-36 right-[22%] opacity-25 animate-float-slow text-emerald-700"
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      >
        <Leaf className="w-3.5 h-3.5 -rotate-30" />
      </div>

      {/* 3. Small Transparent Sparkling Particle Stars */}
      <div 
        className="absolute top-24 left-[35%] opacity-40 animate-float-pulse text-amber-500"
        style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` }}
      >
        <Sparkles className="w-4 h-4" />
      </div>

      <div 
        className="absolute top-44 right-[28%] opacity-35 animate-float-slow text-amber-500"
        style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)` }}
      >
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      <div 
        className="absolute top-[48%] right-[38%] opacity-30 animate-float-reverse text-emerald-500"
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      >
        <Sparkles className="w-3 h-3" />
      </div>

      <div 
        className="absolute bottom-44 left-[32%] opacity-35 animate-float-pulse text-amber-500"
        style={{ transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)` }}
      >
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      {/* 4. Small Delicate Molecular Atom Rings */}
      <div 
        className="absolute top-16 right-[42%] opacity-30 animate-float-slow text-sky-600"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      >
        <Atom className="w-5 h-5 rotate-45" />
      </div>

      <div 
        className="absolute top-[68%] left-[12%] opacity-25 animate-float-reverse text-sky-600"
        style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
      >
        <Atom className="w-4 h-4" />
      </div>

      {/* 5. Delicate Micro Particles / Glowing Dust Dots */}
      <div 
        className="absolute top-32 left-[15%] w-2 h-2 rounded-full bg-emerald-500/40 animate-float-slow"
        style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
      />
      <div 
        className="absolute top-48 left-[45%] w-1.5 h-1.5 rounded-full bg-amber-500/40 animate-float-reverse"
        style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}
      />
      <div 
        className="absolute top-20 right-[25%] w-2 h-2 rounded-full bg-emerald-500/35 animate-float-slow"
        style={{ transform: `translate(${mousePos.x * -35}px, ${mousePos.y * -35}px)` }}
      />
      <div 
        className="absolute top-[55%] right-[20%] w-1.5 h-1.5 rounded-full bg-amber-500/45 animate-float-reverse"
        style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)` }}
      />
      <div 
        className="absolute bottom-20 left-[40%] w-2 h-2 rounded-full bg-emerald-500/35 animate-float-slow"
        style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
      />
      <div 
        className="absolute bottom-32 right-[12%] w-2.5 h-2.5 rounded-full bg-sky-400/30 animate-float-pulse"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      />

      {/* 6. Subtle Delicate Miniature Chemical Benzene Rings */}
      <svg
        className="absolute top-28 right-[30%] w-16 h-16 opacity-30 animate-spin-super-slow"
        viewBox="0 0 100 100"
        fill="none"
      >
        <polygon
          points="50 10, 85 30, 85 70, 50 90, 15 70, 15 30"
          className="stroke-emerald-600"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <circle cx="50" cy="10" r="4" className="fill-emerald-500" />
        <circle cx="85" cy="70" r="4" className="fill-amber-500" />
        <circle cx="15" cy="70" r="4" className="fill-emerald-500" />
      </svg>

      <svg
        className="absolute bottom-24 left-[28%] w-14 h-14 opacity-25 animate-spin-super-slow"
        viewBox="0 0 100 100"
        fill="none"
        style={{ animationDirection: 'reverse', animationDuration: '35s' }}
      >
        <polygon
          points="50 15, 80 32, 80 68, 50 85, 20 68, 20 32"
          className="stroke-amber-500"
          strokeWidth="2"
        />
        <circle cx="50" cy="15" r="3.5" className="fill-amber-500" />
        <circle cx="80" cy="68" r="3.5" className="fill-emerald-500" />
        <circle cx="20" cy="68" r="3.5" className="fill-emerald-500" />
      </svg>
    </div>
  );
}
