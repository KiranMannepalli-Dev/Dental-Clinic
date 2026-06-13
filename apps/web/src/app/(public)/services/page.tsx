"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar, Phone, ClipboardCheck, Search, Syringe, HeartPulse, CheckCircle2, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { API_URL, safeJsonFetch } from "@/lib/api";

const SERVICE_CATEGORIES = [
  { value: "", label: "All Services" },
  { value: "COSMETIC", label: "Cosmetic" },
  { value: "ORTHODONTICS", label: "Orthodontics" },
  { value: "IMPLANTS", label: "Implants" },
  { value: "PEDIATRIC", label: "Pediatric" },
  { value: "ORAL_SURGERY", label: "Oral Surgery" },
  { value: "PREVENTIVE", label: "Preventive" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "GENERAL", label: "General" },
];


const processSteps = [
  { step: "01", icon: ClipboardCheck, title: "Book Consultation", description: "Schedule a free consultation online or by phone. No referral needed." },
  { step: "02", icon: Search, title: "Diagnosis & Plan", description: "Thorough examination with digital X-rays and a personalized treatment plan." },
  { step: "03", icon: Syringe, title: "Treatment", description: "Receive your treatment in our state-of-the-art facility with comfort-first care." },
  { step: "04", icon: HeartPulse, title: "Follow-Up Care", description: "Scheduled follow-ups and aftercare guidance for long-lasting results." },
];

function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-[6px] border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-pulse">
      <div className="h-44 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/3 mx-auto" />
        <div className="h-5 bg-slate-200 rounded w-2/3 mx-auto" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    safeJsonFetch(`${API_URL}/public/services`)
      .then((data) => {
        if (data.success) setServices(data.data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredServices = useMemo(() => {
    if (!activeCategory) return services;
    return services.filter(
      (s) => s.category?.toUpperCase() === activeCategory.toUpperCase()
    );
  }, [services, activeCategory]);

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    router.push(`/services?${params.toString()}`, { scroll: false });
  };

  return (

    <div className="flex flex-col min-h-screen">
      <PageHero
        title="Our Dental"
        titleAccent="Services"
        subtitle="From routine checkups to advanced surgical procedures, we provide a full spectrum of dental treatments under one roof with the latest technology."
        breadcrumbs={[{ label: "Services" }]}
      />

      {/* Services Grid */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">
              Comprehensive Treatments
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Every service is delivered by experienced specialists using cutting-edge equipment.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none max-w-7xl mx-auto">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`shrink-0 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                  activeCategory === cat.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {cat.label}
                {!isLoading && cat.value && (
                  <span className={`ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded ${
                    activeCategory === cat.value ? "bg-white/20" : "bg-slate-100"
                  }`}>
                    {services.filter(s => s.category?.toUpperCase() === cat.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ServiceCardSkeleton key={i} />)
              : filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className="group cursor-pointer bg-white rounded-[6px] border border-slate-200 shadow-sm hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] hover:-translate-y-2 hover:border-blue-500/20 transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                          <Layers className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                        <Layers className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="p-5 flex flex-col items-center text-center flex-grow">
                      {service.category && (
                        <div className="mb-2">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider rounded-full">
                            {service.category}
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {service.name}
                      </h3>
                      <p className="text-slate-600 mb-4 flex-grow line-clamp-3 text-xs leading-relaxed">
                        {service.description}
                      </p>
                      <div className="inline-flex items-center justify-center text-blue-600 font-bold group-hover:text-blue-700 transition-colors mt-auto text-xs group/link">
                        Learn more <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-2" />
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {!isLoading && filteredServices.length === 0 && (
            <div className="text-center py-16">
              {activeCategory ? (
                <>
                  <p className="text-slate-500 text-sm font-medium mb-2">
                    No services found in this category.
                  </p>
                  <button
                    onClick={() => handleCategoryChange("")}
                    className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer"
                  >
                    View all services
                  </button>
                </>
              ) : (
                <p className="text-slate-400 text-sm">No services found. Please check back soon.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal Popup */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent showCloseButton={true} className="w-full sm:max-w-3xl md:max-w-5xl lg:max-w-6xl p-0 overflow-hidden rounded-[6px] gap-0 border-0 shadow-2xl">
          {selectedService && (
            <>
              <DialogTitle className="sr-only">{selectedService.name}</DialogTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 bg-white h-full">
                {/* Left: Image */}
                <div className="h-[250px] md:h-full md:min-h-[500px] bg-gradient-to-br from-blue-50 to-slate-100">
                  {selectedService.imageUrl ? (
                    <img
                      src={selectedService.imageUrl}
                      alt={selectedService.name}
                      className="w-full h-full object-cover rounded-none md:rounded-l-[6px] md:rounded-tr-none rounded-t-[6px]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-none md:rounded-l-[6px] md:rounded-tr-none rounded-t-[6px]">
                      <Layers className="w-20 h-20 text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-center max-h-[75vh] md:max-h-[650px] overflow-y-auto">
                  {selectedService.category && (
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider rounded-full mb-3">
                        {selectedService.category} Service
                      </span>
                    </div>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-display leading-tight">
                    {selectedService.name}
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify mb-6">
                    {selectedService.description}
                  </p>

                  {/* Pricing if available */}
                  {(selectedService.basePrice || selectedService.priceFrom) && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Starting From</p>
                      <p className="text-2xl font-bold text-emerald-800">
                        ₹{(selectedService.basePrice || selectedService.priceFrom).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}

                  <div className="mb-6 hidden sm:block">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Why choose us for {selectedService.name}?</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      {[
                        "Experienced specialists using state-of-the-art dental technology.",
                        "Comfortable, pain-free treatments tailored to your unique needs.",
                        "Transparent pricing with affordable EMI payment options.",
                      ].map((point, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-slate-100">
                    <Button className="w-full rounded-[6px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 font-medium" asChild>
                      <Link href={`/appointment?service=${selectedService.slug}`}>Book Appointment</Link>
                    </Button>
                    {selectedService.slug && (
                      <Button variant="outline" className="w-full rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-50 h-11 font-medium" asChild>
                        <Link href={`/services/${selectedService.slug}`}>
                          <ArrowRight className="mr-2 h-4 w-4" /> View Full Details
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" className="w-full rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-50 h-11 font-medium" asChild>
                      <a href="tel:08374621025"><Phone className="mr-2 h-4 w-4" /> Call Clinic</a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Treatment Process */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">Your Treatment Journey</h2>
            <p className="text-sm md:text-base text-slate-600">A simple, transparent process from your first visit to your perfect smile.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {processSteps.map((step, i) => (
              <div key={i} className="relative text-center group">
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-0.5 bg-slate-200" />
                )}
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-600/20 relative z-10">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 block">Step {step.step}</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-10 md:py-12 overflow-hidden border-y border-slate-800 bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-px w-[480px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Get Started Today</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
              Need a Specific <span className="text-blue-400">Treatment?</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-7">
              Book a free consultation and our specialists will recommend the best treatment plan for you.
            </p>
            <Link
              href="/appointment"
              className="group inline-flex items-center justify-center gap-2 h-10 px-6 rounded-[6px] bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-blue-600/25 hover:shadow-md"
            >
              <Calendar className="h-3.5 w-3.5" />
              Book Free Consultation
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
