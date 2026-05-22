import { PageHero } from "@/components/layout/PageHero";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Sitemap | Heshvitha Multi Speciality Dental Hospital",
  description: "Navigate easily through Heshvitha Dental Hospital's website using our sitemap.",
};

const sitemapLinks = [
  {
    category: "Main Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Our Specialists", href: "/doctors" },
      { label: "Gallery", href: "/gallery" },
      { label: "Contact Us", href: "/contact" },
    ]
  },
  {
    category: "Services & Care",
    links: [
      { label: "All Dental Services", href: "/services" },
      { label: "Book Appointment", href: "/appointment" },
      { label: "Free Consultation", href: "/free-consultation" },
      { label: "Emergency Care", href: "/services/emergency-care" },
    ]
  },
  {
    category: "Resources & Legal",
    links: [
      { label: "Dental Blog", href: "/blog" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Sitemap", href: "/sitemap" },
    ]
  }
];

export default function SitemapPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHero
        title="Website"
        titleAccent="Sitemap"
        subtitle="Find your way around our website with this simple directory."
        breadcrumbs={[{ label: "Sitemap" }]}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10">
            {sitemapLinks.map((section) => (
              <div key={section.category} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  {section.category}
                </h2>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group"
                      >
                        <ChevronRight className="h-4 w-4 mr-2 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
