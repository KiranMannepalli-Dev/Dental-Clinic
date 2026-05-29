"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Filter, Check, X, CheckSquare, AlertTriangle, 
  ChevronLeft, ChevronRight, Phone, Mail, Calendar, Clock
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function AppointmentsAdmin() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Filters & State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch filter dropdown options (doctors & services)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const docRes = await fetch(`${API_URL}/public/doctors`);
        const docData = await docRes.json();
        setDoctors(docData.data || []);

        const srvRes = await fetch(`${API_URL}/public/services`);
        const srvData = await srvRes.json();
        setServices(srvData.data || []);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch appointments list
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status,
        doctorId,
        serviceId
      });

      const res = await fetch(`${API_URL}/admin/appointments?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setAppointments(data.data || []);
      if (data.meta) {
        setTotalPages(data.meta.totalPages || 1);
        setTotalItems(data.meta.total || 0);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, status, doctorId, serviceId]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  // Update Status Action
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoadingId(id);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Appointment status updated to ${newStatus}` });
        // Refresh items
        fetchAppointments();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to update status" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      case 'NO_SHOW': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-md border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          {/* Search box */}
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Patient name, Phone, Booking Ref..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500" 
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          {/* Status select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Status</label>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="py-1.5 px-3 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>

          {/* Specialist select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Doctor (Specialist)</label>
            <select 
              value={doctorId} 
              onChange={(e) => { setDoctorId(e.target.value); setPage(1); }}
              className="py-1.5 px-3 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Specialists</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
              ))}
            </select>
          </div>

          {/* Service select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Service</label>
            <select 
              value={serviceId} 
              onChange={(e) => { setServiceId(e.target.value); setPage(1); }}
              className="py-1.5 px-3 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Services</option>
              {services.map(srv => (
                <option key={srv.id} value={srv.id}>{srv.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Ref & Patient</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Specialist</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No appointments found.</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Patient detail */}
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 text-sm">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500">
                        <span className="font-mono">{appt.bookingRef}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {appt.patient?.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {appt.patient?.email}</span>
                      </div>
                    </td>

                    {/* Date and Time */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-slate-950">
                        <Calendar className="w-3.5 h-3.5 text-slate-450" />
                        <span>{new Date(appt.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appt.startTime} - {appt.endTime}</span>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="p-4">
                      <p className="text-slate-800 text-sm font-medium">Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{appt.doctor?.specialization}</p>
                    </td>

                    {/* Service */}
                    <td className="p-4 text-sm text-slate-700 font-medium">
                      {appt.service?.name}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadgeClass(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {actionLoadingId === appt.id ? (
                          <span className="text-xs text-slate-500 font-medium">Updating...</span>
                        ) : (
                          <>
                            {appt.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'CONFIRMED')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5"/> Confirm
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'CANCELLED')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5"/> Cancel
                                </button>
                              </>
                            )}

                            {appt.status === 'CONFIRMED' && (
                              <>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'COMPLETED')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 cursor-pointer"
                                >
                                  <CheckSquare className="w-3.5 h-3.5"/> Complete
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'NO_SHOW')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200 cursor-pointer"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5"/> No Show
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'CANCELLED')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5"/> Cancel
                                </button>
                              </>
                            )}

                            {(appt.status === 'COMPLETED' || appt.status === 'CANCELLED' || appt.status === 'NO_SHOW') && (
                              <span className="text-xs text-slate-400 font-medium">No actions available</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {page} of {totalPages} ({totalItems} total bookings)
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 rounded bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-white hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4"/>
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 rounded bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-white hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
