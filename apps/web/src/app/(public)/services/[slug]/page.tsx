"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Phone, CheckCircle2, Layers, ArrowLeft, User2 } from "lucide-react";
import { API_URL, safeJsonFetch } from "@/lib/api";

export default function ServiceDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    safeJsonFetch(`${API_URL}/public/services/${slug}`)
      .then((data) => {
        if (data.success && data.data) {
          setService(data.data);
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
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-[4/3] bg-slate-200 rounded-2xl animate-pulse" />
            <div className="space-y-4 pt-4">
              {[60, 80, 100, 40, 90, 70].map((w, i) => (
                <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center py-32 gap-4">
        <Layers className="w-16 h-16 text-slate-200" />
        <h1 className="text-2xl font-bold text-slate-700">Service Not Found</h1>
        <p className="text-slate-500 text-sm">This service doesn't exist or may have been removed.</p>
        <Link href="/services" className="mt-4 inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title={service.name}
        subtitle={service.shortDescription || service.description?.slice(0, 120) + "…"}
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image Side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl transform translate-x-3 translate-y-3 opacity-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500" />
              <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square overflow-hidden rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-100">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-20 h-20 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                  <Layers className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div>
              {service.category && (
                <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 mb-6 uppercase tracking-wider">
                  {service.category} Service
                </div>
              )}

              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 font-display leading-tight">
                {service.name}
              </h2>

              <div className="prose prose-slate prose-blue max-w-none mb-8">
                <p className="text-lg text-slate-600 leading-relaxed mb-4">{service.description}</p>
              </div>

              {/* Pricing */}
              {service.basePrice && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Starting From</p>
                    <p className="text-3xl font-bold text-emerald-800">₹{service.basePrice.toLocaleString("en-IN")}</p>
                  </div>
                  {service.duration && (
                    <div className="ml-auto text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</p>
                      <p className="text-sm font-bold text-slate-700">{service.duration} min</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {["Expert Specialists", "Advanced Technology", "Painless Procedures", "Affordable Pricing"].map((feat) => (
                  <div key={feat} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Doctors who offer this service */}
              {service.doctors?.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm font-bold text-slate-700 mb-3">Available Specialists</p>
                  <div className="flex flex-wrap gap-3">
                    {service.doctors.map((ds: any) => (
                      <Link
                        key={ds.doctor?.id || ds.id}
                        href={`/doctors/${ds.doctor?.slug || ""}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        {ds.doctor?.avatarUrl ? (
                          <img src={ds.doctor.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                            <User2 className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-700">
                          Dr. {ds.doctor?.firstName} {ds.doctor?.lastName}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild>
                  <Link href={`/appointment?service=${service.slug}`}>
                    <Calendar className="mr-2 h-5 w-5" /> Book Appointment
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50" asChild>
                  <a href="tel:08374621025">
                    <Phone className="mr-2 h-5 w-5" /> Call for Info
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to experience the best {service.name}?
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation today to discuss your needs with our skilled professionals.
          </p>
          <Button size="lg" className="rounded-lg bg-white text-slate-900 hover:bg-slate-100 px-8" asChild>
            <Link href="/free-consultation">
              Request Free Consultation <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
