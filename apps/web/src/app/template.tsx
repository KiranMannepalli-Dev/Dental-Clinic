"use client";

import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // 1. Keep loader visible for 400ms so it's reliable and perceptible
    const loaderTimer = setTimeout(() => {
      setIsLoading(false);
      // 2. Add a slight delay before showing content to allow loader to fade out smoothly
      setTimeout(() => setShowContent(true), 100);
    }, 400);

    return () => clearTimeout(loaderTimer);
  }, []);

  return (
    <>
      {/* 
        The Loading Overlay 
        Uses pointer-events-none and opacity to fade out cleanly instead of unmounting instantly
      */}
      <div 
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28">
          {/* Single simple rotating circle */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-100 border-t-blue-600 animate-spin" style={{ animationDuration: '0.8s' }}></div>
          
          {/* Center Logo - Increased Size */}
          <div className="relative z-10 flex items-center justify-center bg-white rounded-full">
            <img 
              src="/logo.png" 
              alt="Loading..." 
              className="w-14 h-auto md:w-16 object-contain animate-pulse"
            />
          </div>
        </div>
        
        <p className="mt-6 text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] animate-pulse">
          Loading
        </p>
      </div>

      {/* The Page Content */}
      <div className={`transition-opacity duration-700 ${showContent ? "opacity-100" : "opacity-0"}`}>
        {children}
      </div>
    </>
  );
}
