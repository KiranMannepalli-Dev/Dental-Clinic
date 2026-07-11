"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart2, TrendingUp, Users, IndianRupee, Calendar,
  Stethoscope, Star, ArrowUpRight, RefreshCw, Download,
  UserCheck, Activity, Trophy, Percent
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line
} from "recharts";

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export default function ReportsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [doctorStats, setDoctorStats] = useState<any[]>([]);
  const [patientGrowth, setPatientGrowth] = useState<any[]>([]);
  const [revenueByDoctor, setRevenueByDoctor] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) { router.push("/admin/login"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    setIsLoading(true);
    try {
      const [statsRes, chartRes, doctorRes, growthRes, revenueDocRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard/stats`, { headers }),
        fetch(`${API_URL}/admin/dashboard/charts`, { headers }),
        fetch(`${API_URL}/admin/dashboard/doctor-stats`, { headers }),
        fetch(`${API_URL}/admin/dashboard/patient-growth`, { headers }),
        fetch(`${API_URL}/admin/dashboard/revenue-by-doctor`, { headers }),
      ]);
      if (statsRes.status === 401) { router.push("/admin/login"); return; }
      
      const [statsData, chartData, docData, growthData, revDocData] = await Promise.all([
        statsRes.json(), chartRes.json(),
        doctorRes.ok ? doctorRes.json() : { success: false },
        growthRes.ok ? growthRes.json() : { success: false },
        revenueDocRes.ok ? revenueDocRes.json() : { success: false },
      ]);

      if (statsData.success) setStats(statsData.data);
      if (chartData.success) {
        setWeeklyData(chartData.data.weeklyData || []);
        setMonthlyData(chartData.data.monthlyData || []);
        setTopServices(chartData.data.topServices || []);
      }
      if (docData.success) setDoctorStats(docData.data || []);
      if (growthData.success) setPatientGrowth(growthData.data || []);
      if (revDocData.success) setRevenueByDoctor(revDocData.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // CSV Export helper
  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    a.click(); URL.revokeObjectURL(url);
  };

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
          <p className="text-xs text-slate-400 mt-0.5">
            Business intelligence overview for Heshvitha Dental
            {lastUpdated && <span className="ml-2 opacity-60">· Updated {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(doctorStats, "doctor_performance.csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Doctors CSV
          </button>
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
            className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
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

      {/* Revenue Trend + Patient Growth */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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

        {/* Patient Growth */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" /> Patient Growth (6 Months)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">New patient registrations per month</p>
          </div>
          {isLoading ? <div className="h-48 bg-slate-50 rounded-xl animate-pulse" /> : patientGrowth.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-20">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={patientGrowth}>
                <defs>
                  <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={22} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#f8fafc", fontSize: "11px" }}
                  formatter={(val: any) => [val, "New Patients"]}
                />
                <Line type="monotone" dataKey="patients" stroke="#8b5cf6" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
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

        {/* Top Services */}
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

      {/* Revenue by Doctor (Bar chart) */}
      {revenueByDoctor.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <IndianRupee className="w-4 h-4 text-emerald-600" /> Revenue by Doctor (This Month)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueByDoctor} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "none", borderRadius: "10px", color: "#f8fafc", fontSize: "11px" }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Doctor Performance Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" /> Doctor Performance — This Month
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Appointments, completion rates, and ratings</p>
          </div>
          <button
            onClick={() => exportCSV(doctorStats, "doctor_stats.csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Doctor</th>
                <th className="p-4">Specialization</th>
                <th className="p-4 text-center">Appts. This Month</th>
                <th className="p-4 text-center">Completed</th>
                <th className="p-4 text-center">Completion Rate</th>
                <th className="p-4 text-center">Rating</th>
                <th className="p-4 text-right">Consult Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400 text-xs italic animate-pulse">Loading doctor stats...</td></tr>
              ) : doctorStats.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400 text-xs italic">No doctor data available</td></tr>
              ) : (
                doctorStats.map((doc: any, i: number) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                          style={{ background: COLORS[i % COLORS.length] }}>
                          {doc.name.split(" ")[1]?.[0]}{doc.name.split(" ")[2]?.[0]}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-slate-900 tabular-nums">{doc.appointmentsThisMonth}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-emerald-700 tabular-nums">{doc.completedThisMonth}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                            style={{ width: `${doc.completionRate}%` }} />
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${doc.completionRate >= 80 ? "text-emerald-600" : doc.completionRate >= 60 ? "text-amber-600" : "text-red-600"}`}>
                          {doc.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-sm font-bold text-amber-600">
                        ★ {Number(doc.rating || 0).toFixed(1)}
                        <span className="text-[10px] text-slate-400 font-normal">({doc.reviewCount})</span>
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-800 tabular-nums">
                      ₹{Number(doc.consultationFee).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
