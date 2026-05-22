"use client";

import { useEffect, useState } from "react";

export function FloatingDentalShapes() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle Sparkle */}
      <div className="absolute top-[20%] left-[15%] opacity-[0.04] animate-float" style={{ animationDelay: '0s', animationDuration: '12s' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#3b82f6" />
        </svg>
      </div>

      {/* Subtle Medical Plus */}
      <div className="absolute bottom-[25%] right-[20%] opacity-[0.03] animate-spin-slow" style={{ animationDelay: '2s', animationDuration: '25s' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 2H13V11H22V13H13V22H11V13H2V11H11V2Z" fill="#2563eb" />
        </svg>
      </div>

      {/* Subtle Tooth Icon */}
      <div className="absolute top-[40%] right-[10%] opacity-[0.03] animate-float" style={{ animationDelay: '3s', animationDuration: '15s' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 2c-1.3 0-2.4.8-2.9 2a3.3 3.3 0 0 0-3-.5A3.3 3.3 0 0 0 7 2c-1.8 0-3.2 1.4-3.5 3.1-.3 1.9.4 3.7 1.6 4.9L9 15.6a2 2 0 0 0 3 .1l1-.8 1 .8a2 2 0 0 0 3-.1l3.9-5.6c1.2-1.2 1.9-3 1.6-4.9C22.2 3.4 20.8 2 19 2c-1.4 0-2.6.9-3.1 2.2a2 2 0 0 0-.4-.2z" />
          <path d="M12 18v4" />
          <path d="M9 16.5v4" />
          <path d="M15 16.5v4" />
        </svg>
      </div>
    </div>
  );
}
