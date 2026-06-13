"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Mail, Search, BookOpen, X } from "lucide-react";
import { API_URL, safeJsonFetch } from "@/lib/api";

const categoryColors: Record<string, string> = {
  "Dental Health": "bg-blue-600",
  Orthodontics: "bg-teal-600",
  Cosmetic: "bg-purple-600",
  Prevention: "bg-emerald-600",
  Tips: "bg-amber-600",
};

function getCategoryColor(category: string) {
  return categoryColors[category] ?? "bg-blue-600";
}

function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-5 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);

  // Read filters from URL
  const activeCategory = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("q") || "";

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val && val !== "All") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    router.push(`/blog?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (activeCategory !== "All") params.set("category", activeCategory);

    safeJsonFetch(`${API_URL}/public/blogs?${params.toString()}`)
      .then((data) => {
        if (data.success) {
          setPosts(data.data || []);
          if (data.meta?.categories) setCategories(data.meta.categories);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [activeCategory]);

  const filtered = posts.filter((post) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q) ||
      post.category?.toLowerCase().includes(q)
    );
  });

  const featuredPost = filtered.find((p) => p.isFeatured);
  const gridPosts = activeCategory !== "All" || searchQuery
    ? filtered
    : filtered.filter((p) => !p.isFeatured);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };


  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title="Dental Insights"
        titleAccent="& Articles"
        subtitle="Expert advice, oral health tips, and the latest news in modern dentistry from our specialists."
        breadcrumbs={[{ label: "Blog" }]}
      />


      {/* Featured Post */}
      {!isLoading && activeCategory === "All" && !searchQuery && featuredPost && (
        <section className="py-10 md:py-12 bg-white">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="grid md:grid-cols-2 gap-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:border-slate-300 transition-all duration-300">
                <div className="relative h-64 md:h-full overflow-hidden bg-slate-200">
                  {featuredPost.featuredImageUrl ? (
                    <img
                      src={featuredPost.featuredImageUrl}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-slate-300" />
                    </div>
                  )}
                  <span className={`absolute top-4 left-4 px-3 py-1 ${getCategoryColor(featuredPost.category)} text-white text-[10px] font-semibold uppercase tracking-wider rounded-md`}>
                    {featuredPost.category}
                  </span>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Featured Article</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {featuredPost.publishedAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(featuredPost.publishedAt)}</span>
                      </div>
                    )}
                    {featuredPost.readTimeMinutes && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{featuredPost.readTimeMinutes} min read</span>
                      </div>
                    )}
                    {featuredPost.author && (
                      <span>By Dr. {featuredPost.author.firstName} {featuredPost.author.lastName}</span>
                    )}
                  </div>
                  <div className="mt-5">
                    <span className="inline-flex items-center text-blue-600 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">All Articles</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 font-display">Browse Our Latest Posts</h2>
            </div>
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                defaultValue={searchQuery}
                onChange={(e) => updateParams({ q: e.target.value })}
                className="w-full pl-10 pr-10 h-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => updateParams({ q: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex overflow-x-auto gap-2 pb-3 mb-8 md:flex-wrap md:pb-0 scrollbar-none snap-x snap-mandatory">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParams({ category: cat, q: "" })}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer snap-start shrink-0 border ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    {post.featuredImageUrl ? (
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                        <BookOpen className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
                    {post.category && (
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 ${getCategoryColor(post.category)} text-white text-[10px] font-semibold uppercase tracking-wider rounded-md`}>
                        {post.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-3 mb-4 flex-grow leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      {post.readTimeMinutes && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTimeMinutes} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-10 md:py-12 overflow-hidden border-y border-slate-800 bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-px w-[480px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Stay Updated</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
              Subscribe to Our <span className="text-blue-400">Newsletter</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              Get the latest dental tips, health advice, and clinic updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 h-10 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-500 transition-all"
                />
              </div>
              <button className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm shrink-0 cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
