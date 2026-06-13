"use client";
import { API_URL, safeJsonFetch } from "@/lib/api";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Calendar as CalendarIcon, IndianRupee, Activity,
  Clock, CheckCircle, XCircle, ArrowUpRight, Plus, Eye,
  ChevronRight, Sparkles, MessageSquare, BookOpen, TrendingUp,
  Bell, UserPlus, Star, Zap, BarChart2, RefreshCw, TrendingDown,
  Minus, AlertCircle, CheckCircle2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/50",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/50",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/50",
  CANCELLED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/50",
  NO_SHOW: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700/50",
  RESCHEDULED: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-900/50",
};

function timeAgo(date: string | Date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const activityIcons: Record<string, any> = {
  booking: { icon: CalendarIcon, color: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  lead: { icon: MessageSquare, color: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400" },
  review: { icon: Star, color: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  payment: { icon: IndianRupee, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number | string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState<number | string>(0);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;
    if (isNaN(num) || typeof value === "string" && isNaN(parseFloat(value))) {
      setDisplay(value);
      return;
    }
    const duration = 800;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(eased * num));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(num);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value]);

  if (typeof value === "string" && value.includes("₹")) {
    return <>{prefix}₹{typeof display === "number" ? display.toLocaleString("en-IN") : display}{suffix}</>;
  }
  return <>{prefix}{typeof display === "number" ? display.toLocaleString("en-IN") : display}{suffix}</>;
}

// ─── Trend Chip ───────────────────────────────────────────────────────────────
function TrendChip({ value, label }: { value: number; label?: string }) {
  if (value === 0) return (
    <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
      <Minus className="w-2.5 h-2.5" /> No change
    </span>
  );
  const positive = value > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[9px] font-bold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
      {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {positive ? "+" : ""}{value}% {label || "vs last wk"}
    </span>
  );
}

const ACTIVITY_FILTERS = [
  { label: "All", value: "" },
  { label: "Bookings", value: "booking" },
  { label: "Leads", value: "lead" },
  { label: "Reviews", value: "review" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState("");

  const fetchAll = useCallback(async () => {
    setFetchError(null);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) { router.push("/admin/login"); return; }
      const headers = { Authorization: `Bearer ${token}` };

      if (!stats) setIsLoading(true);
      const [statsData, actData, chartData, scheduleData] = await Promise.all([
        safeJsonFetch(`${API_URL}/admin/dashboard/stats`, { headers }),
        safeJsonFetch(`${API_URL}/admin/dashboard/activity`, { headers }),
        safeJsonFetch(`${API_URL}/admin/dashboard/charts`, { headers }),
        safeJsonFetch(`${API_URL}/admin/dashboard/today-schedule`, { headers }),
      ]);

      if (statsData.status === 401 || actData.status === 401) {
        router.push("/admin/login"); return;
      }

      if (statsData.error?.code === "RATE_LIMIT_EXCEEDED") {
        setFetchError("Too many requests — please wait a moment and refresh.");
        return;
      }

      if (statsData.success) setStats(statsData.data);
      if (actData.success) setActivities(actData.data || []);
      if (chartData.success) {
        setWeeklyData(chartData.data.weeklyData || []);
        setMonthlyData(chartData.data.monthlyData || []);
        setTopServices(chartData.data.topServices || []);
      }
      if (scheduleData.success) setTodaySchedule(scheduleData.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setFetchError("Failed to load dashboard data. Check your connection.");
    } finally {
      setIsLoading(false);
      setChartsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const filteredActivities = activityFilter
    ? activities.filter((a) => a.type === activityFilter)
    : activities;

  const todaySummary = {
    confirmed: todaySchedule.filter((a) => a.status === "CONFIRMED").length,
    pending: todaySchedule.filter((a) => a.status === "PENDING").length,
    completed: todaySchedule.filter((a) => a.status === "COMPLETED").length,
    cancelled: todaySchedule.filter((a) => a.status === "CANCELLED" || a.status === "NO_SHOW").length,
  };

  const statCards = [
    {
      label: "Today's Appointments",
      value: stats?.todayAppointments?.total ?? 0,
      sub: `${stats?.todayAppointments?.breakdown?.PENDING || 0} pending`,
      icon: CalendarIcon,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      trend: 8,
      href: "/admin/appointments",
    },
    {
      label: "Monthly Revenue",
      value: stats ? `₹${stats.thisMonthRevenue.toLocaleString("en-IN")}` : 0,
      sub: `${stats?.completedThisMonth || 0} completed visits`,
      icon: IndianRupee,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      trend: 12,
      href: "/admin/appointments",
    },
    {
      label: "Pending Approvals",
      value: stats?.pendingApprovals ?? 0,
      sub: "awaiting confirmation",
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      trend: -3,
      href: "/admin/appointments?status=PENDING",
    },
    {
      label: "Total Patients",
      value: stats?.totalPatients ?? 0,
      sub: `+${stats?.newPatientsThisMonth || 0} this month`,
      icon: Users,
      color: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      trend: 5,
      href: "/admin/patients",
    },
  ];

  return (
    <div className="space-y-5 pb-8">
      {fetchError && (
        <div className="p-4 rounded-xl border bg-amber-50/80 dark:bg-amber-950/20 backdrop-blur-sm text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/30 text-sm flex items-center justify-between">
          <span className="font-medium">⚠️ {fetchError}</span>
          <button onClick={() => setFetchError(null)} className="text-xs font-semibold underline cursor-pointer hover:text-amber-900">Dismiss</button>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Clinic Overview
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Last updated: {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link href="/admin/appointments/new" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" /> New Appointment
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-10 rounded-full -translate-y-4 translate-x-4 group-hover:opacity-20 transition-opacity`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
              {isLoading
                ? <span className="animate-pulse bg-slate-200 dark:bg-slate-850 rounded h-7 w-16 inline-block" />
                : <AnimatedNumber value={card.value} />}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{card.sub}</p>
              {!isLoading && <TrendChip value={card.trend} />}
            </div>
            <ArrowUpRight className="absolute bottom-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Today at a Glance Strip */}
      {!isLoading && todaySchedule.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Today at a Glance
            </h3>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Confirmed", count: todaySummary.confirmed, color: "text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30" },
              { label: "Pending", count: todaySummary.pending, color: "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30" },
              { label: "Completed", count: todaySummary.completed, color: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30" },
              { label: "Cancelled", count: todaySummary.cancelled, color: "text-red-500 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/30" },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl border p-2.5 text-center ${item.color}`}>
                <p className="text-lg font-semibold tabular-nums">{item.count}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide opacity-80">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Timeline horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {todaySchedule.slice(0, 8).map((appt: any) => (
              <div key={appt.id}
                className="shrink-0 w-44 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60 rounded-xl p-3 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
              >
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-450 mb-1">{appt.startTime || "--:--"}</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {appt.patient?.firstName} {appt.patient?.lastName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 truncate mb-2">{appt.service?.name}</p>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${STATUS_COLORS[appt.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                  {appt.status}
                </span>
              </div>
            ))}
            {todaySchedule.length > 8 && (
              <Link href="/admin/appointments"
                className="shrink-0 w-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
              >
                <span className="text-lg font-semibold">+{todaySchedule.length - 8}</span>
                <span className="text-[10px] font-medium">more</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Weekly Appointments Bar Chart */}
        <div className="xl:col-span-2 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Appointments — Last 7 Days
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Daily booking breakdown</p>
            </div>
          </div>
          {chartsLoading ? (
            <div className="h-48 bg-slate-50 dark:bg-slate-950 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={weeklyData} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={25} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#f8fafc", fontSize: "11px", padding: "8px 12px" }}
                  cursor={{ fill: "var(--border)" }}
                />
                <Bar dataKey="confirmed" name="Confirmed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Confirmed</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />Pending</span>
          </div>
        </div>

        {/* Top Services Pie */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm hover:shadow-md transition-all">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            Top Services
          </h3>
          {chartsLoading || topServices.length === 0 ? (
            <div className="h-48 bg-slate-50 dark:bg-slate-950 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={topServices} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3}>
                  {topServices.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#f8fafc", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1.5 mt-2">
            {topServices.slice(0, 4).map((svc: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-semibold text-slate-655 dark:text-slate-400 truncate max-w-[110px]">{svc.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{svc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Revenue Trend — Last 6 Months
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Based on completed appointment service fees</p>
          </div>
        </div>
        {chartsLoading ? (
          <div className="h-40 bg-slate-50 dark:bg-slate-950 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={50}
                tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#f8fafc", fontSize: "11px", padding: "8px 12px" }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Activity Feed + Quick Links */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Real Activity Feed */}
        <div className="xl:col-span-2 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Live Activity Feed
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" /> Live
              </span>
            </h3>

            {/* Filter tabs */}
            <div className="flex items-center gap-1">
              {ACTIVITY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActivityFilter(f.value)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    activityFilter === f.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/40 max-h-80 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-3 flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
                  <div className="flex-grow space-y-1.5">
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : filteredActivities.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic">No recent activity.</div>
            ) : filteredActivities.map((act) => {
              const cfg = activityIcons[act.type] || activityIcons.booking;
              return (
                <div key={act.id} className="px-6 py-3 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <cfg.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug line-clamp-2">{act.text}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block">{timeAgo(act.time)}</span>
                  </div>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide border ${
                    act.status === "CONFIRMED" || act.status === "PAID" || act.status === "PUBLISHED" ? "bg-green-50 text-green-700 border-green-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" :
                    act.status === "PENDING" || act.status === "NEW" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" :
                    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700/50"
                  }`}>{act.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Links */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-250 text-sm flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-450" /> Quick Actions
          </h3>
          {[
            { href: "/admin/appointments", label: "View All Appointments", icon: CalendarIcon, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30" },
            { href: "/admin/patients", label: "Patient Records (EMR)", icon: Users, color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/30" },
            { href: "/admin/contacts", label: "Leads & Inquiries", icon: MessageSquare, color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30" },
            { href: "/admin/blog", label: "Manage Blog Posts", icon: BookOpen, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30" },
            { href: "/admin/reviews", label: "Moderate Reviews", icon: Star, color: "text-rose-600 bg-rose-50 dark:text-rose-450 dark:bg-rose-950/30" },
            { href: "/admin/reports", label: "Analytics & Reports", icon: BarChart2, color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30" },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800/40 group transition-all"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${link.color}`}>
                <link.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-slate-150 transition-colors">{link.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-655 group-hover:text-slate-500 dark:group-hover:text-slate-450 ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
