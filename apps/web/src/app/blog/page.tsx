"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Mail, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const blogCategories = ["All", "Dental Health", "Orthodontics", "Cosmetic", "Prevention", "Tips"];

const allPosts = [
  {
    id: 1,
    title: "5 Warning Signs You Need to Visit a Dentist This Week",
    category: "Dental Health",
    readTime: "5 min",
    date: "Oct 12, 2024",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
    slug: "5-warning-signs",
    excerpt: "Ignoring dental pain can lead to serious complications. Learn the top 5 symptoms that warrant an immediate dental visit and how early intervention can save your teeth.",
    featured: true,
  },
  {
    id: 2,
    title: "Invisalign vs Traditional Braces: Which Is Right for You?",
    category: "Orthodontics",
    readTime: "7 min",
    date: "Oct 05, 2024",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop",
    slug: "invisalign-vs-braces",
    excerpt: "A detailed comparison of Invisalign and traditional braces to help you choose the right orthodontic treatment for your lifestyle, budget, and dental needs.",
  },
  {
    id: 3,
    title: "The Truth About Teeth Whitening: What Actually Works",
    category: "Cosmetic",
    readTime: "4 min",
    date: "Sep 28, 2024",
    image: "https://images.unsplash.com/photo-1606240724602-5b21f896eae8?w=600&h=400&fit=crop",
    slug: "truth-about-teeth-whitening",
    excerpt: "We separate whitening myths from facts and explain which professional treatments deliver real, lasting results without damaging your enamel.",
  },
  {
    id: 4,
    title: "How Regular Dental Checkups Can Save You Thousands",
    category: "Prevention",
    readTime: "6 min",
    date: "Sep 15, 2024",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&h=400&fit=crop",
    slug: "regular-dental-checkups",
    excerpt: "Preventive care is an investment. Learn how routine visits catch problems early and save you from expensive treatments down the road.",
  },
  {
    id: 5,
    title: "Complete Guide to Dental Implants: Process, Cost & Recovery",
    category: "Dental Health",
    readTime: "8 min",
    date: "Sep 02, 2024",
    image: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&h=400&fit=crop",
    slug: "dental-implants-guide",
    excerpt: "Everything you need to know about dental implants — from the surgical process and recovery timeline to costs and insurance coverage in India.",
  },
  {
    id: 6,
    title: "Best Foods for Strong Teeth and Healthy Gums",
    category: "Tips",
    readTime: "4 min",
    date: "Aug 22, 2024",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&h=400&fit=crop",
    slug: "foods-for-healthy-teeth",
    excerpt: "Your diet plays a crucial role in oral health. Discover the top foods that strengthen enamel, fight bacteria, and keep your gums healthy.",
  },
  {
    id: 7,
    title: "What to Expect During Your First Orthodontic Visit",
    category: "Orthodontics",
    readTime: "5 min",
    date: "Aug 10, 2024",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&h=400&fit=crop",
    slug: "first-orthodontic-visit",
    excerpt: "Nervous about your first orthodontic consultation? Here's a step-by-step guide to what happens and how to prepare for it.",
  },
  {
    id: 8,
    title: "How to Overcome Dental Anxiety: Expert Tips",
    category: "Tips",
    readTime: "5 min",
    date: "Jul 28, 2024",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
    slug: "overcome-dental-anxiety",
    excerpt: "Dental anxiety is common but manageable. Our experts share practical strategies to help you feel calm and comfortable during your visit.",
  },
  {
    id: 9,
    title: "The Rise of Digital Dentistry: How Technology Is Changing Care",
    category: "Dental Health",
    readTime: "6 min",
    date: "Jul 15, 2024",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
    slug: "digital-dentistry",
    excerpt: "From 3D imaging to AI-powered diagnostics, discover how digital technology is revolutionizing dental treatments and patient outcomes.",
  },
];

const categoryColors: Record<string, string> = {
  "Dental Health": "bg-blue-600",
  "Orthodontics": "bg-teal-600",
  "Cosmetic": "bg-purple-600",
  "Prevention": "bg-emerald-600",
  "Tips": "bg-amber-600",
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<typeof allPosts[0] | null>(null);

  const filtered = allPosts.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = allPosts.find(p => p.featured);
  const gridPosts = filtered.filter(p => !p.featured || activeCategory !== "All");

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title="Dental Insights"
        titleAccent="& Articles"
        subtitle="Expert advice, oral health tips, and the latest news in modern dentistry from our specialists."
        breadcrumbs={[{ label: "Blog" }]}
      />

      {/* Featured Post */}
      {activeCategory === "All" && !searchQuery && featuredPost && (
        <section className="py-10 md:py-12 bg-white">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
            <div onClick={() => setSelectedPost(featuredPost)} className="group block cursor-pointer">
              <div className="grid md:grid-cols-2 gap-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:border-slate-300 transition-all duration-300">
                <div className="relative h-64 md:h-full overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className={`absolute top-4 left-4 px-3 py-1 ${categoryColors[featuredPost.category] ?? "bg-blue-600"} text-white text-[10px] font-semibold uppercase tracking-wider rounded-md`}>
                    {featuredPost.category}
                  </span>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Featured Article</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{featuredPost.readTime} read</span>
                    </div>
                  </div>
                  <div className="mt-5">
                    <span className="inline-flex items-center text-blue-600 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">All Articles</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 font-display">
                Browse Our Latest Posts
              </h2>
            </div>
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="cursor-pointer group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 ${categoryColors[post.category] ?? "bg-blue-600"} text-white text-[10px] font-semibold uppercase tracking-wider rounded-md`}>
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-3 mb-4 flex-grow leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime} read</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 text-sm">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

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
                    <p className="text-justify leading-relaxed font-medium">
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

      {/* Newsletter Section */}
      <section className="relative py-10 md:py-12 overflow-hidden border-y border-slate-800 bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-px w-[480px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/5 blur-3xl" />
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
              <button className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-blue-600/25 shrink-0 cursor-pointer">
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-[11px] text-slate-600">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
