"use client";

import { PageHero } from "@/components/layout/PageHero";
import { useState } from "react";
import { X, Award, CheckCircle } from "lucide-react";

const achievements = [
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAG_tOcvIvYhXW2M_gernX3SZD-8cUsge9SZeJ5rE6Ezk1fzRMfs7NCBzs8W4yk7ZN5Z0SqeHRLboNU5zLxT8Dbi-iY0RPA62nYm9MLhUwS6rakBDc_gfZP62aY9G4sN0uXm_KPQrMlW38Lp=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFwlp8bZFZH7te-eFGKvQtU8YTTSgAjsqCKcl-pLJZkPSfbrMPKvc36_54sG_Vjxw8jHrWUIX0FQlfu4emKGVvO7HscShc-V5iYwZqoT3nZgwnXbIpcQjSnf7vc3jktdA78AakSmbfNRfFz=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFKhTvh6aryFXnuG3U0aJWIJnug5EmpjJ4i7SO_cjPmGY9h6oOU2sTdp5W2c_NYt7ri2xnBQqkHuhjfXErDYzRpBKe5oY9f604KFypqYB15FEd_BKZpmtI5FM6vexAVmzSpE_5hbfytnMg=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipMiJiYDqR4qGsH6jY05NYg8fZ9xs4I3WL6z1Ik6=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipOiw2nV91vjXqJn-vz3J7Qc9w93m253kPxqZBNg=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipPVX9DDgNJJmnctoZb_6UfACiz42T84AhZniLHv=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipP0_e_3hzMu8maPcfWY3iAT1QcTlw9m--i-XP0g=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipP3kBBcehxDlgGyeFeoHMmtsE7xc2usAV0AOlI3=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipNWaEjS7UGr7AMh1ko4cAaYhngulYfy6h69HabN=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipNv6lgCk24uBRT_h6kvCJnscXLTl0Y4LCcqZOwb=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipMtZ1Gr8Z2hA5ZMlUkWCpDTRTuO4D81zPOjsI_N=s1360-w1360-h1020-rw"
];

export default function AchievementsPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHero
        title="Our"
        titleAccent="Achievements"
        subtitle="Celebrating our milestones, awards, and the recognition we've received for providing exceptional dental care to our community."
        breadcrumbs={[{ label: "Achievements" }]}
      />

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Recognized Excellence</h3>
              <p className="text-sm text-slate-600">Consistently recognized by medical boards and community organizations for our standard of care.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Certified Specialists</h3>
              <p className="text-sm text-slate-600">Our doctors hold prestigious certifications and continue to advance their skills globally.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Patient Trust</h3>
              <p className="text-sm text-slate-600">The biggest achievement is the smile and trust of thousands of patients we've treated.</p>
            </div>
          </div>



          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto auto-rows-[250px]">
            {achievements.map((src, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden bg-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => setLightbox(src)}
              >
                <img
                  src={src}
                  alt={`Achievement ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 md:-top-12 right-0 text-white/70 hover:text-white transition-colors cursor-pointer bg-black/20 hover:bg-black/40 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={lightbox}
              alt="Full screen achievement"
              className="w-auto h-auto max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
