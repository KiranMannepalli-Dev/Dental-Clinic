"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/doctors", label: "Specialists" },
  { href: "/gallery", label: "Gallery" },
  { href: "/achievements", label: "Achievements" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b bg-white/95 backdrop-blur-md shadow-sm`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-12 lg:px-16 xl:px-24">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <img src="/logo.png" alt="Heshvitha Dental Logo" className="h-9 sm:h-10 w-auto object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-xs sm:text-lg font-semibold tracking-tight text-slate-900 max-w-[150px] min-[400px]:max-w-[220px] sm:max-w-none truncate sm:overflow-visible">Heshvitha Multi speciality Dental</span>
            <span className="text-[8px] min-[400px]:text-[9px] sm:text-[10px] font-medium text-slate-500 uppercase tracking-widest">Dental Hospital</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1 items-center ml-4 md:ml-8 mr-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                pathname === link.href
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:08374621025"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Phone className="h-4 w-4 text-blue-600" />
            083746 21025
          </a>
          <Button className="rounded-md bg-blue-600 hover:bg-blue-700 h-10 px-5 text-sm font-medium" asChild>
            <Link href="/appointment">
              <Calendar className="h-4 w-4 mr-1.5" /> Book Now
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 pb-6 pt-4 shadow-sm">
          <nav className="flex flex-col gap-1 mb-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <a
              href="tel:08374621025"
              className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-md py-3 hover:bg-slate-50"
            >
              <Phone className="h-4 w-4 text-blue-600" /> 083746 21025
            </a>
            <Button className="rounded-md bg-blue-600 h-11 font-medium" asChild>
              <Link href="/appointment">
                <Calendar className="h-4 w-4 mr-2" /> Book Appointment
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
