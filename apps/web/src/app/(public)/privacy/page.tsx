import { PageHero } from "@/components/layout/PageHero";

export const metadata = {
  title: "Privacy Policy | Heshvitha Multi Speciality Dental Hospital",
  description: "Learn how Heshvitha Dental Hospital protects your privacy and personal medical information.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHero
        title="Privacy"
        titleAccent="Policy"
        subtitle="Your privacy and medical confidentiality are our top priorities."
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto space-y-8 text-slate-600 leading-relaxed text-sm md:text-base">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
              <p>
                At Heshvitha Multi Speciality Dental Hospital, we collect information necessary to provide you with the best possible dental care. This includes your personal details (name, contact information), medical history, and dental records. When you visit our website, we may also collect basic browsing data to improve our online experience.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
              <p>
                Your information is used strictly for medical and administrative purposes. This includes scheduling appointments, diagnosing dental conditions, formulating treatment plans, and communicating with you regarding your care. We do not sell or rent your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Medical Confidentiality</h2>
              <p>
                We adhere to strict medical confidentiality standards. Your dental records and medical history are kept secure and are only accessible to authorized healthcare professionals directly involved in your treatment.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Security</h2>
              <p>
                We implement industry-standard physical, technical, and administrative security measures to protect your data against unauthorized access, alteration, or disclosure.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Contact Us</h2>
              <p>
                If you have any questions or concerns about our privacy practices or wish to update your medical records, please contact us at <strong>hello@heshvithadental.com</strong> or call us at <strong>083746 21025</strong>.
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
