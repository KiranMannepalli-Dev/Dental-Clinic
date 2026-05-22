import { notFound } from "next/navigation";
import { services } from "@/data/services";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar, Phone, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

// Generate metadata dynamically
export function generateMetadata({ params }: ServicePageProps): Metadata {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) {
    return { title: "Service Not Found" };
  }
  return {
    title: `${service.title} | Heshvitha Multi Speciality Dental Hospital`,
    description: service.description,
  };
}

// Pre-render all service pages at build time
export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export default function ServiceDetailsPage({ params }: ServicePageProps) {
  const service = services.find((s) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  const Icon = service.icon;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title={service.title}
        subtitle={service.shortDesc}
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image Side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl transform translate-x-3 translate-y-3 opacity-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500"></div>
              <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square overflow-hidden rounded-2xl shadow-sm border border-slate-200">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 mb-6 uppercase tracking-wider">
                {service.category} Service
              </div>
              
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 font-display leading-tight">
                Premium {service.title} in Kandukur
              </h2>
              
              <div className="prose prose-slate prose-blue max-w-none mb-8">
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {service.description}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  At Heshvitha Multi Speciality Dental Hospital, we utilize state-of-the-art technology and evidence-based protocols to ensure your {service.name.toLowerCase()} procedure is as comfortable, safe, and effective as possible. Our experienced specialists tailor every step of the treatment to your unique dental profile.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Expert Specialists</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Advanced Technology</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Painless Procedures</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">Affordable Pricing</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild>
                  <Link href="/appointment">
                    <Calendar className="mr-2 h-5 w-5" /> Book Appointment
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50" asChild>
                  <a href="tel:08374621025">
                    <Phone className="mr-2 h-5 w-5" /> Call for Info
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to experience the best {service.title}?
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation today to discuss your {service.name.toLowerCase()} needs with our highly skilled professionals.
          </p>
          <Button size="lg" className="rounded-lg bg-white text-slate-900 hover:bg-slate-100 px-8" asChild>
            <Link href="/free-consultation">
              Request Free Consultation <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
