"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import Link from "next/link";
import { ArrowRight, Calendar, X, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL, safeJsonFetch } from "@/lib/api";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "All") params.set("category", activeCategory);

    safeJsonFetch(`${API_URL}/public/gallery?${params.toString()}`)
      .then((data) => {
        if (data.success) {
          setImages(data.data || []);
          if (data.meta?.categories) setCategories(data.meta.categories);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [activeCategory]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  };
  const prevImage = () => setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : null));
  const nextImage = () => setLightboxIndex((i) => (i !== null ? Math.min(images.length - 1, i + 1) : null));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex]);

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title="Our"
        titleAccent="Gallery"
        subtitle="Take a virtual tour of our state-of-the-art dental facility and comfortable environment."
        breadcrumbs={[{ label: "Gallery" }]}
      />

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">
              Clinic Tour & Facilities
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Step inside and explore our modern, hygienic, and welcoming environment designed for your comfort.
            </p>
          </div>

          {/* Category Filters */}
          {categories.length > 1 && (
            <div className="flex overflow-x-auto gap-2 pb-3 mb-8 justify-center md:flex-wrap scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto auto-rows-[250px] md:auto-rows-[300px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <ImageOff className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">No gallery images available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto auto-rows-[250px] md:auto-rows-[300px]">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden bg-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={img.url}
                    alt={img.altText || img.caption || `Gallery image ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-xs font-semibold line-clamp-2">{img.caption}</p>
                    </div>
                  )}
                  {img.category && img.category !== "Uncategorized" && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {img.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && currentImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors cursor-pointer bg-black/20 hover:bg-black/40 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-0 md:-left-14 text-white/70 hover:text-white p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all cursor-pointer"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}
            {lightboxIndex < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-0 md:-right-14 text-white/70 hover:text-white p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all cursor-pointer"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            )}

            <img
              src={currentImage.url}
              alt={currentImage.altText || currentImage.caption || "Gallery"}
              className="w-auto h-auto max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-white/10"
            />

            {currentImage.caption && (
              <p className="text-white/70 text-sm mt-4 text-center max-w-lg">{currentImage.caption}</p>
            )}
            <p className="text-white/30 text-xs mt-2">{lightboxIndex + 1} / {images.length}</p>
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <section className="relative py-10 md:py-12 overflow-hidden border-y border-slate-800 bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-px w-[480px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Your Transformation Awaits</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
              Ready for Your <span className="text-blue-400">First Visit?</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-7">
              Book a consultation and start your journey to a confident, radiant smile.
            </p>
            <Link
              href="/appointment"
              className="group inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-blue-600/25 hover:shadow-md"
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
