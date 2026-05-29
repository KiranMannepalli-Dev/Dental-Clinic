"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Calendar as CalendarIcon, DollarSign, Activity, 
  Search, Filter, MoreVertical, LogOut, CheckCircle, Clock, XCircle 
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
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

        // Fetch appointments
        const apptRes = await fetch(`${API_URL}/admin/appointments?limit=10`, { headers });
        const apptData = await apptRes.json();
        setAppointments(apptData.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    // Auto refresh every 30s as per spec
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/> Confirmed</span>;
      case 'PENDING': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3"/> Pending</span>;
      case 'COMPLETED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3"/> Completed</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3"/> Cancelled</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (isLoading && !stats) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium text-sm">Today's Appointments</h3>
          <p className="text-3xl font-semibold text-slate-900 mt-1">{stats?.todayAppointments?.total || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium text-sm">Pending Approvals</h3>
          <p className="text-3xl font-semibold text-slate-900 mt-1">{stats?.pendingApprovals || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-md bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium text-sm">Monthly Est. Revenue</h3>
          <p className="text-3xl font-semibold text-slate-900 mt-1">₹{(stats?.thisMonthRevenue || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium text-sm">New Contacts</h3>
          <p className="text-3xl font-semibold text-slate-900 mt-1">0</p>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold text-lg text-slate-800">Recent Appointments</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 w-full sm:w-64" />
            </div>
            <button className="p-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Ref & Patient</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Doctor</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No appointments found.</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 text-sm">{appt.patient?.firstName} {appt.patient?.lastName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{appt.bookingRef}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-900 text-sm">{new Date(appt.appointmentDate).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{appt.startTime}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-700">Dr. {appt.doctor?.lastName}</td>
                    <td className="p-4 text-sm text-slate-700">{appt.service?.name}</td>
                    <td className="p-4">{getStatusBadge(appt.status)}</td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
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
