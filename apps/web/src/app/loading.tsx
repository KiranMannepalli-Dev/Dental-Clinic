"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white backdrop-blur-sm">
      <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
        {/* Outer rotating circle */}
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-blue-600 border-l-blue-600 animate-spin" style={{ animationDuration: '1.5s' }}></div>
        
        {/* Inner reverse rotating circle for effect */}
        <div className="absolute inset-2 rounded-full border-[3px] border-slate-50 border-b-blue-400 border-r-blue-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        
        {/* Center Logo */}
        <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-full shadow-sm animate-pulse">
          <img 
            src="/logo.png" 
            alt="Loading..." 
            className="w-10 h-auto md:w-12 object-contain"
          />
        </div>
      </div>
      
      <p className="mt-6 text-sm font-medium text-slate-500 uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );
}
