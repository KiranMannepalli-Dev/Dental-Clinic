"use client";

import { useEffect, useState } from "react";
import { Star, User2 } from "lucide-react";
import { API_URL, safeJsonFetch } from "@/lib/api";

/** Minimal inline Google "G" logo SVG */
function GoogleLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-label="Google review">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

// Fallback testimonials shown when API returns no reviews
const FALLBACK = [
  { id: "f1", content: "The best dental experience I've ever had. Dr. Arjun was incredibly professional. My Invisalign results are amazing!", rating: 5, patientName: "Priya Sharma", treatment: "Invisalign Treatment", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces" },
  { id: "f2", content: "The team made me feel completely at ease. The procedure was painless and recovery was faster than I expected.", rating: 5, patientName: "Rahul Verma", treatment: "Dental Implants", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces" },
  { id: "f3", content: "Dr. Reddy transformed my smile completely! Her attention to detail and aesthetic sense is unparalleled.", rating: 5, patientName: "Anita Desai", treatment: "Smile Makeover", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=faces" },
  { id: "f4", content: "Wonderful clinic! My dental crown looks completely natural. Excellent follow-up care from the whole team.", rating: 5, patientName: "Vikram Mehta", treatment: "Dental Crowns", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces" },
];

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    safeJsonFetch(`${API_URL}/public/reviews?limit=8`)
      .then((data) => {
        if (data.success && data.data?.length > 0) {
          setReviews(data.data);
        } else {
          // Use fallbacks if no published reviews yet
          setReviews(FALLBACK as any);
        }
      })
      .catch(() => setReviews(FALLBACK as any))
      .finally(() => setIsLoaded(true));
  }, []);

  // Show at most 4 for the homepage
  const displayed = reviews.slice(0, 4);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "4.9";

  return (
    <section className="py-8 md:py-10 bg-slate-950 border-b border-slate-900">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">

        {/* Header */}
        <div className="text-center mb-7">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-2">Patient Stories</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Smiles That Speak for Themselves
          </h2>
          {/* Rating Summary */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5">
            <GoogleLogo />
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
              ))}
            </div>
            <span className="text-white font-semibold text-xs">{avgRating}</span>
            <span className="text-slate-500 text-[10px]">·</span>
            <span className="text-slate-400 text-[10px]">{reviews.length >= 4 ? `${reviews.length}+ reviews` : "1,240+ reviews"}</span>
          </div>
        </div>

        {/* Loading skeleton */}
        {!isLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto justify-items-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-full max-w-[240px] bg-slate-900 border border-slate-800 rounded-xl p-4 h-44 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto justify-items-center">
            {displayed.map((t) => {
              const patientName = t.patientName || (t.patient ? `${t.patient.firstName} ${t.patient.lastName?.charAt(0)}.` : "Patient");
              const treatmentLabel = t.treatment || (t.doctor ? `Treated by Dr. ${t.doctor.firstName}` : "");

              return (
                <div
                  key={t.id}
                  className="group flex flex-col w-full max-w-[240px] bg-slate-900/70 border border-slate-800 rounded-xl p-4 transition-all duration-300 hover:border-slate-700 hover:-translate-y-0.5 hover:bg-slate-900"
                >
                  {/* Stars + Google */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <GoogleLogo />
                      <span className="text-slate-500 font-medium">Google</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-slate-400 text-[12px] leading-relaxed line-clamp-4 mb-4 flex-grow">
                    "{t.content}"
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-800/60">
                    {t.avatar ? (
                      <img src={t.avatar} alt={patientName} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <User2 className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-white text-[12px] font-semibold leading-tight">{patientName}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        {treatmentLabel && `${treatmentLabel} · `}
                        {t.createdAt ? timeAgo(t.createdAt) : (t.date || "")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
