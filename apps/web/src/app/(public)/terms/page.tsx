import { PageHero } from "@/components/layout/PageHero";

export const metadata = {
  title: "Terms of Service | Heshvitha Multi Speciality Dental Hospital",
  description: "Read the terms and conditions for using Heshvitha Dental Hospital's website and services.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHero
        title="Terms of"
        titleAccent="Service"
        subtitle="Please read our simple and transparent terms of service before proceeding."
        breadcrumbs={[{ label: "Terms of Service" }]}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto space-y-8 text-slate-600 leading-relaxed text-sm md:text-base">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Welcome to Heshvitha Dental</h2>
              <p>
                By accessing this website and utilizing our services, you agree to be bound by these Terms of Service. Our goal is to provide exceptional dental care in a safe and comfortable environment.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Appointments and Cancellations</h2>
              <p>
                We value your time and ours. When you book an appointment, we reserve that time exclusively for you. If you need to cancel or reschedule, please provide us with at least 24 hours&apos; notice so we can offer the slot to another patient in need.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Medical Advice Disclaimer</h2>
              <p>
                The content on this website is for informational purposes only and does not constitute professional medical advice. Always seek the advice of a qualified dentist with any questions you may have regarding a dental condition.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Treatment Estimates</h2>
              <p>
                Following your consultation, we will provide you with a comprehensive treatment plan and an estimated cost. Please note that dental treatments can sometimes change once the procedure begins due to unforeseen clinical findings. We will always discuss any changes with you before proceeding.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Updates to Terms</h2>
              <p>
                We may occasionally update these Terms of Service to reflect changes in our practices or relevant laws. We encourage you to review this page periodically.
              </p>
            </div>
            
            <p className="pt-8 text-sm text-slate-400">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
