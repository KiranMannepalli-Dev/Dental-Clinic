import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight, Calendar, Shield, Heart, Eye, Sparkles, Users,
  Target, Award, Clock, Microscope, UserCheck
} from "lucide-react";

export const metadata = {
  title: "About Us | Heshvitha Multi Speciality Dental Hospital",
  description: "Learn about Heshvitha Multi Speciality Dental Hospital — our story, mission, values, and 15+ years of excellence in dental care in Kandukur.",
};

import data from "@/data/website-data.json";
import * as LucideIcons from "lucide-react";

const { stats, milestones, values: rawValues } = data.about;

const values = rawValues.map((v) => {
  // @ts-ignore
  const IconComponent = LucideIcons[v.icon] || LucideIcons.Heart;
  return {
    ...v,
    icon: IconComponent
  };
});

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title="About"
        titleAccent="Heshvitha Dental"
        subtitle="Delivering advanced, compassionate dental care to Kandukur since 2009. Our mission is to make every patient smile with confidence."
        breadcrumbs={[{ label: "About Us" }]}
      />

      {/* Our Story Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-30 -z-10" />
              <div className="relative aspect-[4/5] rounded-md shadow-sm overflow-hidden bg-slate-50 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80"
                  alt="Heshvitha Dental Clinic Interior"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-md py-3 px-4 rounded-md shadow-md border border-slate-100/80 flex items-center gap-3 z-10">
                <div className="text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 leading-none">Since 2009</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-none">15+ Years of Trust</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 leading-tight font-display">
                A Legacy of Dental Excellence
              </h2>
              <div className="space-y-4 text-sm md:text-base text-slate-600 leading-relaxed">
                <p>
                  Heshvitha Multi Speciality Dental Hospital was founded in 2009 by a team of passionate dental professionals with a singular vision — to bring world-class dental care to Kandukur. What started as a small practice has grown into one of the city&apos;s most trusted multi-specialty dental hospitals.
                </p>
                <p>
                  Over the past 15 years, we have served more than 20,000 patients, performing treatments ranging from routine cleanups to complex full-mouth rehabilitations. Our team of 12+ specialists combines decades of collective experience with the latest dental technology.
                </p>
                <p>
                  Today, Heshvitha Dental is synonymous with precision, comfort, and beautiful smiles. We continue to invest in our people, our technology, and our patient experience — because every smile matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-8 bg-slate-950 border-y border-slate-900">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="flex flex-wrap items-center justify-center lg:justify-between gap-x-10 gap-y-6 max-w-5xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center min-w-[120px]">
                <p className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">{stat.value}</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">
              What We Stand For
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              These core values guide every interaction, treatment, and decision at Heshvitha Dental.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {values.map((value, i) => (
              <div
                key={i}
                className="group bg-white hover:bg-white border border-slate-200 hover:border-blue-100/80 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex gap-4"
              >
                <div className="w-11 h-11 shrink-0 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 duration-300">
                  <value.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                    {value.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Our Journey</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">
              Milestones That Define Us
            </h2>
          </div>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-slate-200" />

            {milestones.map((milestone, i) => (
              <div
                key={i}
                className={`relative flex items-start gap-6 mb-10 last:mb-0 md:gap-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-[16px] md:left-1/2 md:-translate-x-1/2 top-1 w-4 h-4 rounded-full bg-blue-600 border-[3px] border-white shadow-sm z-10" />

                {/* Content Card */}
                <div className={`ml-14 md:ml-0 md:w-[calc(50%-40px)] ${i % 2 === 0 ? "md:text-right md:pr-0" : "md:text-left md:pl-0"}`}>
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-2">
                    {milestone.year}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{milestone.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{milestone.description}</p>
                </div>
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
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Join Our Family</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
              Experience the <span className="text-blue-400">Heshvitha Difference</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-7">
              Book a free consultation and discover why 20,000+ patients trust us with their smiles.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/appointment"
                className="group inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-blue-600/25 hover:shadow-md w-full sm:w-auto"
              >
                <Calendar className="h-3.5 w-3.5" />
                Book Free Consultation
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
