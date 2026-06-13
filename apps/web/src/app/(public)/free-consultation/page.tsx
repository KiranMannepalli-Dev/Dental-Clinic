"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";

export default function FreeConsultationPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PageHero
        title="Free"
        titleAccent="Consultation"
        subtitle="Take the first step towards a healthier, brighter smile. Request a call back and our team will get in touch to arrange your free consultation."
        breadcrumbs={[{ label: "Free Consultation" }]}
      />

      <div className="py-16 md:py-24 container mx-auto px-6">
        <div className="max-w-md mx-auto">
          {isSubmitted ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3 font-display">
                Request Received!
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Thank you, <span className="font-semibold text-slate-900">{formData.name}</span>. We&apos;ve received your details. Our clinic will be in touch shortly at <span className="font-semibold text-slate-900">{formData.phone}</span> to arrange your free consultation.
              </p>
              <Button asChild className="w-full h-12 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2 font-display">
                  Request a Call Back
                </h2>
                <p className="text-sm text-slate-600">
                  Leave your name and number below, and our care team will contact you to schedule your free consultation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="083746 21025"
                      className="w-full h-12 pl-12 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-300 transition-all"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-base transition-all group"
                >
                  Request Consultation
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <p className="text-xs text-center text-slate-500 mt-4">
                  By submitting this form, you agree to our clinic contacting you regarding your appointment.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
