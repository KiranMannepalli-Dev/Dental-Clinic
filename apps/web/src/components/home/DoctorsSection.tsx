"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar, Mail, Phone, User2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const doctors = [
  {
    id: 1,
    name: "Dr. Arjun Mehta",
    specialization: "Orthodontist",
    experience: "14+ Years Exp.",
    qualifications: "BDS, MDS (Orthodontics), FICD",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-arjun-mehta",
    bio: "Dr. Arjun Mehta specializes in diagnosing, preventing, and treating dental and facial irregularities. He is highly experienced with braces, clear aligners, and complex orthodontic cases, ensuring every patient achieves a confident and perfectly aligned smile.",
    email: "arjun.mehta@heshvithadental.com",
    phone: "+91 98765 43211",
  },
  {
    id: 2,
    name: "Dr. Priya Reddy",
    specialization: "Cosmetic Dentist",
    experience: "10+ Years Exp.",
    qualifications: "BDS, MDS (Cosmetic Dentistry)",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-priya-reddy",
    bio: "Dr. Priya Reddy is an expert in cosmetic dentistry, focusing on smile design, veneers, teeth whitening, and composite bonding. She combines artistry with advanced dental science to deliver stunning, natural-looking aesthetic results.",
    email: "priya.reddy@heshvithadental.com",
    phone: "+91 98765 43212",
  },
  {
    id: 3,
    name: "Dr. Rohan Sharma",
    specialization: "Oral Surgeon",
    experience: "12+ Years Exp.",
    qualifications: "BDS, MDS (Oral & Maxillofacial Surgery)",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-rohan-sharma",
    bio: "Dr. Rohan Sharma handles complex surgical procedures, including wisdom tooth extractions, dental implants, and jaw surgeries. With a focus on patient comfort and pain management, he ensures safe and successful surgical outcomes.",
    email: "rohan.sharma@heshvithadental.com",
    phone: "+91 98765 43213",
  },
  {
    id: 4,
    name: "Dr. Ananya Patel",
    specialization: "Pediatric Dentist",
    experience: "8+ Years Exp.",
    qualifications: "BDS, MDS (Pedodontics)",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=faces",
    slug: "dr-ananya-patel",
    bio: "Dr. Ananya Patel is dedicated to the oral health of children from infancy through the teen years. Her gentle, compassionate approach helps children feel at ease, making dental visits a positive and stress-free experience for both kids and parents.",
    email: "ananya.patel@heshvithadental.com",
    phone: "+91 98765 43214",
  }
];

export function DoctorsSection() {
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null);

  return (
    <section className="py-12 md:py-16 bg-slate-50 border-b border-slate-100">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Meet Our Team</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">
            World-Class Dental Specialists
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Our team of highly qualified and experienced doctors are dedicated to providing the best dental care possible.
          </p>
        </div>

        {/* Grid (optimized width container to balance card sizes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto justify-items-center">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1.5 transition-all duration-300 hover:border-slate-300 overflow-hidden flex flex-col relative w-full max-w-[290px]"
            >
              {/* Doctor Portrait - Adjusted to aspect-square to minimize height and maintain width */}
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Floating Experience Badge */}
                <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md shadow-sm uppercase tracking-wider">
                  {doctor.experience}
                </div>
              </div>

              {/* Bottom Card Details centered */}
              <div className="p-5 flex flex-col items-center text-center flex-grow">
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-1.5 inline-block">
                  {doctor.specialization}
                </span>
                <h3 className="text-[17px] font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                  {doctor.name}
                </h3>
                <p className="text-slate-500 text-xs leading-normal mb-4 flex-grow font-medium line-clamp-2">
                  {doctor.qualifications}
                </p>

                {/* Actions Row */}
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

        {/* View All CTA */}
        <div className="mt-10 text-center">
          <Button variant="outline" className="rounded-md border border-slate-200 hover:border-blue-600 text-slate-700 bg-white hover:bg-blue-50/50 transition-colors cursor-pointer" asChild>
            <Link href="/doctors">
              Meet All Doctors <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

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

      </div>
    </section>
  );
}
