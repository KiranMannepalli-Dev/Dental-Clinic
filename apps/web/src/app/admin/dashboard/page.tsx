"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Calendar as CalendarIcon, DollarSign, Activity,
  Clock, CheckCircle, XCircle, ArrowUpRight, Plus, Eye,
  ChevronRight, Sparkles, MessageSquare, BookOpen, TrendingUp,
  Bell, UserPlus, Star, Zap, BarChart2, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981"];

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
  booking: { icon: CalendarIcon, color: "bg-blue-100 text-blue-600" },
  lead: { icon: MessageSquare, color: "bg-violet-100 text-violet-600" },
  review: { icon: Star, color: "bg-amber-100 text-amber-600" },
  payment: { icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) { router.push("/admin/login"); return; }
      const headers = { Authorization: `Bearer ${token}` };

      setIsLoading(true);
      const [statsRes, actRes, chartRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard/stats`, { headers }),
        fetch(`${API_URL}/admin/dashboard/activity`, { headers }),
        fetch(`${API_URL}/admin/dashboard/charts`, { headers }),
      ]);

      if (statsRes.status === 401) { router.push("/admin/login"); return; }

      const [statsData, actData, chartData] = await Promise.all([
        statsRes.json(), actRes.json(), chartRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (actData.success) setActivities(actData.data || []);
      if (chartData.success) {
        setWeeklyData(chartData.data.weeklyData || []);
        setMonthlyData(chartData.data.monthlyData || []);
        setTopServices(chartData.data.topServices || []);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
      setChartsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const statCards = [
    {
      label: "Today's Appointments",
      value: stats?.todayAppointments?.total ?? "—",
      sub: `${stats?.todayAppointments?.breakdown?.PENDING || 0} pending`,
      icon: CalendarIcon,
      color: "from-blue-500 to-blue-600",
      href: "/admin/appointments",
    },
    {
      label: "This Month Revenue",
      value: stats ? `₹${stats.thisMonthRevenue.toLocaleString("en-IN")}` : "—",
      sub: `${stats?.completedThisMonth || 0} completed visits`,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      href: "/admin/appointments",
    },
    {
      label: "Pending Approvals",
      value: stats?.pendingApprovals ?? "—",
      sub: "awaiting confirmation",
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      href: "/admin/appointments?status=PENDING",
    },
    {
      label: "Total Patients",
      value: stats?.totalPatients ?? "—",
      sub: `+${stats?.newPatientsThisMonth || 0} this month`,
      icon: Users,
      color: "from-violet-500 to-purple-600",
      href: "/admin/patients",
    },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Clinic Overview
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Last updated: {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link href="/admin/appointments/new" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" /> New Appointment
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-10 rounded-full -translate-y-4 translate-x-4 group-hover:opacity-20 transition-opacity`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {isLoading ? <span className="animate-pulse bg-slate-200 rounded h-7 w-16 inline-block" /> : card.value}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">{card.sub}</p>
            <ArrowUpRight className="absolute bottom-4 right-4 w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Weekly Appointments Bar Chart */}
        <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Appointments — Last 7 Days
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily booking breakdown</p>
            </div>
          </div>
          {chartsLoading ? (
            <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={weeklyData} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={25} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#f8fafc", fontSize: "11px", padding: "8px 12px" }}
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Bar dataKey="confirmed" name="Confirmed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Confirmed</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />Pending</span>
          </div>
        </div>

        {/* Top Services Pie */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-violet-600" />
            Top Services
          </h3>
          {chartsLoading || topServices.length === 0 ? (
            <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
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
                  <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[110px]">{svc.name}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-800 tabular-nums">{svc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Revenue Trend — Last 6 Months
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Based on completed appointment service fees</p>
          </div>
        </div>
        {chartsLoading ? (
          <div className="h-40 bg-slate-50 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
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
        <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Live Activity Feed
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" /> Live
            </span>
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-3 flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-grow space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 text-xs italic">No recent activity yet.</div>
            ) : activities.map((act) => {
              const cfg = activityIcons[act.type] || activityIcons.booking;
              return (
                <div key={act.id} className="px-6 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <cfg.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">{act.text}</p>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">{timeAgo(act.time)}</span>
                  </div>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${
                    act.status === 'CONFIRMED' || act.status === 'PAID' || act.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' :
                    act.status === 'PENDING' || act.status === 'NEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>{act.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-600" /> Quick Actions
          </h3>
          {[
            { href: "/admin/appointments", label: "View All Appointments", icon: CalendarIcon, color: "text-blue-600 bg-blue-50" },
            { href: "/admin/patients", label: "Patient Records (EMR)", icon: Users, color: "text-violet-600 bg-violet-50" },
            { href: "/admin/contacts", label: "Leads & Inquiries", icon: MessageSquare, color: "text-amber-600 bg-amber-50" },
            { href: "/admin/blog", label: "Manage Blog Posts", icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
            { href: "/admin/reviews", label: "Moderate Reviews", icon: Star, color: "text-rose-600 bg-rose-50" },
            { href: "/admin/reports", label: "Analytics & Reports", icon: BarChart2, color: "text-indigo-600 bg-indigo-50" },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 group transition-all"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${link.color}`}>
                <link.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{link.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
