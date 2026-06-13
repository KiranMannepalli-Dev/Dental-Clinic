import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastNotification";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: "Heshvitha Multi Speciality Dental Hospital",
  description: "Advanced dental care and treatments.",
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
