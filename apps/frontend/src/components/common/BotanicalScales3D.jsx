import React, { useState, useRef } from 'react';
import scalesImage from '../../assets/3d_scales_justice.jpg';
import { Leaf, Sparkles, Scale, Atom, X } from 'lucide-react';

export function BotanicalScales3D() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null); // 'herbs' | 'patent' | null
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleTouchMove = (e) => {
    if (!cardRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = Math.max(-10, Math.min(10, ((y - centerY) / centerY) * -8));
    const rotateY = Math.max(-10, Math.min(10, ((x - centerX) / centerX) * 8));

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto select-none px-2 sm:px-0"
      style={{ perspective: '1200px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${isHovered ? 'scale3d(1.01, 1.01, 1.01)' : 'scale3d(1, 1, 1)'}`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-elevated border border-sage-200/80 bg-white/95 backdrop-blur-md group"
      >
        {/* Header Tag */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-sage-200/80 shadow-sm">
            <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-ayur-700" />
            <span className="text-[10px] sm:text-[11px] font-bold font-heading text-slate-800">
              3D Statutory Equilibrium
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold bg-emerald-100/90 text-emerald-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-300 shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
            <span>Interactive 3D</span>
          </span>
        </div>

        {/* 3D Render Image Base */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-gradient-to-b from-alabaster-100 to-white">
          <img
            src={scalesImage}
            alt="3D Botanical Scales of Justice for Ayurveda Patent Evaluation"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none" />

          {/* Interactive Hotspot 1: Left Pan (Traditional Herbs) */}
          <button
            type="button"
            onClick={() => setActiveTooltip(activeTooltip === 'herbs' ? null : 'herbs')}
            onMouseEnter={() => setActiveTooltip('herbs')}
            className="absolute left-[16%] sm:left-[18%] bottom-[24%] sm:bottom-[26%] z-30 p-1.5 focus:outline-none"
            aria-label="View Traditional Knowledge Information"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-400 opacity-40" />
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-glow-mint border-2 border-white">
                <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
          </button>

          {/* Interactive Hotspot 2: Right Pan (Modern Patent Claims) */}
          <button
            type="button"
            onClick={() => setActiveTooltip(activeTooltip === 'patent' ? null : 'patent')}
            onMouseEnter={() => setActiveTooltip('patent')}
            className="absolute right-[17%] sm:right-[20%] bottom-[22%] sm:bottom-[24%] z-30 p-1.5 focus:outline-none"
            aria-label="View Patent Claims Information"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-sky-400 opacity-40" />
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-sm border-2 border-white">
                <Atom className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
          </button>

          {/* Hover / Tap Tooltip Overlay for Mobile & Desktop */}
          {activeTooltip === 'herbs' && (
            <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-xs z-40 p-3 sm:p-3.5 bg-white/98 backdrop-blur-md rounded-xl sm:rounded-2xl border border-emerald-200 shadow-elevated text-xs space-y-1 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs">Traditional Knowledge (§ 3(p))</span>
                </div>
                <button onClick={() => setActiveTooltip(null)} className="sm:hidden text-slate-400 p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
                Ancient Samhita manuscripts (Charaka & Sushruta) document polyherbal Rasayana formulations. Direct compositions are non-patentable.
              </p>
            </div>
          )}

          {activeTooltip === 'patent' && (
            <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:max-w-xs z-40 p-3 sm:p-3.5 bg-white/98 backdrop-blur-md rounded-xl sm:rounded-2xl border border-sky-200 shadow-elevated text-xs space-y-1 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between font-bold text-sky-800">
                <div className="flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-xs">Modern Patent Claims (§ 3(e))</span>
                </div>
                <button onClick={() => setActiveTooltip(null)} className="sm:hidden text-slate-400 p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
                Novel extraction fractions or nano-carriers require non-obvious synergistic efficacy data to satisfy patentability standards.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Status Info Bar */}
        <div className="p-3 sm:p-4 bg-white/95 border-t border-sage-100 flex flex-col xs:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Traditional Knowledge
            </span>
            <span className="text-slate-300">vs</span>
            <span className="flex items-center gap-1 font-semibold text-sky-800">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Patentable Claim
            </span>
          </div>

          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium text-center">
            Touch or move to tilt 3D balance
          </span>
        </div>
      </div>
    </div>
  );
}
