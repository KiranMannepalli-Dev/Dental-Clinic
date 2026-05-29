"use client";

import Link from "next/link";
import { Phone, MapPin, Mail, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

import data from "@/data/website-data.json";
import * as LucideIcons from "lucide-react";

const { quickLinks, socials: rawSocials } = data.footer;

const socials = rawSocials.map((s) => {
  // @ts-ignore
  const IconComponent = LucideIcons[s.icon] || LucideIcons.Globe;
  return {
    ...s,
    icon: <IconComponent className="h-4 w-4" />
  };
});

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">

        {/* Top CTA strip */}
        <div className="border-b border-slate-800 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-xl font-semibold mb-1">Ready to transform your smile?</h3>
            <p className="text-slate-400 text-sm">Book a free consultation with our specialists today.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button className="rounded-md bg-blue-600 hover:bg-blue-700 h-11 px-6 font-medium" asChild>
              <Link href="/appointment">Book Appointment <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <a
              href="tel:08374621025"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              <Phone className="h-4 w-4 text-blue-400" /> 083746 21025
            </a>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">

          {/* Brand */}
          <div className="space-y-5 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 text-white">
              <img src="/logo.png" alt="Heshvitha Dental Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-lg font-semibold tracking-tight">Heshvitha Multi speciality Dental</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Dental Hospital</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
              Advanced dental care tailored to your unique smile. Trusted by 20,000+ patients across Kandukur since 2009.
            </p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="h-9 w-9 flex items-center justify-center rounded-md bg-slate-800 hover:bg-blue-600 hover:text-white transition-all duration-200 text-slate-400"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0 duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">2 Floor, Heshvitha Dental, Government Hospital, Road, <br />above New SBI Bank, opposite Muppa Roshaiah Hospital,<br />Kota Reddy Nagar, Kandukur, Andhra Pradesh 523105</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <a href="tel:08374621025" className="text-slate-400 hover:text-white transition-colors">083746 21025</a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:hello@heshvithadental.com" className="text-slate-400 hover:text-white transition-colors">hello@heshvithadental.com</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-5">
            <h3 className="text-white font-semibold">Working Hours</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400">Mon – Fri</span>
                <span className="text-white font-medium">9:00 AM – 8:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400">Saturday</span>
                <span className="text-white font-medium">9:00 AM – 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Sunday</span>
                <span className="text-blue-400 font-medium">Emergency Only</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 mt-2 bg-slate-900 rounded-md px-4 py-3 border border-slate-800">
              <Clock className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">
                <span className="text-green-400 font-semibold">Open now</span> — closes 8:00 PM
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Heshvitha Multi Speciality Dental Hospital. All rights reserved.</p>
            <div className="hidden sm:block h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span>Designed and Developed by</span>
              <a 
                href="https://tekloria.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors duration-200"
              >
                <img 
                  src="/tekloria-logo.png" 
                  alt="Tekloria" 
                  className="h-4 w-auto object-contain brightness-90 hover:brightness-100 transition-all duration-200" 
                />
                <span className="font-medium text-slate-400 hover:text-white transition-colors duration-200">Tekloria</span>
              </a>
            </div>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-slate-300 transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
