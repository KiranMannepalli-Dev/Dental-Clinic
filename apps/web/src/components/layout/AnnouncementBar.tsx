"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Phone, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

const MESSAGES = [
  {
    id: "free-consult",
    icon: "🦷",
    text: "Free Consultation for New Patients",
    cta: "Book Today",
    href: "/appointment",
  },
  {
    id: "emergency",
    icon: "🚨",
    text: "Emergency Dental Care — Available Same Day",
    cta: "Call Now",
    href: "tel:08374621025",
  },
  {
    id: "emi",
    icon: "💳",
    text: "0% EMI on All Major Treatments",
    cta: "Learn More",
    href: "/insurance",
  },
];

const DISMISS_KEY = "announcement-dismissed-v2";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start dismissed to avoid SSR flash
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISS_KEY) === "true";
    setDismissed(wasDismissed);
    setVisible(!wasDismissed);
  }, []);

  // Auto-rotate messages every 4s
  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [visible]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      localStorage.setItem(DISMISS_KEY, "true");
    }, 350);
  }, []);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + MESSAGES.length) % MESSAGES.length);
  const next = () => setActiveIndex((i) => (i + 1) % MESSAGES.length);

  if (dismissed) return null;

  const msg = MESSAGES[activeIndex];

  return (
    <div
      className={`w-full transition-all duration-350 overflow-hidden`}
      style={{
        maxHeight: visible ? "48px" : "0px",
        opacity: visible ? 1 : 0,
        transitionProperty: "max-height, opacity",
        transitionDuration: "350ms",
        transitionTimingFunction: "ease-in-out",
      }}
    >
      <div className="relative flex items-center justify-center h-10 text-white px-4 text-xs font-medium select-none"
        style={{ background: "linear-gradient(90deg, #2d0000 0%, #400101 50%, #2d0000 100%)" }}
      >
        {/* Left nav */}
        <button
          onClick={prev}
          className="hidden sm:flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors cursor-pointer mr-2"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Message */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-sm leading-none">{msg.icon}</span>
          <span className="text-white/90 font-medium truncate">{msg.text}</span>
          <Link
            href={msg.href}
            className="shrink-0 bg-white/20 hover:bg-white/30 text-white font-semibold px-2.5 py-1 rounded text-[10px] uppercase tracking-wide transition-colors whitespace-nowrap"
          >
            {msg.cta}
          </Link>
        </div>

        {/* Right nav */}
        <button
          onClick={next}
          className="hidden sm:flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors cursor-pointer ml-2"
          aria-label="Next announcement"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Dots */}
        <div className="hidden sm:flex items-center gap-1 ml-3">
          {MESSAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                i === activeIndex ? "bg-white" : "bg-white/30"
              }`}
              aria-label={`Go to message ${i + 1}`}
            />
          ))}
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute right-4 flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
