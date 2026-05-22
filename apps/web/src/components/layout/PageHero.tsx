import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FloatingDentalShapes } from "@/components/animations/FloatingDentalShapes";

interface PageHeroProps {
  title: string;
  titleAccent?: string;
  subtitle: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHero({ title, titleAccent, subtitle, breadcrumbs }: PageHeroProps) {
  return (
    <section className="relative pt-10 pb-14 bg-gradient-to-b from-slate-50 via-slate-50 to-white overflow-hidden">
      {/* Dental Animations */}
      <FloatingDentalShapes />
      
      {/* Decorative elements */}
      <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/[0.03] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -top-4 -right-12 w-32 h-32 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-20" />

      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm mb-5">
            <Link href="/" className="text-slate-400 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                {crumb.href ? (
                  <Link href={crumb.href} className="text-slate-400 hover:text-blue-600 transition-colors font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight font-display mb-4">
          {title}
          {titleAccent && (
            <>
              {" "}
              <span className="text-blue-600">{titleAccent}</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
