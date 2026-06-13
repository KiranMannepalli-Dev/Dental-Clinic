"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, CheckCircle2, Phone, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { API_URL, safeJsonFetch } from "@/lib/api";

export function ServicesSection() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeTab, setActiveTab] = useState("All");
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    safeJsonFetch(`${API_URL}/public/services`)
      .then((data) => {
        if (data.success && data.data) {
          const svcs = data.data;
          setServices(svcs);
          // Extract distinct categories
          const cats = Array.from(new Set(svcs.map((s: any) => s.category).filter(Boolean))) as string[];
          setCategories(["All", ...cats]);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredServices = activeTab === "All"
    ? services
    : services.filter((s) => s.category === activeTab);

  useEffect(() => {
    if (isHovered || filteredServices.length <= 1) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const interval = setInterval(() => {
      const card = container.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth : 285;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollTo({ left: container.scrollLeft + scrollAmount, behavior: "smooth" });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isHovered, filteredServices.length]);

  return (
    <section className="py-12 md:py-16 bg-slate-50">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">

        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Our Services</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">
            Comprehensive Dental Care
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            From routine checkups to advanced surgical procedures, we provide a full spectrum of dental treatments under one roof.
          </p>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 pb-3 mb-8 md:flex-wrap md:justify-center md:pb-0 scrollbar-none snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer snap-start shrink-0 ${
                activeTab === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scrollable Carousel */}
        <div className="relative max-w-7xl mx-auto px-2 sm:px-4">
          {isLoading ? (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 scrollbar-none scroll-smooth snap-x snap-mandatory pb-4 px-0.5"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="group cursor-pointer bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] hover:-translate-y-2 hover:border-blue-500/20 transition-all duration-500 overflow-hidden flex flex-col snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Layers className="w-14 h-14 text-slate-300" />
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
                    <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-blue-600 transition-colors duration-300">
                      {service.name}
                    </h3>
                    <p className="text-slate-600 mb-4 h-[40px] line-clamp-2 text-justify text-xs leading-relaxed">
                      {service.description}
                    </p>
                    <div className="inline-flex items-center justify-center text-blue-600 font-bold hover:text-blue-750 transition-colors mt-auto text-xs group/link">
                      Learn more <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-2" />
                    </div>
                  </div>
                </div>
              ))}

              {filteredServices.length === 0 && !isLoading && (
                <div className="flex-1 text-center py-16 text-slate-400 text-sm">
                  No services found in this category.
                </div>
              )}
            </div>
          )}
        </div>

        {/* View All CTA */}
        <div className="mt-10 text-center">
          <Button variant="outline" className="rounded-md border border-slate-200 hover:border-blue-600 text-slate-700 bg-white hover:bg-blue-50/50 transition-colors cursor-pointer" asChild>
            <Link href="/services">
              View All Services <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Modal Popup */}
        <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent showCloseButton={true} className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden rounded-[6px] gap-0 border-0 shadow-2xl">
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
                        <Layers className="w-16 h-16 text-slate-300" />
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

                    <div className="mb-6 hidden sm:block">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Why choose us for {selectedService.name}?</h3>
                      <ul className="text-sm text-slate-600 space-y-2">
                        {[
                          "Experienced specialists using state-of-the-art dental technology and equipment.",
                          "Comfortable, pain-free treatments tailored specifically to your unique needs.",
                          "Transparent pricing with affordable EMI payment options available.",
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
      </div>
    </section>
  );
}
