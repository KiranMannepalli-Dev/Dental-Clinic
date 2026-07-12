import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastNotification";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Heshvitha Multi Speciality Dental Hospital | Best Dentist in Kandukur, AP",
    template: "%s | Heshvitha Dental Hospital Kandukur"
  },
  description: "Heshvitha Multi Speciality Dental Hospital in Kandukur, Andhra Pradesh offers top-quality dental treatments including root canal therapy, dental implants, teeth whitening, orthodontics, & braces. Book an appointment with the best dentist in Kandukur.",
  keywords: [
    "best dental clinic in kandukur",
    "dentist in kandukur",
    "dental hospital in kandukur",
    "best dentist in kandukur AP",
    "root canal treatment in kandukur",
    "dental clinic near me kandukur",
    "braces cost in kandukur",
    "dental implants kandukur andhra pradesh",
    "heshvitha dental clinic kandukur",
    "teeth whitening kandukur",
    "pediatric dentist kandukur",
    "tooth extraction kandukur",
    "painless dental treatments andhra pradesh"
  ],
  openGraph: {
    title: "Heshvitha Multi Speciality Dental Hospital | Best Dentist in Kandukur, AP",
    description: "Get state-of-the-art dental care at Heshvitha Multi Speciality Dental Hospital, Kandukur, Andhra Pradesh. Experienced doctors, modern equipment, and gentle care.",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
