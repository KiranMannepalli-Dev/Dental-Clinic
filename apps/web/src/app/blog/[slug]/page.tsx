import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

export function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = allPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHero
        title="Blog"
        titleAccent="Article"
        subtitle={post.title}
        breadcrumbs={[
          { label: "Blog", href: "/blog" },
          { label: "Article" }
        ]}
      />

      <article className="py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto">
            {/* Top Back Link */}
            <Link 
              href="/blog" 
              className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to all articles
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-6">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-semibold uppercase tracking-wider text-[10px]">
                {post.category}
              </span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-slate-600">{post.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-slate-600">{post.readTime} read</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 font-display leading-tight">
              {post.title}
            </h1>

            {/* Main Image */}
            <div className="rounded-xl overflow-hidden mb-10 h-[300px] md:h-[450px] shadow-sm border border-slate-100">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-slate prose-blue max-w-none text-slate-600">
              <p className="text-xl font-medium leading-relaxed text-slate-800 mb-8">
                {post.excerpt}
              </p>
              
              <p className="leading-relaxed mb-6">
                Maintaining good oral hygiene is essential for overall health. By understanding the fundamentals and following professional advice, you can protect your smile and avoid costly treatments down the road. This article delves into the specific details to ensure you have the best possible dental outcomes.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">Why This Matters</h2>
              <p className="leading-relaxed mb-6">
                Ignoring early warning signs is the number one reason patients end up needing extensive and expensive procedures. Regular checkups, timely interventions, and proper daily care form the foundation of a lifelong healthy smile. When we look closely at clinical data, early prevention directly correlates to long-term dental health.
              </p>
              
              <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">What You Can Do Today</h2>
              <ul className="list-disc pl-6 space-y-3 mb-8">
                <li><strong className="text-slate-800">Brush twice a day</strong> with a fluoride-based toothpaste for exactly two minutes.</li>
                <li><strong className="text-slate-800">Floss daily</strong> to remove plaque where your toothbrush simply can't reach.</li>
                <li><strong className="text-slate-800">Limit sugar</strong> and highly acidic beverages which wear down enamel over time.</li>
                <li><strong className="text-slate-800">Schedule checkups</strong> at least twice a year for professional cleaning.</li>
              </ul>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-8">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Expert Tip</h3>
                <p className="text-slate-700 m-0">
                  A healthy smile starts from within. Always remember to stay hydrated, as water naturally washes away food particles and bacteria throughout the day.
                </p>
              </div>

              <p className="leading-relaxed">
                If you have any questions or want to discuss a specific dental issue, our expert team at Heshvitha Dental is always here to help. <Link href="/contact" className="text-blue-600 font-semibold hover:underline">Contact us</Link> to set up a personalized consultation today.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
