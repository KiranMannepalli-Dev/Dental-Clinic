"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Clock, Send, ArrowRight, Calendar,
  ChevronDown, MessageCircle
} from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["2 Floor, Heshvitha Dental, Government Hospital, Road", "Kota Reddy Nagar, Kandukur, AP 523105"],
    action: { label: "Get Directions", href: "https://maps.google.com/?q=Heshvitha+Multi+Speciality+Dental+Hospital+Kandukur" },
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["083746 21025"],
    action: { label: "Call Now", href: "tel:08374621025" },
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["hello@heshvithadental.com", "appointments@heshvithadental.com"],
    action: { label: "Send Email", href: "mailto:hello@heshvithadental.com" },
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon–Fri: 9:00 AM – 8:00 PM", "Sat: 9:00 AM – 6:00 PM", "Sun: Emergency Only"],
    action: { label: "Book Appointment", href: "/appointment" },
  },
];

const serviceOptions = [
  "General Consultation",
  "Dental Implants",
  "Teeth Whitening",
  "Invisalign / Braces",
  "Root Canal Treatment",
  "Smile Makeover",
  "Pediatric Dentistry",
  "Emergency Care",
  "Other",
];

const faqs = [
  {
    q: "How do I book an appointment?",
    a: "You can book online through our appointment page, call us at 083746 21025, or visit the clinic directly. Online bookings are confirmed within 30 minutes."
  },
  {
    q: "Do you accept dental insurance?",
    a: "Yes, we accept all major dental insurance plans. We also offer cashless treatment with select insurers. Contact us with your insurance details for verification."
  },
  {
    q: "What are the payment options?",
    a: "We accept cash, all major credit/debit cards, UPI, and bank transfers. EMI options are available for treatments above ₹30,000 with select banks."
  },
  {
    q: "Is there parking available?",
    a: "Yes, we have free dedicated parking for patients at our Kandukur hospital. Both car and two-wheeler parking is available."
  },
  {
    q: "Do you treat children?",
    a: "Absolutely! We have a dedicated pediatric dentist, Dr. Ananya Patel, who specializes in child-friendly dental care for kids of all ages."
  },
  {
    q: "What should I bring to my first visit?",
    a: "Please bring a valid photo ID, any previous dental records or X-rays, your insurance card (if applicable), and a list of current medications."
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", service: "", message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    alert("Thank you! We'll get back to you within 24 hours.");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title="Get in"
        titleAccent="Touch"
        subtitle="Have a question or want to book an appointment? Reach out to us — we're here to help you smile."
        breadcrumbs={[{ label: "Contact" }]}
      />

      {/* Contact Info Cards */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-16">
            {contactInfo.map((item, i) => (
              <div
                key={i}
                className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 duration-300 mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{item.title}</h3>
                {item.details.map((detail, j) => (
                  <p key={j} className="text-xs text-slate-500 leading-relaxed">{detail}</p>
                ))}
                <a
                  href={item.action.href}
                  className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold mt-3 hover:text-blue-700 transition-colors group/link"
                >
                  {item.action.label}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                </a>
              </div>
            ))}
          </div>

          {/* Contact Form + Map */}
          <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Form */}
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Send Us a Message</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6 font-display">
                We&apos;d Love to Hear From You
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700 mb-1.5">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium text-slate-700 mb-1.5">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-medium text-slate-700 mb-1.5">Phone Number *</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="083746 21025"
                      className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-service" className="block text-xs font-medium text-slate-700 mb-1.5">Service Interested In</label>
                    <select
                      id="contact-service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select a service</option>
                      {serviceOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-medium text-slate-700 mb-1.5">Your Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us about your dental concern or question..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all resize-none"
                  />
                </div>

                <Button type="submit" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 text-sm font-medium shadow-sm transition-all w-full sm:w-auto cursor-pointer">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <p className="text-[11px] text-slate-400 mt-2">
                  We typically respond within 2–4 hours during business hours.
                </p>
              </form>
            </div>

            {/* Map */}
            <div className="flex flex-col">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Our Location</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6 font-display">
                Find Us Easily
              </h2>
              <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                <iframe
                  src="https://maps.google.com/maps?q=Heshvitha+Multi+Speciality+Dental+Hospital,+Kandukur&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "380px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Heshvitha Multi Speciality Dental Hospital Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Got Questions?</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Find quick answers to the most common questions about our clinic and services.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${
                  openFaq === i ? "border-blue-200 shadow-md" : "border-slate-200 shadow-sm"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <h3 className={`text-sm font-semibold transition-colors pr-4 ${openFaq === i ? "text-blue-600" : "text-slate-900"}`}>
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-48" : "max-h-0"}`}>
                  <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-10 md:py-12 overflow-hidden border-y border-slate-800 bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-px w-[480px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/5 blur-3xl" />
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Prefer to Talk?</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
              Call Us <span className="text-blue-400">Anytime</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-7">
              Our team is available Mon–Sat to answer your questions and help you book an appointment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/appointment"
                className="group inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-blue-600/25 hover:shadow-md w-full sm:w-auto"
              >
                <Calendar className="h-3.5 w-3.5" />
                Book Appointment
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="tel:08374621025"
                className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg border border-slate-700 hover:border-slate-600 bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 w-full sm:w-auto"
              >
                <Phone className="h-3.5 w-3.5" />
                083746 21025
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
