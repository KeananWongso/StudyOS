import React from 'react';

interface ProgressTrackerLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ProgressTrackerLogo({ 
  size = 48, 
  className = '', 
  showText = true,
  textSize = 'lg' 
}: ProgressTrackerLogoProps) {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div 
        className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
        style={{ width: size, height: size }}
      >
        {/* Progress Chart Icon */}
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          {/* Chart bars representing progress */}
          <rect x="3" y="18" width="3" height="3" fill="currentColor" opacity="0.7" />
          <rect x="7" y="15" width="3" height="6" fill="currentColor" opacity="0.8" />
          <rect x="11" y="12" width="3" height="9" fill="currentColor" opacity="0.9" />
          <rect x="15" y="8" width="3" height="13" fill="currentColor" />
          <rect x="19" y="5" width="3" height="16" fill="currentColor" />
          
          {/* Trending up arrow */}
          <path
            d="M16 6l3-3m0 0l3 3m-3-3v12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
        
        {/* Shine effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"
          style={{ width: size, height: size }}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-gray-900 leading-tight ${textSizes[textSize]}`}>
            Progress Tracker
          </h1>
          <p className="text-gray-600 text-xs leading-tight">
            Cambridge Mathematics
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactProgressTrackerLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div 
      className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        {/* Simplified chart bars */}
        <rect x="4" y="16" width="2" height="5" fill="currentColor" opacity="0.7" />
        <rect x="8" y="13" width="2" height="8" fill="currentColor" opacity="0.8" />
        <rect x="12" y="10" width="2" height="11" fill="currentColor" opacity="0.9" />
        <rect x="16" y="7" width="2" height="14" fill="currentColor" />
        <rect x="20" y="4" width="2" height="17" fill="currentColor" />
      </svg>
    </div>
  );
}

// Favicon version (very simple)
export function FaviconLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="32" height="32" rx="6" fill="url(#gradient)" />
      
      {/* Chart bars */}
      <rect x="6" y="22" width="3" height="4" fill="white" opacity="0.8" />
      <rect x="11" y="19" width="3" height="7" fill="white" opacity="0.9" />
      <rect x="16" y="15" width="3" height="11" fill="white" />
      <rect x="21" y="11" width="3" height="15" fill="white" />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}