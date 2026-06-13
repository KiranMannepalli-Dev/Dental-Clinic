"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Calendar, Clock, ArrowLeft, User2, BookOpen } from "lucide-react";
import Link from "next/link";
import { API_URL, safeJsonFetch } from "@/lib/api";

const categoryColors: Record<string, string> = {
  "Dental Health": "bg-blue-600",
  Orthodontics: "bg-teal-600",
  Cosmetic: "bg-purple-600",
  Prevention: "bg-emerald-600",
  Tips: "bg-amber-600",
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    safeJsonFetch(`${API_URL}/public/blogs/${slug}`)
      .then((data) => {
        if (data.success && data.data) {
          setPost(data.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-48 bg-slate-100 animate-pulse" />
        <div className="container mx-auto px-6 py-16 max-w-3xl space-y-4">
          {[80, 60, 100, 40, 90, 70, 50, 85].map((w, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center py-32 gap-4">
        <BookOpen className="w-16 h-16 text-slate-200" />
        <h1 className="text-2xl font-bold text-slate-700">Article Not Found</h1>
        <p className="text-slate-500 text-sm">This blog post doesn't exist or may have been removed.</p>
        <Link href="/blog" className="mt-4 inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const catColor = categoryColors[post.category] ?? "bg-blue-600";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHero
        title="Blog"
        titleAccent="Article"
        subtitle={post.title}
        breadcrumbs={[
          { label: "Blog", href: "/blog" },
          { label: "Article" },
        ]}
      />

      <article className="py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link
              href="/blog"
              className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to all articles
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-6">
              {post.category && (
                <span className={`${catColor} text-white px-3 py-1 rounded-md font-semibold uppercase tracking-wider text-[10px]`}>
                  {post.category}
                </span>
              )}
              {post.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-600">{formatDate(post.publishedAt)}</span>
                </div>
              )}
              {post.readTimeMinutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-600">{post.readTimeMinutes} min read</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-display leading-tight">
              {post.title}
            </h1>

            {/* Author */}
            {post.author && (
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-blue-100" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                    <User2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Dr. {post.author.firstName} {post.author.lastName}
                  </p>
                  {post.author.specialization && (
                    <p className="text-xs text-slate-500">{post.author.specialization}</p>
                  )}
                </div>
              </div>
            )}

            {/* Main Image */}
            {post.featuredImageUrl && (
              <div className="rounded-xl overflow-hidden mb-10 h-[300px] md:h-[450px] shadow-sm border border-slate-100">
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg prose-slate prose-blue max-w-none text-slate-600">
              {/* Excerpt as lead */}
              {post.excerpt && (
                <p className="text-xl font-medium leading-relaxed text-slate-800 mb-8 not-prose">
                  {post.excerpt}
                </p>
              )}

              {/* Full content - render as HTML if it contains tags, else as text */}
              {post.content && (
                post.content.includes('<') ? (
                  <div
                    className="prose-content leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </div>
                )
              )}
            </div>

            {/* Author CTA */}
            {post.author?.slug && (
              <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-xl border border-blue-100">
                  {post.author.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-blue-200 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 shrink-0">
                      <User2 className="w-7 h-7 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-0.5">About the Author</p>
                    <p className="font-bold text-slate-800">Dr. {post.author.firstName} {post.author.lastName}</p>
                    <p className="text-xs text-slate-500">{post.author.specialization}</p>
                  </div>
                  <Link
                    href={`/doctors/${post.author.slug}`}
                    className="shrink-0 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
