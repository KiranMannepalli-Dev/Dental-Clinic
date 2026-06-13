"use client";

import { useEffect, useState } from "react";
import { Phone, ArrowUp, Calendar, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// WhatsApp SVG icon (official brand mark)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function FloatingButtons() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-3 items-end">

      {/* Emergency Call — pulsing ring */}
      <a
        href="tel:08374621025"
        className="group relative flex h-12 w-12 items-center justify-center rounded-md bg-[#400101] text-white shadow-md hover:bg-[#330000] transition-all duration-200"
        aria-label="Emergency dental call"
        title="Emergency Call"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-md bg-[#400101] animate-ping opacity-25" />
        <Phone className="h-5 w-5 relative z-10" />
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
          Emergency Call
        </span>
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/918374621025"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-12 w-12 items-center justify-center rounded-md bg-[#25D366] text-white shadow-md hover:bg-[#1ebe5d] transition-all duration-200"
        aria-label="Chat on WhatsApp"
        title="WhatsApp"
      >
        <WhatsAppIcon className="h-5 w-5 relative z-10" />
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
          WhatsApp Chat
        </span>
      </a>

      {/* Book Appointment CTA */}
      <Link
        href="/appointment"
        className="group relative flex h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-white shadow-md hover:bg-blue-700 transition-all duration-200 overflow-hidden"
        aria-label="Book Appointment"
        title="Book Appointment"
      >
        {/* Shimmer sweep */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <Calendar className="h-4 w-4 relative z-10 shrink-0" />
        <span className="relative z-10 text-xs font-semibold whitespace-nowrap">Book Now</span>
      </Link>

      {/* Scroll-to-top */}
      <button
        onClick={scrollToTop}
        className={`flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition-all duration-300 ${
          isScrolled
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
        aria-label="Scroll to top"
        title="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
