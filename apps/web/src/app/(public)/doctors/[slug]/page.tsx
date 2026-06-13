"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import {
  Calendar, ArrowLeft, Star, Award, GraduationCap,
  Stethoscope, User2, ChevronRight, Clock
} from "lucide-react";
import { API_URL, safeJsonFetch } from "@/lib/api";

export default function DoctorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [doctor, setDoctor] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    safeJsonFetch(`${API_URL}/public/doctors/${slug}`)
      .then((data) => {
        if (data.success && data.data) {
          setDoctor(data.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-48 bg-slate-100 animate-pulse" />
        <div className="container mx-auto px-6 py-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
            <div className="space-y-4 pt-4">
              {[80, 60, 100, 40, 90, 70].map((w, i) => (
                <div key={i} className={`h-4 bg-slate-200 rounded animate-pulse`} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center py-32 gap-4">
        <User2 className="w-16 h-16 text-slate-200" />
        <h1 className="text-2xl font-bold text-slate-700">Doctor Not Found</h1>
        <p className="text-slate-500 text-sm">This specialist profile doesn't exist or may have been removed.</p>
        <Link href="/doctors" className="mt-4 inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Specialists
        </Link>
      </div>
    );
  }

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const avgRating = doctor.reviews?.length
    ? (doctor.reviews.reduce((s: number, r: any) => s + r.rating, 0) / doctor.reviews.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title={fullName}
        titleAccent={doctor.specialization}
        subtitle={doctor.qualifications || ""}
        breadcrumbs={[{ label: "Specialists", href: "/doctors" }, { label: fullName }]}
      />

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* Left: Photo + Quick Info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Photo */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/5] bg-gradient-to-br from-blue-50 to-slate-100">
                {doctor.avatarUrl ? (
                  <img
                    src={doctor.avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User2 className="w-24 h-24 text-slate-300" />
                  </div>
                )}
                {avgRating && (
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-md">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900 text-sm">{avgRating}</span>
                    <span className="text-slate-500 text-xs">({doctor.reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              {/* Quick Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                {doctor.experience && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Experience</p>
                      <p className="font-bold text-slate-800 text-sm">{doctor.experience}</p>
                    </div>
                  </div>
                )}
                {doctor.qualifications && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Qualifications</p>
                      <p className="font-bold text-slate-800 text-sm">{doctor.qualifications}</p>
                    </div>
                  </div>
                )}
                {doctor.specialization && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Specialization</p>
                      <p className="font-bold text-slate-800 text-sm">{doctor.specialization}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-sm font-semibold text-sm" asChild>
                <Link href={`/appointment?doctor=${doctor.slug || doctor.id}`}>
                  <Calendar className="w-4 h-4 mr-2" /> Book with {doctor.firstName}
                </Link>
              </Button>
              <Link href="/doctors" className="flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to All Specialists
              </Link>
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-3 space-y-8">
              {/* Bio */}
              {doctor.bio && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <User2 className="w-5 h-5 text-blue-600" /> About
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-base text-justify">{doctor.bio}</p>
                </div>
              )}

              {/* Services */}
              {doctor.services?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" /> Services Offered
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {doctor.services.map((ds: any) => (
                      <Link
                        key={ds.service?.id || ds.id}
                        href={`/services/${ds.service?.slug || ''}`}
                        className="group flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center shrink-0 transition-colors">
                          <ChevronRight className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                          {ds.service?.name || ds.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Reviews */}
              {doctor.reviews?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" /> Patient Reviews
                  </h2>
                  <div className="space-y-3">
                    {doctor.reviews.slice(0, 5).map((review: any) => (
                      <div key={review.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                            />
                          ))}
                          {review.isVerified && (
                            <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">Verified</span>
                          )}
                        </div>
                        {review.title && (
                          <p className="text-sm font-bold text-slate-800 mb-1">{review.title}</p>
                        )}
                        <p className="text-sm text-slate-600 italic leading-relaxed">"{review.content}"</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-2">
                          — {review.patient?.firstName} {review.patient?.lastName?.charAt(0)}.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-10 md:py-12 overflow-hidden border-y border-slate-800 bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-px w-[480px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Ready to get started?</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
            Book an Appointment with <span className="text-blue-400">{fullName}</span>
          </h2>
          <p className="text-slate-400 text-sm mb-7 max-w-md mx-auto">
            Schedule your consultation today and take the first step towards a healthier smile.
          </p>
          <Link
            href={`/appointment?doctor=${doctor.slug || doctor.id}`}
            className="group inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-blue-600/25 hover:shadow-md"
          >
            <Calendar className="h-3.5 w-3.5" />
            Book Now
            <ArrowLeft className="h-3.5 w-3.5 rotate-180 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
