"use client";
import { API_URL, safeJsonFetch } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Filter, Check, X, CheckSquare, AlertTriangle, 
  ChevronLeft, ChevronRight, Phone, Mail, Calendar, Clock,
  CalendarClock, CreditCard, Receipt, Printer, Download
} from "lucide-react";


const formatTime12Hour = (time24: string) => {
  if (!time24) return "";
  if (time24.includes("AM") || time24.includes("PM")) return time24;
  const [hoursStr, minutesStr] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, "0")}:${minutesStr} ${ampm}`;
};

export default function AppointmentsAdmin() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Filters & State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Reschedule Modal State
  const [rescheduleAppointment, setRescheduleAppointment] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleDoctorId, setRescheduleDoctorId] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleStatus, setRescheduleStatus] = useState("CONFIRMED");
  const [customTime, setCustomTime] = useState("");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Billing & Invoice State
  const [paymentAppointment, setPaymentAppointment] = useState<any | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [invoiceAppointment, setInvoiceAppointment] = useState<any | null>(null);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAppointment) return;

    setIsRecordingPayment(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const data = await safeJsonFetch(`${API_URL}/admin/appointments/${paymentAppointment.id}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentStatus,
          paymentMethod
        })
      });

      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Payment status recorded successfully!" });
        setPaymentAppointment(null);
        fetchAppointments();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to record payment" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const data = await safeJsonFetch(`${API_URL}/admin/appointments/bulk-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Successfully updated ${selectedIds.length} appointments status to ${newStatus}.` });
        setSelectedIds([]);
        fetchAppointments();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to update bulk status" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  const fetchAvailableSlots = async (docId: string, date: string) => {
    if (!docId || !date) return;
    setSlotsLoading(true);
    try {
      const data = await safeJsonFetch(`${API_URL}/public/appointments/slots?doctorId=${docId}&date=${date}`);
      if (data.success) {
        setAvailableSlots(data.data || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (rescheduleAppointment && rescheduleDoctorId && rescheduleDate) {
      fetchAvailableSlots(rescheduleDoctorId, rescheduleDate);
      setRescheduleSlot("");
    }
  }, [rescheduleDoctorId, rescheduleDate, rescheduleAppointment]);

  const openRescheduleModal = (appt: any) => {
    setRescheduleAppointment(appt);
    setRescheduleDoctorId(appt.doctorId);
    const dateObj = new Date(appt.appointmentDate);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    setRescheduleDate(`${yyyy}-${mm}-${dd}`);
    setRescheduleSlot(appt.startTime);
    setRescheduleStatus(appt.status === 'PENDING' ? 'PENDING' : 'CONFIRMED');
    setUseCustomTime(false);
    setCustomTime("");
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAppointment) return;
    
    const startTimeVal = useCustomTime ? customTime : rescheduleSlot;
    if (!startTimeVal) {
      setFeedbackMsg({ type: 'error', text: "Please select a time slot or specify a custom time." });
      return;
    }

    setIsRescheduling(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const data = await safeJsonFetch(`${API_URL}/admin/appointments/${rescheduleAppointment.id}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: rescheduleDoctorId,
          appointmentDate: rescheduleDate,
          startTime: startTimeVal,
          status: rescheduleStatus
        })
      });

      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Appointment rescheduled successfully!" });
        setRescheduleAppointment(null);
        fetchAppointments();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to reschedule appointment" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    } finally {
      setIsRescheduling(false);
    }
  };

  // Fetch filter dropdown options (doctors & services)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const docData = await safeJsonFetch(`${API_URL}/public/doctors`);
        setDoctors(docData.data || []);

        const srvData = await safeJsonFetch(`${API_URL}/public/services`);
        setServices(srvData.data || []);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch appointments list
  const fetchAppointments = async () => {
    if (appointments.length === 0) setIsLoading(true);
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
        serviceId,
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
      });

      const data = await safeJsonFetch(`${API_URL}/admin/appointments?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (data.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      if (data.error?.code === 'RATE_LIMIT_EXCEEDED') {
        setFeedbackMsg({ type: 'error', text: "Too many requests — please wait a moment before refreshing." });
        return;
      }

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
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, [page, status, doctorId, serviceId, dateFrom, dateTo]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!appointments.length) return;
    const rows = appointments.map((a: any) => ({
      "Booking Ref": a.bookingRef,
      "Patient Name": `${a.patient?.firstName} ${a.patient?.lastName}`,
      "Patient Phone": a.patient?.phone || "",
      "Patient Email": a.patient?.email || "",
      "Doctor": `Dr. ${a.doctor?.firstName} ${a.doctor?.lastName}`,
      "Service": a.service?.name || "",
      "Date": new Date(a.appointmentDate).toLocaleDateString(),
      "Start Time": a.startTime,
      "End Time": a.endTime,
      "Status": a.status,
      "Payment Status": a.paymentStatus || "UNPAID",
      "Payment Method": a.paymentMethod || "",
    }));
    const headers = Object.keys(rows[0]);
    const csvRows = rows.map(r => headers.map(h => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `appointments_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Update Status Action
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoadingId(id);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const data = await safeJsonFetch(`${API_URL}/admin/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

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
  };  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 dark:bg-emerald-955/20 text-green-700 dark:text-green-400 border-green-200 dark:border-emerald-900/30';
      case 'PENDING': return 'bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';
      case 'COMPLETED': return 'bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30';
      case 'CANCELLED': return 'bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30';
      case 'NO_SHOW': return 'bg-purple-50 dark:bg-purple-955/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30';
      case 'RESCHEDULED': return 'bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30';
      default: return 'bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800/30';
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-md border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' 
            ? 'bg-green-50/80 dark:bg-emerald-955/20 backdrop-blur-sm text-green-800 dark:text-green-400 border-green-200 dark:border-emerald-900/30' 
            : 'bg-red-50/80 dark:bg-red-955/20 backdrop-blur-sm text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
        }`}>
          <span className="font-semibold">{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-semibold underline cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 text-slate-650 dark:text-slate-400">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4 hover:shadow-md transition-all duration-300">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search By Patient Name, Phone, Booking Ref..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" 
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white text-sm font-semibold rounded-md transition-all duration-200 shadow-sm cursor-pointer hover:-translate-y-0.5">
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="py-2 px-3 border border-slate-205 dark:border-slate-805 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-white dark:bg-slate-950 cursor-pointer">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
              <option value="RESCHEDULED">Rescheduled</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specialist</label>
            <select value={doctorId} onChange={(e) => { setDoctorId(e.target.value); setPage(1); }}
              className="py-2 px-3 border border-slate-205 dark:border-slate-805 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-white dark:bg-slate-950 cursor-pointer">
              <option value="">All Specialists</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service</label>
            <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setPage(1); }}
              className="py-2 px-3 border border-slate-205 dark:border-slate-805 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-white dark:bg-slate-950 cursor-pointer">
              <option value="">All Services</option>
              {services.map(srv => (
                <option key={srv.id} value={srv.id}>{srv.name}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="py-2 px-3 border border-slate-205 dark:border-slate-805 rounded-md text-sm text-slate-755 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-white dark:bg-slate-955 cursor-pointer" />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Date</label>
            <div className="flex gap-1">
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="flex-1 py-2 px-3 border border-slate-205 dark:border-slate-805 rounded-md text-sm text-slate-755 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-white dark:bg-slate-955 cursor-pointer" />
              {(dateFrom || dateTo) && (
                <button type="button" onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
                  className="px-2 py-1 bg-red-50 dark:bg-red-955/20 text-red-655 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer text-xs font-semibold" title="Clear Dates">
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Toolbar — Export + Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV ({appointments.length} rows)
        </button>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50 dark:bg-blue-955/10 border border-blue-200/80 dark:border-blue-900/30 rounded-xl animate-in slide-in-from-top-2 duration-200 shadow-sm flex-1">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse" />
              {selectedIds.length} Appointments Selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md cursor-pointer transition-all shadow-sm hover:shadow active:scale-95"
              >
                Bulk Confirm
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('COMPLETED')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md cursor-pointer transition-all shadow-sm hover:shadow active:scale-95"
              >
                Bulk Complete
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('CANCELLED')}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md cursor-pointer transition-all shadow-sm hover:shadow active:scale-95"
              >
                Bulk Cancel
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md cursor-pointer transition-all active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table View */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={appointments.length > 0 && selectedIds.length === appointments.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(appointments.map(a => a.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded-md border-slate-305 dark:border-slate-705 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:bg-slate-950 cursor-pointer"
                  />
                </th>
                <th className="p-4">Ref & Patient</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Specialist & Service</th>
                <th className="p-4">Status</th>
                <th className="p-4">Billing</th>
                <th className="p-4">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 dark:divide-slate-805/70 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-455 dark:text-slate-500 text-xs italic">Loading Appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-455 dark:text-slate-500 text-xs italic">No Appointments Found.</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    {/* Checkbox */}
                    <td className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(appt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, appt.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== appt.id));
                          }
                        }}
                        className="rounded-md border-slate-305 dark:border-slate-705 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:bg-slate-950 cursor-pointer"
                      />
                    </td>
                    {/* Patient detail */}
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{appt.bookingRef}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400 dark:text-slate-500"/> {appt.patient?.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400 dark:text-slate-500"/> {appt.patient?.email}</span>
                      </div>
                    </td>

                    {/* Date and Time */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-955 dark:text-slate-100 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500" />
                        <span>{new Date(appt.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{appt.startTime} - {appt.endTime}</span>
                      </div>
                    </td>

                    {/* Doctor & Service */}
                    <td className="p-4">
                      <p className="text-slate-855 dark:text-slate-200 text-sm font-semibold">Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</p>
                      <p className="text-xs text-blue-650 dark:text-blue-400 mt-0.5 font-semibold">{appt.service?.name}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold border ${getStatusBadgeClass(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>

                    {/* Billing */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1 w-fit">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          appt.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30'
                            : 'bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-emerald-900/30'
                        }`}>
                          {appt.paymentStatus || 'UNPAID'}
                        </span>
                        {appt.paymentStatus === 'PAID' && appt.paymentMethod && (
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{appt.paymentMethod}</span>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {actionLoadingId === appt.id ? (
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold animate-pulse">Updating...</span>
                        ) : (
                          <>
                            {appt.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'CONFIRMED')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold hover:shadow hover:shadow-green-500/15 transition-all cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5"/> Confirm
                                </button>
                                <button 
                                  onClick={() => openRescheduleModal(appt)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                                >
                                  <CalendarClock className="w-3.5 h-3.5"/> Reschedule
                                </button>
                                {appt.paymentStatus !== 'PAID' && (
                                  <button 
                                    onClick={() => {
                                      setPaymentAppointment(appt);
                                      setPaymentStatus("PAID");
                                      setPaymentMethod("CASH");
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold hover:shadow hover:shadow-emerald-500/15 transition-all cursor-pointer"
                                  >
                                    <CreditCard className="w-3.5 h-3.5"/> Collect Pay
                                  </button>
                                )}
                                <button 
                                  onClick={() => setInvoiceAppointment(appt)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                                >
                                  <Receipt className="w-3.5 h-3.5"/> Bill
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'CANCELLED')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-955/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-900/30 transition-all cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5"/> Cancel
                                </button>
                              </>
                            )}

                            {(appt.status === 'CONFIRMED' || appt.status === 'RESCHEDULED') && (
                              <>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'COMPLETED')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold hover:shadow hover:shadow-blue-500/15 transition-all cursor-pointer"
                                >
                                  <CheckSquare className="w-3.5 h-3.5"/> Complete
                                </button>
                                <button 
                                  onClick={() => openRescheduleModal(appt)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                                >
                                  <CalendarClock className="w-3.5 h-3.5"/> Reschedule
                                </button>
                                {appt.paymentStatus !== 'PAID' && (
                                  <button 
                                    onClick={() => {
                                      setPaymentAppointment(appt);
                                      setPaymentStatus("PAID");
                                      setPaymentMethod("CASH");
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold hover:shadow hover:shadow-emerald-500/15 transition-all cursor-pointer"
                                  >
                                    <CreditCard className="w-3.5 h-3.5"/> Collect Pay
                                  </button>
                                )}
                                <button 
                                  onClick={() => setInvoiceAppointment(appt)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                                >
                                  <Receipt className="w-3.5 h-3.5"/> Bill
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'NO_SHOW')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-955/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold border border-purple-200 dark:border-purple-900/30 transition-all cursor-pointer"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5"/> No Show
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(appt.id, 'CANCELLED')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-55/10 dark:bg-red-955/10 hover:bg-red-55/20 dark:hover:bg-red-955/20 text-red-750 dark:text-red-405 border border-red-250 dark:border-red-900/30 transition-all cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5"/> Cancel
                                </button>
                              </>
                            )}

                            {(appt.status === 'COMPLETED' || appt.status === 'CANCELLED' || appt.status === 'NO_SHOW') && (
                              <div className="flex gap-2 items-center">
                                {appt.status === 'COMPLETED' && appt.paymentStatus !== 'PAID' && (
                                  <button 
                                    onClick={() => {
                                      setPaymentAppointment(appt);
                                      setPaymentStatus("PAID");
                                      setPaymentMethod("CASH");
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold hover:shadow hover:shadow-emerald-500/15 transition-all cursor-pointer"
                                  >
                                    <CreditCard className="w-3.5 h-3.5"/> Collect Pay
                                  </button>
                                )}
                                <button 
                                  onClick={() => setInvoiceAppointment(appt)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                                >
                                  <Receipt className="w-3.5 h-3.5"/> Bill
                                </button>
                                {(appt.status !== 'COMPLETED' || appt.paymentStatus === 'PAID') && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold italic">No Actions Available</span>
                                )}
                              </div>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-505 dark:text-slate-400 font-semibold">
              Showing Page {page} Of {totalPages} ({totalItems} Total Bookings)
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4"/>
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-805 rounded-md bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Reschedule Appointment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Ref: <span className="font-mono text-slate-700 dark:text-slate-300">{rescheduleAppointment.bookingRef}</span> • Patient: <span className="text-slate-850 dark:text-slate-250 font-semibold">{rescheduleAppointment.patient?.firstName} {rescheduleAppointment.patient?.lastName}</span>
                </p>
              </div>
              <button 
                onClick={() => setRescheduleAppointment(null)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4">
              {/* Doctor Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specialist (Doctor)</label>
                <select
                  value={rescheduleDoctorId}
                  onChange={(e) => setRescheduleDoctorId(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-205 dark:border-slate-750 rounded-md text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650/30 bg-white dark:bg-slate-955 text-slate-900 dark:text-slate-100 cursor-pointer"
                  required
                >
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName} ({doc.specialization})</option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Appointment Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-205 dark:border-slate-750 rounded-md text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650/30 bg-white dark:bg-slate-955 text-slate-900 dark:text-slate-100 cursor-pointer"
                  required
                />
              </div>

              {/* Slots Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time Slot</label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomTime(!useCustomTime);
                      setRescheduleSlot("");
                      setCustomTime("");
                    }}
                    className="text-xs text-blue-600 dark:text-blue-450 hover:underline font-semibold cursor-pointer"
                  >
                    {useCustomTime ? "Select From Available Slots" : "Set Custom Time Instead"}
                  </button>
                </div>

                {useCustomTime ? (
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM or 14:00"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full py-2.5 px-3 border border-slate-205 dark:border-slate-750 rounded-md text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650/30 bg-white dark:bg-slate-955 text-slate-900 dark:text-slate-100"
                    required
                  />
                ) : (
                  <div>
                    {slotsLoading ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 animate-pulse">Checking Doctor Availability...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-amber-605 dark:text-amber-400 font-semibold py-2 bg-amber-50 dark:bg-amber-955/20 rounded-md px-3 border border-amber-100 dark:border-amber-900/30">
                        No Available Slots Found For This Date. Try Another Date Or Enter A Custom Time.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-800 rounded-md bg-slate-50/50 dark:bg-slate-955/20">
                        {availableSlots.map(slotInfo => {
                          const time = slotInfo.time;
                          const status = slotInfo.status;
                          const count = slotInfo.bookingCount;
                          const isSelected = rescheduleSlot === time;

                          let btnClass = "";
                          let statusText = "";

                          if (isSelected) {
                            btnClass = "bg-blue-600 border-blue-600 dark:border-blue-500 text-white shadow-sm";
                          } else {
                            if (status === 'FULLY_BOOKED') {
                              btnClass = "bg-amber-55 dark:bg-amber-955/10 text-amber-705 dark:text-amber-400 border-amber-205 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-950/30";
                              statusText = "Full";
                            } else if (status === 'PAST') {
                              btnClass = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 opacity-60";
                              statusText = "Past";
                            } else if (status === 'BLOCKED') {
                              btnClass = "bg-red-50 dark:bg-red-955/10 text-red-655 dark:text-red-400 border-red-205 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-955/30";
                              statusText = "Blocked";
                            } else {
                              btnClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-755 dark:text-slate-350 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800";
                              if (count > 0) {
                                statusText = `${count}/3`;
                              }
                            }
                          }

                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setRescheduleSlot(time)}
                              className={`py-1.5 px-1 rounded-md text-[10px] font-semibold transition-all border text-center cursor-pointer flex flex-col items-center justify-center min-h-[44px] ${btnClass}`}
                            >
                              <span>{formatTime12Hour(time)}</span>
                              {statusText && (
                                <span className={`text-[7px] uppercase tracking-wider font-semibold mt-0.5 ${
                                  isSelected ? "text-blue-200" :
                                  status === 'FULLY_BOOKED' ? "text-amber-750 dark:text-amber-400" :
                                  status === 'BLOCKED' ? "text-red-500" : "text-slate-400 dark:text-slate-500"
                                }`}>
                                  {statusText}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Status</label>
                <select
                  value={rescheduleStatus}
                  onChange={(e) => setRescheduleStatus(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-205 dark:border-slate-750 rounded-md text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650/30 bg-white dark:bg-slate-955 text-slate-900 dark:text-slate-100 cursor-pointer"
                  required
                >
                  <option value="PENDING">Pending Approval</option>
                  <option value="CONFIRMED">Confirmed / Scheduled</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleAppointment(null)}
                  className="flex-1 py-2.5 border border-slate-205 dark:border-slate-850 text-slate-750 dark:text-slate-350 font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling || (!useCustomTime && !rescheduleSlot)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 transition-colors text-sm cursor-pointer shadow-sm hover:shadow hover:shadow-blue-500/10"
                >
                  {isRescheduling ? "Saving..." : "Reschedule Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {paymentAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Collect Payment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Ref: <span className="font-mono text-slate-700 dark:text-slate-300">{paymentAppointment.bookingRef}</span>
                </p>
              </div>
              <button
                onClick={() => setPaymentAppointment(null)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-355 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-800 rounded-md space-y-2">
                <div className="flex justify-between text-xs text-slate-505 dark:text-slate-400">
                  <span>Patient</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentAppointment.patient?.firstName} {paymentAppointment.patient?.lastName}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-505 dark:text-slate-400">
                  <span>Treatment/Service</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">{paymentAppointment.service?.name}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-800 dark:text-slate-200 font-semibold border-t border-slate-200/80 dark:border-slate-800 pt-2">
                  <span>Amount Due</span>
                  <span className="text-emerald-705 dark:text-emerald-400 font-mono">₹{parseFloat(paymentAppointment.doctor?.consultationFee || "500").toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-205 dark:border-slate-750 rounded-md text-sm focus:outline-none focus:border-blue-655 focus:ring-1 focus:ring-blue-655/30 bg-white dark:bg-slate-955 text-slate-900 dark:text-slate-100 cursor-pointer"
                  required
                >
                  <option value="PAID">Paid (Complete)</option>
                  <option value="PENDING">Pending (Unpaid)</option>
                </select>
              </div>

              {/* Payment Method */}
              {paymentStatus === "PAID" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full py-2.5 px-3 border border-slate-205 dark:border-slate-750 rounded-md text-sm focus:outline-none focus:border-blue-655 focus:ring-1 focus:ring-blue-655/30 bg-white dark:bg-slate-955 text-slate-900 dark:text-slate-100 cursor-pointer"
                    required
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="INSURANCE">Insurance Claim</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentAppointment(null)}
                  className="flex-1 py-2.5 border border-slate-205 dark:border-slate-850 text-slate-755 dark:text-slate-350 font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md disabled:opacity-50 transition-colors text-sm cursor-pointer shadow-sm hover:shadow"
                >
                  {isRecordingPayment ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 text-slate-850 dark:text-slate-200">
            
            {/* Modal Actions (Hidden on print) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between print:hidden">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice Receipt Preview</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button 
                  onClick={() => setInvoiceAppointment(null)}
                  className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invoice Print Document Content */}
            <div className="p-8 md:p-12 print-invoice-container bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
              
              {/* Header block */}
              <div className="flex justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Heshvitha Multi Speciality Dental Hospital</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Advanced Dental Care & Speciality Treatments</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Main Road, Hyderabad • +91 83746 21025</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-semibold text-slate-350 dark:text-slate-700 tracking-wider uppercase">Invoice</h2>
                  <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">Ref: {invoiceAppointment.bookingRef}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Date: {new Date(invoiceAppointment.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Bill To & Details */}
              <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-2">Patient Details</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{invoiceAppointment.patient?.firstName} {invoiceAppointment.patient?.lastName}</p>
                  <p className="text-slate-505 dark:text-slate-400 mt-1">Phone: {invoiceAppointment.patient?.phone}</p>
                  <p className="text-slate-550 dark:text-slate-400">Email: {invoiceAppointment.patient?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-2">Billing Information</p>
                  <p className="mt-1 font-semibold text-slate-750 dark:text-slate-300">Payment Status: 
                    <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase ${
                      invoiceAppointment.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-705 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                        : 'bg-amber-50 dark:bg-amber-955/20 text-amber-705 dark:text-amber-400 border-amber-200 dark:border-emerald-900/30'
                    }`}>
                      {invoiceAppointment.paymentStatus || 'UNPAID'}
                    </span>
                  </p>
                  {invoiceAppointment.paymentStatus === 'PAID' && (
                    <p className="text-slate-505 dark:text-slate-400 mt-1.5">Method: <span className="font-semibold">{invoiceAppointment.paymentMethod}</span></p>
                  )}
                  <p className="text-slate-505 dark:text-slate-400 mt-1">Doctor: Dr. {invoiceAppointment.doctor?.firstName} {invoiceAppointment.doctor?.lastName}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse my-6 text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Treatment / Service</th>
                    <th className="py-2.5 text-right w-32">Rate</th>
                    <th className="py-2.5 text-right w-32">Qty</th>
                    <th className="py-2.5 text-right w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{invoiceAppointment.service?.name}</p>
                      <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5">Specialist Consultation & Dental Treatment Session</p>
                    </td>
                    <td className="py-3 text-right tabular-nums">₹{parseFloat(invoiceAppointment.doctor?.consultationFee || "500").toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right">1</td>
                    <td className="py-3 text-right tabular-nums">₹{parseFloat(invoiceAppointment.doctor?.consultationFee || "500").toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-550 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">₹{parseFloat(invoiceAppointment.doctor?.consultationFee || "500").toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-550 dark:text-slate-400">
                    <span>Tax (GST 0%)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-900 dark:text-slate-100 font-semibold border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span>Grand Total</span>
                    <span className="text-blue-750 dark:text-blue-400 tabular-nums">₹{parseFloat(invoiceAppointment.doctor?.consultationFee || "500").toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Note / Signatures */}
              <div className="grid grid-cols-2 gap-10 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-slate-455 dark:text-slate-500 text-[10px] leading-relaxed">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Thank You For Your Trust!</p>
                  <p>For any queries or emergency follow-ups, please call the emergency hotline at +91 83746 21025.</p>
                </div>
                <div className="text-right flex flex-col justify-end items-end h-full">
                  <div className="w-32 border-b border-slate-350 dark:border-slate-700"></div>
                  <p className="text-[10px] text-slate-455 dark:text-slate-500 uppercase font-semibold tracking-wider mt-1.5">Authorized Signature</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Print Page Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-invoice-container, .print-invoice-container * {
            visibility: visible !important;
          }
          .print-invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2cm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

