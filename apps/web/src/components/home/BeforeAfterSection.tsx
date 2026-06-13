"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = ["All", "Whitening", "Braces", "Implants", "Smile Makeover"];

const gallery = [
  {
    id: 1,
    category: "Smile Makeover",
    before: "/images/transformations/makeover_before.webp",
    after: "/images/transformations/makeover_after.webp",
    title: "Complete Smile Makeover"
  },
  {
    id: 2,
    category: "Whitening",
    before: "/images/transformations/whitening_before.webp",
    after: "/images/transformations/whitening_after.webp",
    title: "Professional Teeth Whitening"
  },
  {
    id: 3,
    category: "Braces",
    before: "/images/transformations/braces_before.webp",
    after: "/images/transformations/braces_after.webp",
    title: "Invisalign Treatment"
  },
  {
    id: 4,
    category: "Implants",
    before: "/images/transformations/implants_before.webp",
    after: "/images/transformations/implants_after.webp",
    title: "Single Tooth Implant"
  }
];

export function BeforeAfterSection() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredGallery = activeTab === "All" 
    ? gallery 
    : gallery.filter(item => item.category === activeTab);

  return (
    <section className="py-12 md:py-16 bg-white border-b border-slate-100">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mb-3">Transformations</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6">
            Real Patients, Real Results
          </h2>
          <p className="text-base text-slate-600">
            See the difference our expert care can make. Swipe to compare before and after photos of our actual patients.
          </p>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 pb-3 mb-12 md:flex-wrap md:justify-center md:pb-0 scrollbar-none snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer snap-start shrink-0 ${
                activeTab === cat 
                  ? "bg-slate-900 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid (Restricted max width for smaller canvas sizes and centered layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto justify-items-center">
          {filteredGallery.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-sm border border-slate-200 w-full max-w-[270px] bg-white transition-all duration-300 hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1">
              <div className="relative aspect-[3/2] w-full flex overflow-hidden bg-slate-50">
                <div className="w-1/2 relative h-full">
                  <img src={item.before} alt="Before" className="w-full h-full object-cover object-left filter brightness-95 transition-transform duration-500 group-hover:scale-102" />
                  <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                    Before
                  </div>
                </div>
                <div className="w-1/2 relative h-full border-l border-white/60 z-10">
                  <img src={item.after} alt="After" className="w-full h-full object-cover object-right transition-transform duration-500 group-hover:scale-102" />
                  <div className="absolute top-3 right-3 bg-blue-600/90 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                    After
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors leading-tight">{item.title}</h3>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50/80 px-2 py-0.5 rounded-md uppercase tracking-wider">{item.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button size="lg" variant="ghost" className="text-blue-600 hover:bg-blue-50 font-medium text-sm group" asChild>
            <Link href="/gallery">
              View Full Gallery <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
