"use client";

import { useEffect, useState, useCallback } from "react";
import { API_URL, safeJsonFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, User, Plus, Trash2, ShieldAlert, Check, X, Info, 
  Settings, Lock, Unlock, Phone, Sparkles, RefreshCw, AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/ToastNotification";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  availability: any[];
}

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
}

interface Appointment {
  id: string;
  bookingRef: string;
  startTime: string;
  status: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  service: {
    name: string;
  };
  notes?: string;
  chiefComplaint?: string;
}

const formatTime12Hour = (time24: string) => {
  if (!time24) return "";
  if (time24.includes("AM") || time24.includes("PM")) return time24;
  const [hoursStr, minutesStr] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, "0")}:${minutesStr} ${ampm}`;
};

export default function ScheduleManager() {
  const router = useRouter();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<'slots' | 'availability' | 'holidays'>('slots');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data lists
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Selected state
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  // Custom slot duration/range override form
  const [slotLoading, setSlotLoading] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  
  // Holiday form
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayType, setNewHolidayType] = useState("holiday");
  const [holidaySubmitLoading, setHolidaySubmitLoading] = useState(false);
  
  // Availability forms state
  const [availList, setAvailList] = useState<any[]>([]);
  const [availSaving, setAvailSaving] = useState(false);

  // Load initial doctors & holidays
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      const [docRes, holRes] = await Promise.all([
        safeJsonFetch(`${API_URL}/admin/doctors`, { headers }),
        safeJsonFetch(`${API_URL}/admin/settings/holidays`, { headers })
      ]);
      
      if (docRes.status === 401 || holRes.status === 401) {
        router.push("/admin/login");
        return;
      }
      
      if (docRes.success && docRes.data) {
        setDoctors(docRes.data);
        if (docRes.data.length > 0) {
          setSelectedDoctorId(docRes.data[0].id);
          setAvailList(docRes.data[0].availability || []);
        }
      }
      
      if (holRes.success && holRes.data) {
        setHolidays(holRes.data);
      }
    } catch (err) {
      toast.error("Error loading schedule data");
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Sync selected doctor's availability structure when doctor changes
  useEffect(() => {
    if (selectedDoctorId) {
      const doc = doctors.find(d => d.id === selectedDoctorId);
      if (doc) {
        setAvailList(doc.availability || []);
      }
    }
  }, [selectedDoctorId, doctors]);

  // Load daily slots & appointments for selected doctor + date
  const loadDailySlots = useCallback(async () => {
    if (!selectedDoctorId || !selectedDate) return;
    setSlotLoading(true);
    
    // Check if selectedDate is a holiday closure
    const dateNorm = new Date(selectedDate).toDateString();
    const activeHoliday = holidays.find(h => new Date(h.date).toDateString() === dateNorm);
    if (activeHoliday) {
      setIsHoliday(true);
      setHolidayName(activeHoliday.name);
      setAppointments([]);
      setSlotLoading(false);
      return;
    } else {
      setIsHoliday(false);
      setHolidayName("");
    }
    
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch appointments for this doctor on this day
      const res = await safeJsonFetch(
        `${API_URL}/admin/appointments?doctorId=${selectedDoctorId}&dateFrom=${selectedDate}&dateTo=${selectedDate}&limit=100`,
        { headers }
      );
      
      if (res.success && res.data) {
        setAppointments(res.data);
      } else {
        setAppointments([]);
      }
    } catch {
      toast.error("Failed to load appointments for date");
    } finally {
      setSlotLoading(false);
    }
  }, [selectedDoctorId, selectedDate, holidays, toast]);

  useEffect(() => {
    loadDailySlots();
  }, [loadDailySlots]);

  // Helper to resolve weekday label
  const getWeekday = (dateStr: string) => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date(dateStr).getDay()];
  };

  // Generate slots for the selected day of the week
  const generateSlots = () => {
    if (!selectedDoctorId || !selectedDate) return [];
    
    const doc = doctors.find(d => d.id === selectedDoctorId);
    if (!doc) return [];
    
    const day = getWeekday(selectedDate);
    const dayAvail = doc.availability.find(a => a.dayOfWeek === day);
    
    if (!dayAvail || !dayAvail.isAvailable) return [];
    
    const slots = [];
    let [currH, currM] = dayAvail.startTime.split(':').map(Number);
    const [endH, endM] = dayAvail.endTime.split(':').map(Number);
    const duration = dayAvail.slotMinutes || 30;
    
    while (currH < endH || (currH === endH && currM < endM)) {
      const timeStr = `${currH.toString().padStart(2, '0')}:${currM.toString().padStart(2, '0')}`;
      slots.push(timeStr);
      
      currM += duration;
      if (currM >= 60) {
        currH += Math.floor(currM / 60);
        currM %= 60;
      }
    }
    return slots;
  };

  // Block time slot (creates blocked appointment)
  const handleBlockSlot = async (time: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const doc = doctors.find(d => d.id === selectedDoctorId);
      
      const payload = {
        doctorId: selectedDoctorId,
        serviceId: doc && doc.availability.length > 0 ? "blocked-placeholder" : "blocked", // api handles service resolving internally
        appointmentDate: selectedDate,
        startTime: time,
        status: "CONFIRMED",
        patient: {
          firstName: "Blocked",
          lastName: "Slot",
          email: "blocked-slot@heshvithadental.com",
          phone: "9999999999",
          isFirstVisit: false,
          chiefComplaint: "Blocked by Admin for break / maintenance"
        }
      };

      // We resolve a fallback service ID for safety (grab first service or create placeholder)
      let resolvedServiceId = "";
      const servicesRes = await fetch(`${API_URL}/public/services`);
      if (servicesRes.ok) {
        const sData = await servicesRes.json();
        if (sData.success && sData.data.length > 0) {
          resolvedServiceId = sData.data[0].id;
        }
      }
      
      if (!resolvedServiceId) {
        toast.error("Need at least one service configured to block slots");
        return;
      }
      
      payload.serviceId = resolvedServiceId;
      
      const res = await fetch(`${API_URL}/admin/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (resData.success) {
        toast.success("Time slot successfully blocked!");
        loadDailySlots();
      } else {
        toast.error(resData.error?.message || "Failed to block slot");
      }
    } catch {
      toast.error("Network error blocking slot");
    }
  };

  // Unblock time slot (deletes blocked appointment)
  const handleUnblockSlot = async (apptId: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/appointments/${apptId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Time slot unblocked successfully!");
        loadDailySlots();
      } else {
        toast.error(data.error?.message || "Failed to unblock slot");
      }
    } catch {
      toast.error("Network error unblocking slot");
    }
  };

  // Save Doctor weekly schedule
  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvailSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const doc = doctors.find(d => d.id === selectedDoctorId);
      
      const payload = {
        firstName: doc?.firstName,
        lastName: doc?.lastName,
        availability: availList.map(a => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          slotMinutes: parseInt(a.slotMinutes.toString()),
          isAvailable: a.isAvailable
        }))
      };
      
      const res = await fetch(`${API_URL}/admin/doctors/${selectedDoctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (resData.success) {
        toast.success("Doctor's weekly hours updated successfully!");
        // Update local state
        setDoctors(prev => prev.map(d => d.id === selectedDoctorId ? { ...d, availability: resData.data.availability || availList } : d));
      } else {
        toast.error(resData.error?.message || "Failed to update availability");
      }
    } catch {
      toast.error("Network error occurred");
    } finally {
      setAvailSaving(false);
    }
  };

  // Add holiday closure
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName) return;
    setHolidaySubmitLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/settings/holidays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: newHolidayDate,
          name: newHolidayName,
          type: newHolidayType
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Holiday closure registered!");
        setNewHolidayDate("");
        setNewHolidayName("");
        
        // Reload holidays
        const hRes = await fetch(`${API_URL}/admin/settings/holidays`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const hData = await hRes.json();
        setHolidays(hData.data || []);
      } else {
        toast.error(data.error?.message || "Failed to add holiday closure");
      }
    } catch {
      toast.error("Network error registering holiday");
    } finally {
      setHolidaySubmitLoading(false);
    }
  };

  // Delete holiday closure
  const handleDeleteHoliday = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" holiday?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/settings/holidays/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Holiday closure removed!");
        setHolidays(prev => prev.filter(h => h.id !== id));
      }
    } catch {
      toast.error("Deletion failed");
    }
  };

  const selectedDoctorObj = doctors.find(d => d.id === selectedDoctorId);
  const allGeneratedSlots = generateSlots();
  
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 font-semibold animate-pulse">
        Initializing schedule panel...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Calendar className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400" />
            Schedule & Slots Manager
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">Configure appointment slots, block breaks, and manage closures.</p>
        </div>

        {/* Tab switch tags */}
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl max-w-max">
          {[
            { id: "slots", label: "Daily Slots", icon: Clock },
            { id: "availability", label: "Weekly Schedule", icon: Settings },
            { id: "holidays", label: "Holidays", icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        
        {/* Tab 1: Slots Ticker */}
        {activeTab === "slots" && (
          <div className="space-y-6">
            
            {/* Filter controls bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-inner">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wide">1. Select Specialist</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600" />
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600/30 cursor-pointer"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wide">2. Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600/30 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={loadDailySlots}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700/80 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-sync Slots
                </button>
              </div>
            </div>

            {/* Slots visualization */}
            {slotLoading ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 animate-pulse font-bold">Synchronizing day availability data...</div>
            ) : isHoliday ? (
              <div className="p-8 border border-dashed border-red-200 dark:border-red-900/40 rounded-2xl bg-red-50/20 dark:bg-red-950/10 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="w-10 h-10 text-red-500 mb-2.5 animate-bounce" />
                <h4 className="font-bold text-red-700 dark:text-red-400 text-sm">Clinic Holiday Closure</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-sm">
                  The clinic is closed on this date for <strong>"{holidayName}"</strong>. No patient appointments can be booked or scheduled.
                </p>
              </div>
            ) : allGeneratedSlots.length === 0 ? (
              <div className="p-8 border border-dashed border-amber-250 dark:border-amber-900/40 rounded-2xl bg-amber-50/20 dark:bg-amber-950/10 flex flex-col items-center justify-center text-center">
                <Info className="w-10 h-10 text-amber-500 mb-2.5" />
                <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm">Doctor Not Scheduled</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-sm">
                  Dr. {selectedDoctorObj?.firstName} is marked as closed/unavailable on <strong>{getWeekday(selectedDate)}s</strong>.
                </p>
                <button onClick={() => setActiveTab("availability")} className="mt-4 text-xs font-bold text-blue-600 hover:underline">Customize Working Hours &rarr;</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                    {getWeekday(selectedDate)} Slots Grid
                  </h3>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-455">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />Available</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block" />Booked</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm inline-block" />Blocked</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {allGeneratedSlots.map(time => {
                    // Match with appointments
                    const slotAppts = appointments.filter(a => a.startTime === time);
                    const blockAppt = slotAppts.find(a => a.patient?.email === "blocked-slot@heshvithadental.com");
                    
                    if (blockAppt) {
                      return (
                        <div key={time} className="flex items-center justify-between p-3 bg-red-50/20 dark:bg-red-950/10 border border-red-200/60 dark:border-red-900/40 rounded-xl gap-4 animate-in fade-in duration-200">
                          <div className="flex gap-2.5 items-center min-w-0">
                            <span className="font-bold text-xs text-red-600 dark:text-red-400">{formatTime12Hour(time)}</span>
                            <div className="h-4 w-px bg-red-200 dark:bg-red-900" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Admin Blocked
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-550 truncate mt-0.5">{blockAppt.notes || "Offline slot closure"}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnblockSlot(blockAppt.id)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-emerald-250 dark:hover:border-emerald-900/60 cursor-pointer shadow-sm shrink-0 transition-colors flex items-center gap-1"
                            title="Make Slot Available"
                          >
                            <Unlock className="w-3 h-3" /> Unblock
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={time} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/20 space-y-2 flex flex-col justify-between">
                        {/* Header for the slot */}
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-350">{formatTime12Hour(time)}</span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                            {slotAppts.length === 0 ? "Available" : `${slotAppts.length}/3 Booked`}
                          </span>
                        </div>

                        {/* List appointments in this slot */}
                        <div className="space-y-1.5">
                          {slotAppts.map(appt => (
                            <div key={appt.id} className="flex items-center justify-between p-2 bg-blue-50/20 dark:bg-blue-950/10 border border-blue-250/30 dark:border-blue-900/30 rounded-lg gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {appt.patient?.firstName} {appt.patient?.lastName}
                                </p>
                                <p className="text-[9px] text-slate-450 dark:text-slate-500 truncate mt-0.5">{appt.service?.name}</p>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border tracking-wider select-none shrink-0 ${
                                appt.status === "CONFIRMED" 
                                  ? "bg-blue-100 dark:bg-blue-950/50 border-blue-200 text-blue-700 dark:text-blue-400"
                                  : "bg-amber-105/50 border-amber-250 text-amber-705 dark:text-amber-400"
                              }`}>
                                {appt.status}
                              </span>
                            </div>
                          ))}

                          {/* Render booking/blocking option if there's still capacity */}
                          {slotAppts.length < 3 && (
                            <div className="flex items-center justify-between p-2 bg-emerald-50/10 dark:bg-emerald-950/5 border border-dashed border-emerald-200/40 dark:border-emerald-900/20 rounded-lg gap-3">
                              <span className="text-[9px] font-medium text-emerald-650 dark:text-emerald-450">Empty spot ({3 - slotAppts.length} left)</span>
                              <button
                                onClick={() => handleBlockSlot(time)}
                                className="px-2 py-0.5 text-[9px] font-bold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 rounded hover:border-red-200 cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                              >
                                <Lock className="w-2.5 h-2.5" /> Block
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Weekly Availability schedule */}
        {activeTab === "availability" && (
          <form onSubmit={handleSaveAvailability} className="space-y-6">
            
            {/* Doctor Select bar */}
            <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-inner max-w-sm">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wide">Select Dentist</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-855 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600/30 cursor-pointer"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} ({d.specialization})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Availability Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-400">
                <thead>
                  <tr className="bg-slate-55/40 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="p-4 w-40">Weekday</th>
                    <th className="p-4 w-32">Status</th>
                    <th className="p-4">Start Time</th>
                    <th className="p-4">End Time</th>
                    <th className="p-4 w-40">Slot Minutes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 font-medium">
                  {availList.map((day, idx) => (
                    <tr key={day.dayOfWeek} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {day.dayOfWeek}
                      </td>
                      <td className="p-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.isAvailable}
                            onChange={(e) => {
                              const updated = [...availList];
                              updated[idx].isAvailable = e.target.checked;
                              setAvailList(updated);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-500 peer-checked:text-blue-650">
                            {day.isAvailable ? "Open" : "Closed"}
                          </span>
                        </label>
                      </td>
                      <td className="p-4">
                        <input
                          type="time"
                          value={day.startTime}
                          disabled={!day.isAvailable}
                          onChange={(e) => {
                            const updated = [...availList];
                            updated[idx].startTime = e.target.value;
                            setAvailList(updated);
                          }}
                          className="py-1.5 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-650 bg-white dark:bg-slate-950 disabled:opacity-40 disabled:bg-slate-50 text-slate-800 dark:text-slate-200 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="time"
                          value={day.endTime}
                          disabled={!day.isAvailable}
                          onChange={(e) => {
                            const updated = [...availList];
                            updated[idx].endTime = e.target.value;
                            setAvailList(updated);
                          }}
                          className="py-1.5 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-650 bg-white dark:bg-slate-950 disabled:opacity-40 disabled:bg-slate-50 text-slate-800 dark:text-slate-200 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <select
                          value={day.slotMinutes}
                          disabled={!day.isAvailable}
                          onChange={(e) => {
                            const updated = [...availList];
                            updated[idx].slotMinutes = parseInt(e.target.value);
                            setAvailList(updated);
                          }}
                          className="py-1.5 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-650 bg-white dark:bg-slate-950 disabled:opacity-40 disabled:bg-slate-50 text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <option value="15">15 mins</option>
                          <option value="30">30 mins</option>
                          <option value="45">45 mins</option>
                          <option value="60">60 mins</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save bar */}
            <div className="pt-4 border-t border-slate-150/60 dark:border-slate-800 flex justify-end">
              <button
                type="submit" disabled={availSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 transition-transform"
              >
                <Lock className="w-4 h-4" /> {availSaving ? "Saving..." : "Save Specialist Schedule"}
              </button>
            </div>

          </form>
        )}

        {/* Tab 3: Holidays Manager */}
        {activeTab === "holidays" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Add holiday form */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                  <Plus className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                  Add Holiday / Closure
                </h4>
                <form onSubmit={handleAddHoliday} className="space-y-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-inner">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Date</label>
                    <input
                      type="date"
                      required
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-855 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Closure Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diwali Holiday"
                      value={newHolidayName}
                      onChange={(e) => setNewHolidayName(e.target.value)}
                      className="py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-855 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Type</label>
                    <select
                      value={newHolidayType}
                      onChange={(e) => setNewHolidayType(e.target.value)}
                      className="py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none bg-white dark:bg-slate-950 cursor-pointer"
                    >
                      <option value="holiday">Official Holiday</option>
                      <option value="maintenance">Clinic Maintenance</option>
                      <option value="emergency">Emergency Closure</option>
                    </select>
                  </div>

                  <button
                    type="submit" disabled={holidaySubmitLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl cursor-pointer disabled:opacity-50 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" /> {holidaySubmitLoading ? "Saving..." : "Add Closure"}
                  </button>
                </form>
              </div>

              {/* Holidays list */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Active Closures List</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Patients are blocked from selecting times on these dates.</p>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                    {holidays.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                        No holiday closures registered.
                      </div>
                    ) : (
                      holidays.map(h => (
                        <div key={h.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors gap-4">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{h.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 font-mono">
                              {new Date(h.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border tracking-wider select-none ${
                              h.type === "maintenance" 
                                ? "bg-amber-50 border-amber-250 text-amber-700"
                                : h.type === "emergency"
                                ? "bg-red-50 border-red-250 text-red-700"
                                : "bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                            }`}>
                              {h.type}
                            </span>
                            <button
                              onClick={() => handleDeleteHoliday(h.id, h.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
