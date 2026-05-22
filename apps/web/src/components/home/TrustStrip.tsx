"use client";

import { useEffect, useState, useRef } from "react";
import { Award, Users, Star, Clock, ThumbsUp } from "lucide-react";

const stats = [
  { id: 1, icon: Award,      value: 15,    suffix: "+",   label: "Years Experience" },
  { id: 2, icon: Users,      value: 20000, suffix: "+",   label: "Smiles Restored" },
  { id: 3, icon: Star,       value: 50,    suffix: "+",   label: "Expert Doctors" },
  { id: 4, icon: Clock,      value: 24,    suffix: "/7",  label: "Emergency Care" },
  { id: 5, icon: ThumbsUp,   value: 99,    suffix: "%",   label: "Satisfaction Rate" },
];

function AnimatedCounter({ end, duration = 1800 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf: number;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      let startTime: number | null = null;
      const animate = (ts: number) => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        setCount(Math.floor(ease * end));
        if (p < 1) raf = requestAnimationFrame(animate);
        else setCount(end);
      };
      raf = requestAnimationFrame(animate);
    }, { threshold: 0.2 });

    if (ref.current) observer.observe(ref.current);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function TrustStrip() {
  return (
    <section className="bg-slate-950 py-8 text-white border-b border-slate-900">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="flex flex-wrap items-center justify-center lg:justify-between gap-x-10 gap-y-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center gap-4 min-w-[160px] justify-center lg:justify-start"
            >
              <stat.icon className="h-6 w-6 text-blue-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
                  <AnimatedCounter end={stat.value} />{stat.suffix}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-1">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
