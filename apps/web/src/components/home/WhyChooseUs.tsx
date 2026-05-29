import { Clock, Shield, Sparkles, UserCheck, HeartPulse, Microscope } from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Expert Specialists",
    description: "Highly qualified doctors with decades of combined experience in advanced dentistry."
  },
  {
    icon: Microscope,
    title: "Modern Technology",
    description: "State-of-the-art equipment including 3D imaging and laser dentistry for precise treatments."
  },
  {
    icon: HeartPulse,
    title: "Painless Procedures",
    description: "We use the latest techniques and anesthesia to ensure a comfortable, pain-free experience."
  },
  {
    icon: Shield,
    title: "Highest Hygiene Standards",
    description: "Strict sterilization protocols ensuring 100% safety and infection control."
  },
  {
    icon: Clock,
    title: "No Waiting Times",
    description: "Respecting your time with punctual appointments and efficient care delivery."
  },
  {
    icon: Sparkles,
    title: "Personalized Care",
    description: "Customized treatment plans tailored to your specific needs and aesthetic goals."
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Overlapping Dual Image Layout */}
          <div className="relative mx-auto w-full max-w-[380px] lg:max-w-[420px] pb-6 sm:pb-8">
            {/* Decorative Dot Grid Background */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-30 -z-10" />
            
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-md shadow-sm overflow-hidden bg-slate-50 border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80" 
                alt="Modern Dental Surgery Room" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Secondary Overlapping Image */}
            <div className="absolute -bottom-4 -left-8 w-[200px] aspect-[4/3] rounded-md border border-slate-200 shadow-md overflow-hidden bg-slate-50 hidden sm:block">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80" 
                alt="Smiling Patient Care" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Glassmorphic Badge 1: Top Right */}
            <div className="absolute -top-3 right-0 sm:-right-3 bg-white/90 backdrop-blur-md py-2 px-3.5 rounded-md shadow-md border border-slate-100/80 flex items-center gap-2 z-10">
              <div className="text-amber-500 bg-amber-50 p-1.5 rounded-md border border-amber-100">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-slate-900 leading-none">ISO Certified</p>
                <p className="text-[9px] text-slate-500 mt-0.5 font-medium leading-none">Standard Clinic</p>
              </div>
            </div>

            {/* Glassmorphic Badge 2: Bottom Right */}
            <div className="absolute bottom-6 right-0 sm:-right-3 bg-white/90 backdrop-blur-md py-2 px-3.5 rounded-md shadow-md border border-slate-100/80 flex items-center gap-2 z-10">
              <div className="text-blue-600 bg-blue-50 p-1.5 rounded-md border border-blue-100">
                <Shield className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-slate-900 leading-none">100% Safe</p>
                <p className="text-[9px] text-slate-500 mt-0.5 font-medium leading-none">Sterilized Environment</p>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Why Choose Us</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 leading-tight font-display">
                Excellence in Every Detail
              </h2>
              <p className="text-sm md:text-base text-slate-650 leading-relaxed">
                We combine years of expertise with cutting-edge technology to deliver dental care that exceeds your expectations.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-blue-100/80 p-4 rounded-md shadow-sm hover:shadow-md transition-all duration-300 flex gap-4"
                >
                  <div className="w-10 h-10 shrink-0 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 duration-350">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p className="text-slate-550 text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
