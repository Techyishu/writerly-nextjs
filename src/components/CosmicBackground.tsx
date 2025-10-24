"use client";

import { useState, useEffect } from 'react';

interface CosmicBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

// Seeded random number generator for consistent star positions
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const CosmicBackground = ({ children, className = "" }: CosmicBackgroundProps) => {
  const [stars, setStars] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  useEffect(() => {
    // Generate stars on client side to avoid hydration mismatch
    const generatedStars = Array.from({ length: 100 }).map((_, i) => ({
      left: `${seededRandom(i * 0.1) * 100}%`,
      top: `${seededRandom(i * 0.1 + 1) * 100}%`,
      animationDelay: `${seededRandom(i * 0.1 + 2) * 3}s`,
      animationDuration: `${2 + seededRandom(i * 0.1 + 3) * 2}s`
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        {/* Stars */}
        <div className="absolute inset-0 opacity-60">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.animationDelay,
                animationDuration: star.animationDuration
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
