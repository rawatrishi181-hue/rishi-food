import React from 'react';

export const Logo = ({ 
  variant = 'full', // 'full' (icon + text), 'icon' (just icon)
  theme = 'dark',   // 'dark' (for white bg), 'light' (for dark bg)
  className = '',
  size = 'md' 
}) => {
  const sizes = {
    xs: 'h-8',
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  const textColor = theme === 'dark' ? 'text-gray-900' : 'text-white';
  
  return (
    <div className={`inline-flex items-center gap-2.5 ${className} ${sizes[size]}`}>
      {/* Professional Minimalist Icon */}
      <svg 
        viewBox="0 0 100 100" 
        className="h-full w-auto drop-shadow-sm" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" /> {/* red-500 */}
            <stop offset="100%" stopColor="#dc2626" /> {/* red-600 */}
          </linearGradient>
        </defs>

        {/* Outer Circular Accent */}
        <circle 
          cx="50" cy="50" r="45" 
          stroke="url(#primaryGradient)" 
          strokeWidth="4" 
          strokeDasharray="40 10" 
          strokeLinecap="round" 
          className="origin-center"
          style={{ transform: 'rotate(-45deg)' }}
        />

        {/* Abstract Fork & Knife forming 'R' */}
        {/* Knife line (Stem of R) */}
        <path 
          d="M38 25 V75" 
          stroke="url(#primaryGradient)" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        
        {/* Top curve of R (Fork prongs abstract) */}
        <path 
          d="M38 25 H55 C65 25 65 45 55 45 H38" 
          stroke="url(#primaryGradient)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Leg of R */}
        <path 
          d="M48 45 L65 75" 
          stroke="url(#primaryGradient)" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />

        {/* Minimal Dot (Food element) */}
        <circle cx="70" cy="35" r="5" fill="url(#primaryGradient)" />
      </svg>

      {/* Professional Typography */}
      {variant === 'full' && (
        <div className="flex flex-col justify-center">
          <span className={`font-black tracking-tight leading-none ${size === 'xs' ? 'text-xl' : size === 'sm' ? 'text-2xl' : 'text-3xl'} ${textColor}`}>
            Rishi<span className="text-red-500">Food</span>
          </span>
          <span className="text-[0.65em] font-semibold tracking-[0.2em] text-gray-400 uppercase mt-0.5 ml-0.5">
            Delivery
          </span>
        </div>
      )}
    </div>
  );
};
