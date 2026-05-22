import Link from "next/link";
import { Calendar, Phone, ArrowRight } from "lucide-react";

export function AppointmentCTABanner() {
  return (
    <section className="relative py-10 md:py-12 overflow-hidden border-b border-slate-800 bg-slate-950">
      {/* Subtle blue glow accent — top center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
      >
        <div className="h-px w-[480px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      </div>

      {/* Faint radial glow behind content */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/5 blur-3xl"
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
        <div className="max-w-2xl mx-auto text-center">

          {/* Eyebrow label */}
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">
            Book a Visit
          </p>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
            Ready for Your{" "}
            <span className="text-blue-400">Perfect Smile?</span>
          </h2>

          {/* Subtext */}
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-7">
            Book your free consultation today. We're accepting new patients and would love to help you smile with confidence.
          </p>

          {/* CTA Buttons — perfectly aligned row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Primary: Book Online */}
            <Link
              href="/appointment"
              className="group inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-blue-600/25 hover:shadow-md w-full sm:w-auto"
            >
              <Calendar className="h-3.5 w-3.5" />
              Book Appointment
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            {/* Secondary: Call */}
            <Link
              href="tel:08374621025"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg border border-slate-700 hover:border-slate-600 bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 w-full sm:w-auto"
            >
              <Phone className="h-3.5 w-3.5" />
              083746 21025
            </Link>
          </div>

          {/* Trust micro-note */}
          <p className="mt-5 text-[11px] text-slate-600">
            No credit card required · Free first consultation · Open Mon–Sat
          </p>

        </div>
      </div>

      {/* Bottom accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
      >
        <div className="h-px w-[320px] bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      </div>
    </section>
  );
}
