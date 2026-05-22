import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, MessageCircle } from "lucide-react";
import { FloatingDentalShapes } from "@/components/animations/FloatingDentalShapes";

export function HeroSection() {
  return (
    <div className="relative min-h-[600px] lg:min-h-[750px] flex items-center pt-10 pb-16 lg:pt-14 lg:pb-20">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 -z-10 w-full h-full bg-slate-50">
        <img 
          src="/images/hero-bg.png" 
          alt="Modern Dental Clinic" 
          className="w-full h-full object-cover object-right-top"
        />
        {/* Gradient overlay for excellent text contrast and smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/95 md:via-slate-50/80 to-transparent" />
      </div>

      {/* Interactive Dental Animations */}
      <FloatingDentalShapes />

      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
        <div className="max-w-2xl space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-blue-700 w-fit gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Trusted Since 2009 · 20,000+ Smiles Restored
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl xl:text-6xl text-slate-900 leading-[1.1] font-display">
              Advanced Dental Care{" "}
              <span className="text-blue-600">
                for Your Perfect Smile
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
              Comprehensive treatments for every need — cosmetic, orthodontic, pediatric, and emergency dental care in Kandukur.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button
              size="lg"
              className="rounded-md bg-blue-600 text-white hover:bg-blue-700 h-12 px-8 text-sm font-medium shadow-sm transition-all"
              asChild
            >
              <Link href="/free-consultation">Book Free Consultation</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-md h-12 px-8 text-sm font-medium border border-slate-300 bg-white/40 backdrop-blur-sm hover:border-blue-600 hover:bg-blue-50 text-slate-700 transition-all"
              asChild
            >
              <Link href="/services">
                See Our Treatments <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-5 pt-4 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-200/50">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>4.9/5 Google Rating</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-300" />
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-200/50">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>ISO Certified Clinic</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-300" />
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-200/50">
              <MessageCircle className="h-4 w-4 text-teal-600" />
              <span>10,000+ Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
