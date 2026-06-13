"use client";

import { useEffect, useState } from "react";
import { X, Star, Calendar, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

interface AlertItem {
  id: string;
  type: "booking" | "review" | "warning" | "status";
  icon: React.ElementType;
  iconColor: string;
  title: string;
  desc: string;
  ctaText?: string;
  ctaHref?: string;
}

const ALERTS: AlertItem[] = [
  {
    id: "booking-1",
    type: "booking",
    icon: Calendar,
    iconColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    title: "Appointment Booked",
    desc: "Ramesh K. from Kandukur just scheduled a Root Canal Consultation.",
    ctaText: "Book Yours",
    ctaHref: "/appointment"
  },
  {
    id: "review-1",
    type: "review",
    icon: Star,
    iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    title: "5-Star Review Received",
    desc: "Priya M. — 'Highly recommend Heshvitha Dental! The doctor was very patient and professional.'",
    ctaText: "Read Reviews",
    ctaHref: "/#testimonials"
  },
  {
    id: "warning-1",
    type: "warning",
    icon: AlertCircle,
    iconColor: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30",
    title: "High Demand",
    desc: "Only 2 dental hygiene slots left available for this Saturday.",
    ctaText: "Reserve Slot",
    ctaHref: "/appointment"
  },
  {
    id: "status-1",
    type: "status",
    icon: MessageSquare,
    iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    title: "Specialist Online",
    desc: "Dr. Priya Reddy is currently online to answer your questions on WhatsApp.",
    ctaText: "Chat Now",
    ctaHref: "https://wa.me/918374621025"
  },
  {
    id: "booking-2",
    type: "booking",
    icon: Calendar,
    iconColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    title: "Smile Design Appointment",
    desc: "Anita S. recently completed her Dental Veneers smile makeover consultation.",
    ctaText: "See Services",
    ctaHref: "/services"
  },
  {
    id: "review-2",
    type: "review",
    icon: Sparkles,
    iconColor: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
    title: "Trusted Care",
    desc: "20,000+ smile transformations completed with industry-leading medical standards.",
    ctaText: "Why Us",
    ctaHref: "/#why-choose-us"
  }
];

const SESSION_KEY = "social-proof-dismissed";

export function SocialProofNotification() {
  const [activeAlert, setActiveAlert] = useState<AlertItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(SESSION_KEY) === "true";
    if (isDismissed) return;

    setDismissed(false);

    let activeTimeout: ReturnType<typeof setTimeout>;
    let queueTimeout: ReturnType<typeof setTimeout>;

    const showAlert = (index: number) => {
      setActiveAlert(ALERTS[index]);
      setVisible(true);

      activeTimeout = setTimeout(() => {
        setVisible(false);
        queueTimeout = setTimeout(() => {
          showAlert((index + 1) % ALERTS.length);
        }, 15000);
      }, 6000);
    };

    // Initial trigger
    const initialTimer = setTimeout(() => {
      showAlert(0);
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(activeTimeout);
      clearTimeout(queueTimeout);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    }, 300);
  };

  if (dismissed || !activeAlert) return null;

  const Icon = activeAlert.icon;

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 max-w-sm w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 flex gap-3 transition-all duration-500 ease-out select-none
        ${visible ? "translate-y-0 opacity-100 scale-100 animate-in fade-in slide-in-from-bottom-4" : "translate-y-12 opacity-0 scale-95 pointer-events-none"}
      `}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${activeAlert.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
          {activeAlert.title}
        </p>
        <p className="text-[12px] text-slate-700 dark:text-slate-200 font-medium leading-normal mb-1.5">
          {activeAlert.desc}
        </p>
        {activeAlert.ctaText && activeAlert.ctaHref && (
          <Link
            href={activeAlert.ctaHref}
            target={activeAlert.ctaHref.startsWith("http") ? "_blank" : "_self"}
            className="inline-block text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {activeAlert.ctaText} &rarr;
          </Link>
        )}
      </div>

      <button
        onClick={handleClose}
        className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
