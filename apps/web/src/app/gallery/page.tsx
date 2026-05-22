"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar, X } from "lucide-react";

const galleryImages = [
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAE89u9ydZRdDmBQgXg-Axjyd2eegurRnq-sN3KQ2x3g3mdY2CP_IwmQV-PeWLds-QSSDs-66dJ-CynyYkvliu0jiAkmVS45Xzk_HOQRAnevZ5jw6dBXVRkMi8HoTxh5jSx2qgTQl9dG5qt3=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEX731WqoKp7jP3Z74f2gFOYjyoM1LYdXzSxdWs7Sy2cRTGzUDUtgolR4B28ge5cxLQYr-s2qp2zi8871gwaSlpsQy_nlDiBK3WoNYIOH6JzYMEyq5T6P7Ke7i3bI2EcghlMhF-_LkEU06E=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGGle9YKdN0AoKCMsqDXvNDCHb03-2dVIN68w2vF-8cae2WNgv82Uzik7Xbl1IMVLN-MJVGw0dNz9l9IyW4ptlJDjsReTh2Rzt4LiCnQ8TAKZ7aMpal10jndmAr7MBFc7FZEB4XcjTuLjc=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFjoYcPLtqjIBDZnMFdzgbs52Kx2HooKtfN93-FE6OwbYX-dDhPvmyRpMYMQ68NC-LKFPke7rnaEq4qUxHKs1EKSBMQf6Nj-wskIuKhUn0v0Ga_PVy-qLNr7BGTwvhClDvs206KOlnQB-tj=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEuNf4yIL7LRzkceJWfZxmzwAs7N9tpHTpbet9nRXG1C8xhMx1qB1J_dKOmMAyYH4I2q_VPuuEeGK2i5Ml90qwyaLHbvaVD7nuhH_2uKIgEa2Eu-2mQHtWAqoyDp3dHr3PK7LWOtv7knhcO=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFE5ACdEd7aaenKscfBPTyBlGDn2M5CI6Dtdf8mOwBh0gxf998Sgg6dOWO-PBmsLp-nktbBMYm-z812BzNxOXbDldwoVvdUD6M8AFYG7XLeiJfcWAo-AxPR5f6IJ-s-kaOp0F3Ydc2zWXk=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipMBgdtcFUg7EfXEmyY_jlucb1Hkdtry3yE4JqOk=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipNnB4QhRfxWLsPzFs0YAu_wJScJRChgzQA_8E4H=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipNtuzUdyaSzJxQTuKTC6pcfntlvMWdLClw8V_49=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipOWqgRNinLIyv3jp6MqZeZBlNejwRpaSvzkaZCr=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipNwApPCHBnCNY64HlIMg-DTO0dCCr27xwWLwaiQ=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipNYpc3H9sc0LHkLNjWBH0ja9HtXanHtFCkLnhEq=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipMT3Xq9DIrVYuQRLOo7iiqU9Vt5Hykvlopmt3G2=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipMdNFKtHCwzG3oc5eOqimtYdnp7eVKAz5yh4nOG=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/p/AF1QipNskPbXnO-u4MXhkIsAgc7XCsLpif81OsNIg-Xo=s1360-w1360-h1020-rw",
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGppyBpiNkRB8sX_k7NKFs6egEpSuRXQQuPlxqJciQGaQdACIhkS-DzqBea9BJaxmVMOTIcHgS3GSEmUVzsxSYoWXftHoPi2WGvByeDVrWV35fgw-1wND4Dqpg0bF_xK9m5BD6YOIB6K7U=s1360-w1360-h1020-rw"
];

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto auto-rows-[250px] md:auto-rows-[300px]">
            {galleryImages.map((src, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden bg-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => setLightbox(src)}
              >
                <img
                  src={src}
                  alt={`Clinic view ${idx + 1}`}
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
              alt="Full screen view"
              className="w-auto h-auto max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <section className="relative py-10 md:py-12 overflow-hidden border-y border-slate-800 bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-px w-[480px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/5 blur-3xl" />
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
