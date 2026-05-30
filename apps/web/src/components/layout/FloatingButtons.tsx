"use client";

import { useEffect, useState } from "react";
import { Phone, ArrowUp, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";

export function FloatingButtons() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Show scroll-to-top button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 items-end">
      {/* Emergency Call Button */}
      <a
        href="tel:08374621025"
        className="group relative flex h-12 w-12 items-center justify-center rounded-md bg-red-600 text-white shadow-sm hover:bg-red-700 transition-all duration-300"
        aria-label="Emergency Call"
      >
        <Phone className="h-5 w-5 relative" />
        
        {/* Tooltip */}
        <span className="absolute right-14 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Emergency Call
        </span>
      </a>

      {/* WhatsApp Chat Button */}
      <a
        href="https://wa.me/918374621025"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-12 w-12 items-center justify-center rounded-md bg-green-600 text-white shadow-sm hover:bg-green-700 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare className="h-5 w-5 relative fill-current" />
        
        {/* Tooltip */}
        <span className="absolute right-14 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          WhatsApp Chat
        </span>
      </a>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`group relative flex h-11 w-11 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
