"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart2, TrendingUp, Users, IndianRupee, Calendar,
  Stethoscope, Star, ArrowUpRight, RefreshCw, Download
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function ReportsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) { router.push("/admin/login"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    setIsLoading(true);
    try {
      const [statsRes, chartRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard/stats`, { headers }),
        fetch(`${API_URL}/admin/dashboard/charts`, { headers }),
      ]);
      if (statsRes.status === 401) { router.push("/admin/login"); return; }
      const [statsData, chartData] = await Promise.all([statsRes.json(), chartRes.json()]);
      if (statsData.success) setStats(statsData.data);
      if (chartData.success) {
        setWeeklyData(chartData.data.weeklyData || []);
        setMonthlyData(chartData.data.monthlyData || []);
        setTopServices(chartData.data.topServices || []);
      }
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpiCards = [
    { label: "Today's Appointments", value: stats?.todayAppointments?.total ?? "—", icon: Calendar, color: "from-blue-500 to-blue-600", sub: `${stats?.todayAppointments?.breakdown?.PENDING || 0} pending` },
    { label: "This Month Revenue", value: stats ? `₹${stats.thisMonthRevenue.toLocaleString("en-IN")}` : "—", icon: IndianRupee, color: "from-emerald-500 to-teal-600", sub: `${stats?.completedThisMonth || 0} completed visits` },
    { label: "Total Patients", value: stats?.totalPatients ?? "—", icon: Users, color: "from-violet-500 to-purple-600", sub: `+${stats?.newPatientsThisMonth || 0} this month` },
    { label: "Pending Approvals", value: stats?.pendingApprovals ?? "—", icon: Calendar, color: "from-amber-500 to-orange-500", sub: "Awaiting confirmation" },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-600" /> Analytics & Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Business intelligence overview for Heshvitha Dental</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Print Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label}
            className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-10 rounded-full -translate-y-4 translate-x-4`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {isLoading ? <span className="animate-pulse bg-slate-200 rounded h-7 w-16 inline-block" /> : card.value}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Monthly Revenue Trend
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Based on service fees of completed appointments</p>
        </div>
        {isLoading ? <div className="h-48 bg-slate-50 rounded-xl animate-pulse" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={55}
                tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#f8fafc", fontSize: "11px" }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)"
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly + Services Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Weekly Appointments */}
        <div className="xl:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Weekly Appointment Volume
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Last 7 days — confirmed vs pending</p>
          </div>
          {isLoading ? <div className="h-44 bg-slate-50 rounded-xl animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={22} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#f8fafc", fontSize: "11px" }} cursor={{ fill: "#f1f5f9" }} />
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

        {/* Top Services Table */}
        <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Stethoscope className="w-4 h-4 text-violet-600" /> Top Services
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : topServices.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((svc: any, i: number) => {
                const maxCount = topServices[0]?.count || 1;
                const pct = Math.round((svc.count / maxCount) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {svc.name}
                      </span>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">{svc.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      {stats?.todayAppointments?.breakdown && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-blue-600" /> Today's Appointment Status Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {["PENDING","CONFIRMED","COMPLETED","CANCELLED","NO_SHOW","RESCHEDULED"].map((status) => {
              const count = stats.todayAppointments.breakdown[status] || 0;
              const colors: Record<string, string> = {
                PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
                COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                CANCELLED: "bg-red-50 text-red-700 border-red-200",
                NO_SHOW: "bg-slate-50 text-slate-600 border-slate-200",
                RESCHEDULED: "bg-violet-50 text-violet-700 border-violet-200",
              };
              return (
                <div key={status} className={`p-3 rounded-xl border text-center ${colors[status]}`}>
                  <p className="text-2xl font-bold tabular-nums">{count}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{status.replace("_", " ")}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
