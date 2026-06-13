"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, BookOpen } from "lucide-react";
import { API_URL, safeJsonFetch } from "@/lib/api";

const categoryColors: Record<string, string> = {
  "Dental Health": "bg-blue-600",
  "Orthodontics": "bg-teal-600",
  "Cosmetic": "bg-purple-600",
  "Prevention": "bg-emerald-600",
  "Tips": "bg-amber-600",
};

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? "bg-blue-600";
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function BlogPreview() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    safeJsonFetch(`${API_URL}/public/blogs?limit=8`)
      .then((data) => {
        if (data.success && data.data?.length > 0) {
          setPosts(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));
  }, []);

  // Duplicate posts for seamless infinite scroll
  const scrollPosts = posts.length > 0 ? [...posts, ...posts] : [];

  if (!isLoaded) {
    return (
      <section className="py-10 md:py-12 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div className="max-w-xl">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Dental Insights</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Read Our Latest Articles</h2>
            </div>
          </div>
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] h-56 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null; // Don't render section if no published posts
  }

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
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-5 py-2 animate-blog-scroll group-hover/scroll:[animation-play-state:paused]"
          style={{ width: "max-content" }}
        >
          {scrollPosts.map((post, i) => (
            <Link
              key={`${post.id}-${i}`}
              href={`/blog/${post.slug}`}
              className="group flex-shrink-0 w-[280px] bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden bg-slate-100">
                {post.featuredImageUrl ? (
                  <img
                    src={post.featuredImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
                {post.category && (
                  <span className={`absolute top-3 left-3 inline-block px-2 py-0.5 ${getCategoryColor(post.category)} text-white text-[10px] font-semibold uppercase tracking-wider rounded`}>
                    {post.category}
                  </span>
                )}
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
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  {post.readTimeMinutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTimeMinutes} min</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
