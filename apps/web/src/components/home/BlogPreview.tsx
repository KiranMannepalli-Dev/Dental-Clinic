"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const posts = [
  {
    id: 1,
    title: "5 Warning Signs You Need to Visit a Dentist This Week",
    category: "Dental Health",
    readTime: "5 min",
    date: "Oct 12, 2024",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
    slug: "5-warning-signs",
    excerpt: "Ignoring dental pain can lead to serious complications. Know when to book an urgent appointment."
  },
  {
    id: 2,
    title: "Invisalign vs Traditional Braces: Which Is Right for You?",
    category: "Orthodontics",
    readTime: "7 min",
    date: "Oct 05, 2024",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop",
    slug: "invisalign-vs-braces",
    excerpt: "A detailed comparison to help you choose the right treatment for your lifestyle and budget."
  },
  {
    id: 3,
    title: "The Truth About Teeth Whitening: What Actually Works",
    category: "Cosmetic",
    readTime: "4 min",
    date: "Sep 28, 2024",
    image: "https://images.unsplash.com/photo-1606240724602-5b21f896eae8?w=600&h=400&fit=crop",
    slug: "truth-about-teeth-whitening",
    excerpt: "We separate whitening myths from facts and explain which treatments deliver real results."
  },
  {
    id: 4,
    title: "How Regular Dental Checkups Can Save You Thousands",
    category: "Prevention",
    readTime: "6 min",
    date: "Sep 15, 2024",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&h=400&fit=crop",
    slug: "regular-dental-checkups",
    excerpt: "Preventive care is an investment. Learn how routine visits catch problems early and save money."
  }
];

const categoryColors: Record<string, string> = {
  "Dental Health": "bg-blue-600",
  "Orthodontics":  "bg-teal-600",
  "Cosmetic":      "bg-purple-600",
  "Prevention":    "bg-emerald-600",
};

/* Duplicate posts for seamless infinite scroll */
const scrollPosts = [...posts, ...posts];

export function BlogPreview() {
  const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);

  return (
    <section className="py-10 md:py-12 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Dental Insights</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Read Our Latest Articles
            </h2>
            <p className="text-slate-600 text-base">
              Expert advice, oral health tips, and the latest news in dentistry.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors group shrink-0"
          >
            View All Articles
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Auto-scrolling carousel */}
      <div className="group/scroll relative mx-6 md:mx-12 lg:mx-16 xl:mx-24 overflow-hidden">
        {/* Fade edges — wide & opaque so cards fully disappear */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-5 py-2 animate-blog-scroll group-hover/scroll:[animation-play-state:paused]"
          style={{
            width: "max-content",
          }}
        >
          {scrollPosts.map((post, i) => (
            <div
              key={`${post.id}-${i}`}
              onClick={() => setSelectedPost(post)}
              className="cursor-pointer group flex-shrink-0 w-[280px] bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden bg-slate-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
                {/* Category badge */}
                <span className={`absolute top-3 left-3 inline-block px-2 py-0.5 ${categoryColors[post.category] ?? "bg-blue-600"} text-white text-[10px] font-semibold uppercase tracking-wider rounded`}>
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-3.5 flex flex-col flex-grow">
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-slate-500 text-xs line-clamp-2 mb-3 flex-grow leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent showCloseButton={true} className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden rounded-[6px] gap-0 border-0 shadow-2xl">
          {selectedPost && (
            <>
              <DialogTitle className="sr-only">{selectedPost.title}</DialogTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 bg-white h-full">
                {/* Left Column: Image */}
                <div className="h-[250px] md:h-full md:min-h-[450px]">
                  <img 
                    src={selectedPost.image} 
                    alt={selectedPost.title} 
                    className="w-full h-full object-cover rounded-none md:rounded-l-[6px] md:rounded-tr-none rounded-t-[6px]"
                  />
                </div>
                
                {/* Right Column: Text Content */}
                <div className="p-6 md:p-8 flex flex-col justify-center max-h-[75vh] md:max-h-[600px] overflow-y-auto">
                  <div>
                    <span className={`inline-block px-3 py-1 ${categoryColors[selectedPost.category] ?? "bg-blue-600"} text-white text-[10px] font-semibold uppercase tracking-wider rounded-full mb-3`}>
                      {selectedPost.category}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-display leading-tight">
                    {selectedPost.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{selectedPost.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{selectedPost.readTime} read</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm md:prose-base prose-slate max-w-none text-slate-600 mb-6">
                    <p className="text-justify leading-relaxed">
                      {selectedPost.excerpt}
                    </p>
                    <p className="text-justify leading-relaxed mt-4">
                      Maintaining good oral hygiene is essential for overall health. In this article, our dental experts break down everything you need to know about this topic. By understanding the fundamentals and following professional advice, you can protect your smile and avoid costly treatments down the road.
                    </p>
                  </div>
                  
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
