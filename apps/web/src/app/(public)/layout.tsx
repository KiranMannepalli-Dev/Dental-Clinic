import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SocialProofNotification } from "@/components/ui/SocialProofNotification";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingButtons />
      <SocialProofNotification />
    </>
  );
}

