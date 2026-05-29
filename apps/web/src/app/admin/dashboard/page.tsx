"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, Calendar as CalendarIcon, DollarSign, Activity, 
  Clock, CheckCircle, XCircle, ArrowUpRight, Plus, Eye,
  ChevronRight, Sparkles, MessageSquare, BookOpen
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Activity Feed logs (mocked real-time stream)
  const [activities, setActivities] = useState<any[]>([
    { id: 1, type: 'booking', text: 'New booking reference #BS-2024-00192 registered', time: 'Just now' },
    { id: 2, type: 'review', text: 'Patient testimonial submitted for Dr. Prasad', time: '12 mins ago' },
    { id: 3, type: 'lead', text: 'Callback requested from Free Consultation Form', time: '40 mins ago' },
    { id: 4, type: 'doctor', text: 'Availability timings updated for Dr. Mannepalli', time: '2 hours ago' },
  ]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/admin/dashboard/stats`, { headers });
      if (statsRes.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }
      const statsData = await statsRes.json();
      setStats(statsData.data);

      // Fetch recent appointments
      const apptRes = await fetch(`${API_URL}/admin/appointments?limit=5`, { headers });
      const apptData = await apptRes.json();
      setAppointments(apptData.data || []);

      // Fetch specialists to count them
      const docRes = await fetch(`${API_URL}/public/doctors`);
      const docData = await docRes.json();
      setDoctorsCount(docData.data?.length || 0);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3"/> Confirmed</span>;
      case 'PENDING': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-200"><Clock className="w-3 h-3"/> Pending</span>;
      case 'COMPLETED': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-200"><CheckCircle className="w-3 h-3"/> Completed</span>;
      case 'CANCELLED': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-700 border border-red-200"><XCircle className="w-3 h-3"/> Cancelled</span>;
      default: 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  // Bespoke Dynamic SVG Line Chart Calculations (Area Chart)
  const renderRevenueChart = () => {
    const revenueVal = stats?.thisMonthRevenue || 0;
    // Monthly static values for the chart + current live database month revenue
    const points = [15000, 24000, 18500, 36000, 48000, revenueVal];
    const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
    const maxVal = Math.max(...points, 50000);
    
    const svgWidth = 500;
    const svgHeight = 150;
    const padding = 20;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const xCoords = points.map((_, i) => padding + (i * (chartWidth / (points.length - 1))));
    const yCoords = points.map(v => svgHeight - padding - (v / maxVal * chartHeight));

    let dPath = `M ${xCoords[0]} ${yCoords[0]}`;
    for (let i = 1; i < points.length; i++) {
      dPath += ` L ${xCoords[i]} ${yCoords[i]}`;
    }
    const areaPath = `${dPath} L ${xCoords[xCoords.length - 1]} ${svgHeight - padding} L ${xCoords[0]} ${svgHeight - padding} Z`;

    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 mt-4 overflow-visible">
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, idx) => (
          <line 
            key={idx}
            x1={padding} 
            y1={svgHeight - padding - ratio * chartHeight} 
            x2={svgWidth - padding} 
            y2={svgHeight - padding - ratio * chartHeight} 
            stroke="#f1f5f9" 
            strokeWidth="1"
          />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#area-gradient)" />
        {/* Line stroke */}
        <path d={dPath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        {/* Nodes and text labels */}
        {points.map((val, i) => (
          <g key={i} className="group cursor-pointer">
            <circle 
              cx={xCoords[i]} 
              cy={yCoords[i]} 
              r="4" 
              className="fill-blue-600 stroke-white stroke-2 hover:r-6 hover:fill-blue-800 transition-all"
            />
            {/* Tooltip on hover */}
            <text 
              x={xCoords[i]} 
              y={yCoords[i] - 10} 
              textAnchor="middle" 
              className="text-[9px] font-bold fill-slate-800 bg-slate-100 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ₹{val.toLocaleString()}
            </text>
            {/* Month Axis Labels */}
            <text 
              x={xCoords[i]} 
              y={svgHeight - 2} 
              textAnchor="middle" 
              className="text-[9px] fill-slate-400 font-semibold"
            >
              {months[i]}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Bespoke Dynamic SVG Bar Chart Calculations
  const renderAppointmentsChart = () => {
    // Volume distributions over weekdays
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const values = [12, 18, 14, 25, 21, stats?.todayAppointments?.total || 5];
    const maxVal = Math.max(...values, 10);
    
    const svgWidth = 500;
    const svgHeight = 150;
    const padding = 20;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const barWidth = 35;
    const gap = (chartWidth - barWidth * values.length) / (values.length - 1);

    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 mt-4 overflow-visible">
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, idx) => (
          <line 
            key={idx}
            x1={padding} 
            y1={svgHeight - padding - ratio * chartHeight} 
            x2={svgWidth - padding} 
            y2={svgHeight - padding - ratio * chartHeight} 
            stroke="#f1f5f9" 
            strokeWidth="1"
          />
        ))}
        {values.map((val, i) => {
          const x = padding + i * (barWidth + gap);
          const barHeight = (val / maxVal) * chartHeight;
          const y = svgHeight - padding - barHeight;

          return (
            <g key={i} className="group cursor-pointer">
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                rx="4"
                className="fill-blue-550 hover:fill-blue-650 transition-colors"
              />
              <text 
                x={x + barWidth / 2} 
                y={y - 6} 
                textAnchor="middle" 
                className="text-[9px] font-bold fill-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {val}
              </text>
              <text 
                x={x + barWidth / 2} 
                y={svgHeight - 2} 
                textAnchor="middle" 
                className="text-[9px] fill-slate-400 font-semibold"
              >
                {days[i]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Live Sync Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-md p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Background designs */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-xl -ml-16 -mb-16"></div>
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight">Heshvitha Multi-Speciality Clinic Portal</h2>
          </div>
          <p className="text-xs text-blue-100">Live operational overview, specialist scheduling, and leads moderation panel.</p>
        </div>

        {/* Live sync pulse status */}
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10 shrink-0 relative z-10">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-green-300">Live Sync • Operational</span>
        </div>
      </div>

      {/* Stats Grid with modern elevation & colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">Today's Bookings</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.todayAppointments?.total || 0}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">Pending Approvals</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1 text-amber-600">{stats?.pendingApprovals || 0}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-12 h-12 rounded-md bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">Monthly Est. Rev</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(stats?.thisMonthRevenue || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-12 h-12 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">Active Specialists</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{doctorsCount}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card 1 */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900 text-sm">Estimated Revenue Stream</h3>
            <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 font-bold px-2 py-0.5 rounded uppercase">6-Month Trend</span>
          </div>
          {renderRevenueChart()}
        </div>

        {/* Chart Card 2 */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900 text-sm">Appointments Volume Distribution</h3>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded uppercase">Weekly load</span>
          </div>
          {renderAppointmentsChart()}
        </div>
      </div>

      {/* Double Column: Shortcuts Panel & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Command Shortcuts (1 column) */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-50">Quick Commands</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Direct shortcuts to add items or configure parameters across pages.</p>
          </div>
          
          <div className="space-y-2">
            <Link 
              href="/admin/doctors" 
              className="w-full flex items-center justify-between p-3 rounded border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 group transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-700">Add Doctor (Specialist)</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link 
              href="/admin/services" 
              className="w-full flex items-center justify-between p-3 rounded border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 group transition-all"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">Configure Service (Treatment)</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </Link>

            <Link 
              href="/admin/blog" 
              className="w-full flex items-center justify-between p-3 rounded border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 group transition-all"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-slate-700">Create Blog Article</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </Link>

            <Link 
              href="/admin/reviews" 
              className="w-full flex items-center justify-between p-3 rounded border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 group transition-all"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-slate-700">Moderate Testimonials</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Live Logs Feed (2 columns) */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-50">Real-Time Operational Stream</h3>
          
          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs leading-relaxed group">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                <div className="flex-grow flex justify-between items-start gap-4">
                  <span className="text-slate-700 font-medium">{act.text}</span>
                  <span className="text-slate-400 text-[10px] shrink-0 font-mono">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Appointments Table View */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Recent Bookings Overview</h3>
          <Link href="/admin/appointments" className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline cursor-pointer">
            View All <ChevronRight className="w-4.5 h-4.5"/>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Ref & Patient</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Specialist</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No recent bookings recorded.</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 text-sm">{appt.patient?.firstName} {appt.patient?.lastName}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{appt.bookingRef}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-900 text-sm">{new Date(appt.appointmentDate).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{appt.startTime}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-700 font-medium">Dr. {appt.doctor?.lastName}</td>
                    <td className="p-4 text-sm text-slate-700">{appt.service?.name}</td>
                    <td className="p-4">{getStatusBadge(appt.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
