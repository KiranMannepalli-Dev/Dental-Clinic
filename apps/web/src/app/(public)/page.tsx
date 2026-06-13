import { HeroSection } from "@/components/home/HeroSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { DoctorsSection } from "@/components/home/DoctorsSection";
import { BeforeAfterSection } from "@/components/home/BeforeAfterSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { AppointmentCTABanner } from "@/components/home/AppointmentCTABanner";
import { InsuranceSection } from "@/components/home/InsuranceSection";
import { BlogPreview } from "@/components/home/BlogPreview";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <TrustStrip />
      <ServicesSection />
      <WhyChooseUs />
      <DoctorsSection />
      <BeforeAfterSection />
      <TestimonialsSection />
      <AppointmentCTABanner />
      <InsuranceSection />
      <BlogPreview />
    </div>
  );
}
