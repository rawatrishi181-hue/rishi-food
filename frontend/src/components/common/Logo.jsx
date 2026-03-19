import React from 'react';

export const Logo = ({ 
  variant = 'full', // 'full' (icon + text), 'icon' (just icon)
  theme = 'dark',   // 'dark' (for white bg), 'light' (for dark bg)
  className = '',
  size = 'md' 
}) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  const textColor = theme === 'dark' ? 'text-gray-900' : 'text-white';
  
  return (
    <div className={`inline-flex items-center gap-3 ${className} ${sizes[size]}`}>
      {/* Icon Part */}
      <svg 
        viewBox="0 0 100 100" 
        className="h-full w-auto drop-shadow-sm" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e81d2d" />
            <stop offset="100%" stopColor="#ff4d4d" />
          </linearGradient>
        </defs>
        
        {/* Modern Cloche / Plate Base */}
        <path 
          d="M10 75C10 75 25 85 50 85C75 85 90 75 90 75" 
          stroke="url(#logoGradient)" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        
        {/* Stylized 'R' Flame / Steam */}
        <path 
          d="M45 65V25C45 25 45 15 60 15C75 15 75 30 75 30C75 30 75 45 60 45H45L70 65" 
          stroke="url(#logoGradient)" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Speed Lines for Delivery */}
        <path d="M15 35H30" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M10 45H25" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
        <path d="M20 55H35" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
      </svg>

      {/* Text Part */}
      {variant === 'full' && (
        <span className={`font-black italic tracking-tighter text-2xl md:text-3xl ${textColor}`}>
          Rishi<span className="text-primary">Food</span>
        </span>
      )}
    </div>
  );
};
