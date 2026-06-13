"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, ArrowRight, Award, GraduationCap, Clock, User2, Phone, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { API_URL, safeJsonFetch } from "@/lib/api";

const highlights = [
  {
    icon: Award,
    title: "Board Certified",
    description: "All our doctors hold recognized dental certifications and memberships in national dental councils."
  },
  {
    icon: GraduationCap,
    title: "Continual Training",
    description: "Our team attends international conferences and training programs to stay ahead of the latest techniques."
  },
  {
    icon: Clock,
    title: "60+ Years Combined",
    description: "With over 60 years of combined experience, our team has treated every dental condition imaginable."
  },
];

function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full max-w-[320px] animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
        <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-9 bg-slate-200 rounded mt-4" />
      </div>
    </div>
  );
}

export default function SpecialistsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSpec = searchParams.get("speciality") || "";

  useEffect(() => {
    safeJsonFetch(`${API_URL}/public/doctors`)
      .then((data) => {
        if (data.success) setDoctors(data.data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Derive specializations dynamically from the fetched doctors
  const specializations = useMemo(() => {
    const specs = Array.from(
      new Set(doctors.map((d) => d.specialization).filter(Boolean))
    ) as string[];
    return specs.sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!activeSpec) return doctors;
    return doctors.filter(
      (d) => d.specialization?.toLowerCase() === activeSpec.toLowerCase()
    );
  }, [doctors, activeSpec]);

  const handleSpecChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("speciality", value);
    } else {
      params.delete("speciality");
    }
    router.push(`/doctors?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title="Meet Our"
        titleAccent="Specialists"
        subtitle="A team of highly qualified and experienced dental professionals dedicated to delivering exceptional care with a personal touch."
        breadcrumbs={[{ label: "Specialists" }]}
      />

      {/* Doctors Grid */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">

          {/* Specialization Filter Tabs */}
          {!isLoading && specializations.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none max-w-6xl mx-auto">
              <button
                onClick={() => handleSpecChange("")}
                className={`shrink-0 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                  activeSpec === ""
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                All Specialists
              </button>
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleSpecChange(spec)}
                  className={`shrink-0 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                    activeSpec === spec
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {spec}
                  <span className={`ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded ${
                    activeSpec === spec ? "bg-white/20" : "bg-slate-100"
                  }`}>
                    {doctors.filter(d => d.specialization === spec).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto justify-items-center">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <DoctorCardSkeleton key={i} />)
              : filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1.5 transition-all duration-300 hover:border-slate-300 overflow-hidden flex flex-col w-full max-w-[320px]"
                  >
                    {/* Portrait */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {doctor.avatarUrl ? (
                        <img
                          src={doctor.avatarUrl}
                          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                          <User2 className="w-16 h-16 text-slate-300" />
                        </div>
                      )}
                      {doctor.experience && (
                        <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md shadow-sm uppercase tracking-wider">
                          {doctor.experience}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5 flex flex-col items-center text-center flex-grow">
                      <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-1.5 inline-block">
                        {doctor.specialization}
                      </span>
                      <h3 className="text-[17px] font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-slate-500 text-xs leading-normal mb-4 font-medium flex-grow">
                        {doctor.qualifications}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2.5 pt-3.5 border-t border-slate-100 mt-auto w-full">
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedDoctor(doctor)}
                          className="flex-1 text-slate-700 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 rounded-md text-xs font-medium h-9 border border-transparent hover:border-blue-100 cursor-pointer"
                        >
                          <User2 className="h-3.5 w-3.5 mr-1" /> Profile
                        </Button>
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm text-xs font-medium h-9 cursor-pointer" asChild>
                          <Link href={`/appointment?doctor=${doctor.slug || doctor.id}`}>
                            <Calendar className="h-3.5 w-3.5 mr-1" /> Book
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {!isLoading && doctors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm">No specialists found. Please check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Doctor Profile Modal */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent showCloseButton={true} className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden rounded-[6px] gap-0 border-0 shadow-2xl">
          {selectedDoctor && (
            <>
              <DialogTitle className="sr-only">Profile of Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</DialogTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 bg-white h-full">
                {/* Left: Image */}
                <div className="h-[250px] md:h-full md:min-h-[450px]">
                  {selectedDoctor.avatarUrl ? (
                    <img
                      src={selectedDoctor.avatarUrl}
                      alt={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                      className="w-full h-full object-cover rounded-none md:rounded-l-[6px] md:rounded-tr-none rounded-t-[6px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center rounded-none md:rounded-l-[6px] md:rounded-tr-none rounded-t-[6px]">
                      <User2 className="w-24 h-24 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Right: Content */}
                <div className="p-6 md:p-8 flex flex-col justify-center max-h-[75vh] md:max-h-[600px] overflow-y-auto">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider rounded-full mb-3">
                      {selectedDoctor.specialization}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 font-display leading-tight">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h2>
                  {(selectedDoctor.qualifications || selectedDoctor.experience) && (
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                      {[selectedDoctor.qualifications, selectedDoctor.experience].filter(Boolean).join(" • ")}
                    </p>
                  )}

                  {selectedDoctor.bio && (
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify mb-6">
                      {selectedDoctor.bio}
                    </p>
                  )}

                  {/* Services offered */}
                  {selectedDoctor.services?.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Services</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoctor.services.map((ds: any) => (
                          <span key={ds.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-100">
                            {ds.service?.name || ds.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews snippet */}
                  {selectedDoctor.reviews?.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Patient Reviews</p>
                      <div className="space-y-2">
                        {selectedDoctor.reviews.slice(0, 2).map((r: any) => (
                          <div key={r.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-1 mb-1">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <p className="text-xs text-slate-600 italic line-clamp-2">"{r.content}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-slate-100">
                    <Button className="w-full rounded-[6px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 font-medium" asChild>
                      <Link href={`/appointment?doctor=${selectedDoctor.slug || selectedDoctor.id}`}>
                        <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-50 h-11 font-medium" asChild>
                      <Link href={`/doctors/${selectedDoctor.slug}`}>
                        <ArrowRight className="mr-2 h-4 w-4" /> View Full Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Why Our Doctors */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Why Our Team</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">
              Expertise You Can Trust
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {highlights.map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-600/20">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-[240px] mx-auto">{item.description}</p>
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
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/5 blur-3xl" />
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Book a Specialist</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
              Consult With the <span className="text-blue-400">Right Doctor</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-7">
              Choose your preferred specialist and book a free consultation today.
            </p>
            <Link
              href="/appointment"
              className="group inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-blue-600/25 hover:shadow-md"
            >
              <Calendar className="h-3.5 w-3.5" />
              Book Appointment
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
