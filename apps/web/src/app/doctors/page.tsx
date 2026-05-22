"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, ArrowRight, Award, GraduationCap, Clock, User2, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const doctors = [
  {
    id: 1,
    name: "Dr. Arjun Mehta",
    specialization: "Orthodontist",
    experience: "14+ Years Exp.",
    qualifications: "BDS, MDS (Orthodontics), FICD",
    bio: "Specialist in braces and Invisalign treatments. Trained at Columbia University, NYC. Has successfully treated 3,000+ orthodontic cases.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-arjun-mehta",
    email: "arjun.mehta@heshvithadental.com",
    phone: "+91 98765 43211",
  },
  {
    id: 2,
    name: "Dr. Priya Reddy",
    specialization: "Cosmetic Dentist",
    experience: "10+ Years Exp.",
    qualifications: "BDS, MDS (Cosmetic Dentistry)",
    bio: "Expert in smile makeovers, veneers, and teeth whitening. Known for her meticulous attention to aesthetic detail and natural results.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-priya-reddy",
    email: "priya.reddy@heshvithadental.com",
    phone: "+91 98765 43212",
  },
  {
    id: 3,
    name: "Dr. Rohan Sharma",
    specialization: "Oral Surgeon",
    experience: "12+ Years Exp.",
    qualifications: "BDS, MDS (Oral & Maxillofacial Surgery)",
    bio: "Specialist in dental implants, wisdom tooth extractions, and jaw surgery. Uses 3D-guided surgical techniques for precision.",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-rohan-sharma",
    email: "rohan.sharma@heshvithadental.com",
    phone: "+91 98765 43213",
  },
  {
    id: 4,
    name: "Dr. Ananya Patel",
    specialization: "Pediatric Dentist",
    experience: "8+ Years Exp.",
    qualifications: "BDS, MDS (Pedodontics)",
    bio: "Passionate about making dental visits fun for children. Specializes in preventive care, sealants, and early orthodontic intervention.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-ananya-patel",
    email: "ananya.patel@heshvithadental.com",
    phone: "+91 98765 43214",
  },
  {
    id: 5,
    name: "Dr. Vikram Rao",
    specialization: "Endodontist",
    experience: "11+ Years Exp.",
    qualifications: "BDS, MDS (Conservative Dentistry & Endodontics)",
    bio: "Root canal specialist using advanced rotary instruments and microscopes. Known for painless treatments and saving severely damaged teeth.",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-vikram-rao",
    email: "vikram.rao@heshvithadental.com",
    phone: "+91 98765 43215",
  },
  {
    id: 6,
    name: "Dr. Sneha Iyer",
    specialization: "Periodontist",
    experience: "9+ Years Exp.",
    qualifications: "BDS, MDS (Periodontics)",
    bio: "Gum disease specialist with expertise in laser gum therapy, bone grafting, and gum reshaping for both health and aesthetics.",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-sneha-iyer",
    email: "sneha.iyer@heshvithadental.com",
    phone: "+91 98765 43216",
  },
];

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

export default function SpecialistsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto justify-items-center">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1.5 transition-all duration-300 hover:border-slate-300 overflow-hidden flex flex-col w-full max-w-[320px]"
              >
                {/* Doctor Portrait - Aspect Square to minimize height */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Experience Badge */}
                  <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md shadow-sm uppercase tracking-wider">
                    {doctor.experience}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col items-center text-center flex-grow">
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-1.5 inline-block">
                    {doctor.specialization}
                  </span>
                  <h3 className="text-[17px] font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                    {doctor.name}
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
                      <Link href={`/appointment?doctor=${doctor.id}`}>
                        <Calendar className="h-3.5 w-3.5 mr-1" /> Book
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Profile Modal Popup */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent showCloseButton={true} className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden rounded-[6px] gap-0 border-0 shadow-2xl">
          {selectedDoctor && (
            <>
              <DialogTitle className="sr-only">Profile of {selectedDoctor.name}</DialogTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 bg-white h-full">
                {/* Left Column: Image */}
                <div className="h-[250px] md:h-full md:min-h-[450px]">
                  <img 
                    src={selectedDoctor.image} 
                    alt={selectedDoctor.name} 
                    className="w-full h-full object-cover rounded-none md:rounded-l-[6px] md:rounded-tr-none rounded-t-[6px]"
                  />
                </div>
                
                {/* Right Column: Text Content */}
                <div className="p-6 md:p-8 flex flex-col justify-center max-h-[75vh] md:max-h-[600px] overflow-y-auto">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider rounded-full mb-3">
                      {selectedDoctor.specialization}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 font-display leading-tight">
                    {selectedDoctor.name}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    {selectedDoctor.qualifications} • {selectedDoctor.experience}
                  </p>
                  
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify mb-6">
                    {selectedDoctor.bio}
                  </p>
                  
                  <div className="mb-6 space-y-3 hidden sm:block">
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <a href={`mailto:${selectedDoctor.email}`} className="hover:text-blue-600 transition-colors">{selectedDoctor.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-blue-600" />
                      </div>
                      <a href={`tel:${selectedDoctor.phone.replace(/\s+/g, '')}`} className="hover:text-blue-600 transition-colors">{selectedDoctor.phone}</a>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-slate-100">
                    <Button className="w-full rounded-[6px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 font-medium" asChild>
                      <Link href={`/appointment?doctor=${selectedDoctor.id}`}>
                        <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-50 h-11 font-medium" asChild>
                      <a href={`tel:${selectedDoctor.phone.replace(/\s+/g, '')}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call Doctor directly
                      </a>
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

      {/* CTA Banner */}
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
              Choose your preferred specialist and book a free consultation today. We&apos;ll match you with the perfect doctor for your needs.
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
