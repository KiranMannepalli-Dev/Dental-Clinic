import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";

const insurances = [
  "Star Health",
  "HDFC ERGO",
  "ICICI Lombard",
  "Niva Bupa",
  "Care Health",
  "Aditya Birla",
  "SBI General",
  "TATA AIG",
];

const benefits = [
  "Direct billing available",
  "Cashless treatments",
  "0% EMI options",
  "Transparent pricing",
];

export function InsuranceSection() {
  return (
    <section className="py-12 md:py-16 bg-white border-y border-slate-100">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Info */}
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Insurance Partners</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">
              We Accept Major Health Insurances
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              We believe quality dental care should be accessible. Our billing team works with major insurance providers to maximise your benefits and handle all the paperwork for you.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  <span className="text-slate-700 font-medium text-sm">{b}</span>
                </div>
              ))}
            </div>

            <a
              href="tel:08374621025"
              className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm"
            >
              <Phone className="h-4 w-4" />
              Call to verify your insurance coverage
            </a>
          </div>

          {/* Right: Provider grid */}
          <div className="bg-slate-50 rounded-md p-8 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-6">Accepted Providers</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {insurances.map((provider) => (
                <div
                  key={provider}
                  className="bg-white rounded-md h-16 flex items-center justify-center px-3 shadow-sm border border-slate-200 hover:border-blue-600 transition-colors duration-150 group"
                >
                  <span className="font-semibold text-slate-500 text-center text-xs group-hover:text-blue-600 transition-colors leading-tight">
                    {provider}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t see your provider?{" "}
                <Link href="/contact" className="text-blue-600 font-semibold hover:underline">
                  Contact us
                </Link>{" "}
                to verify.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
