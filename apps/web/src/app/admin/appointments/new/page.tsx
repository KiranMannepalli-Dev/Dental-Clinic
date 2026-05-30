"use client";
import { API_URL } from "@/lib/api";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Search, User, Calendar as CalendarIcon, 
  Clock as ClockIcon, Check, AlertCircle, Sparkles, 
  ChevronRight, Stethoscope, Plus, UserPlus, Info
} from "lucide-react";


export default function NewAppointmentAdmin() {
  const router = useRouter();

  // Master lists
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clinicSettings, setClinicSettings] = useState<any>(null);

  // Form State
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [status, setStatus] = useState<string>("CONFIRMED"); // Default admin appointments to CONFIRMED
  
  const [patientData, setPatientData] = useState({
    id: "", // Empty for new patient
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    chiefComplaint: "",
    isFirstVisit: true,
  });

  // Patient search state
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<any | null>(null);

  // Slots State
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

  // Loading & Messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Fetch doctors, services, and settings on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const [servicesRes, doctorsRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/public/services`),
          fetch(`${API_URL}/public/doctors`),
          fetch(`${API_URL}/public/settings`)
        ]);

        if (servicesRes.ok) {
          const sData = await servicesRes.json();
          if (sData.success) setServices(sData.data || []);
        }
        if (doctorsRes.ok) {
          const dData = await doctorsRes.json();
          if (dData.success) setDoctors(dData.data || []);
        }
        if (settingsRes.ok) {
          const stData = await settingsRes.json();
          if (stData.success) setClinicSettings(stData.data || null);
        }
      } catch (err) {
        console.error("Error loading config:", err);
      }
    }
    loadConfig();
  }, [router]);

  // Search existing patients
  useEffect(() => {
    if (patientSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchingPatients(true);
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/admin/patients?search=${encodeURIComponent(patientSearch)}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.data || []);
        }
      } catch (err) {
        console.error("Error searching patients:", err);
      } finally {
        setSearchingPatients(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [patientSearch]);

  // Fetch available slots when doctor/date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setAvailableSlots([]);
      setSlotsLoaded(false);
      return;
    }

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsLoaded(false);
      try {
        const res = await fetch(`${API_URL}/public/appointments/slots?doctorId=${selectedDoctor}&date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAvailableSlots(data.data || []);
            setSlotsLoaded(true);
          }
        }
      } catch (err) {
        console.error("Error loading slots:", err);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [selectedDoctor, selectedDate]);

  // Select an existing patient
  const handleSelectPatient = (patient: any) => {
    setSelectedExistingPatient(patient);
    setPatientData({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      chiefComplaint: "",
      isFirstVisit: false,
    });
    setPatientSearch("");
    setSearchResults([]);
  };

  // Clear existing patient selection
  const handleClearPatientSelection = () => {
    setSelectedExistingPatient(null);
    setPatientData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      chiefComplaint: "",
      isFirstVisit: true,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setPatientData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return "";
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date(dateStr).getDay()];
  };

  const getFallbackSlots = () => {
    if (!selectedDate) return [];
    if (!clinicSettings || !clinicSettings.workingHours) return [];
    
    const dayOfWeek = getDayOfWeek(selectedDate);
    const schedule = clinicSettings.workingHours.find((h: any) => h.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isAvailable) return []; // Closed day
    
    const slots = [];
    let [currentH, currentM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const duration = schedule.slotMinutes || 30;

    while (currentH < endH || (currentH === endH && currentM < endM)) {
      const ampm = currentH >= 12 ? "PM" : "AM";
      const displayH = currentH % 12 || 12;
      const timeStr12 = `${displayH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')} ${ampm}`;
      slots.push(timeStr12);
      
      currentM += duration;
      if (currentM >= 60) {
        currentH += Math.floor(currentM / 60);
        currentM %= 60;
      }
    }
    return slots;
  };

  const displayedSlots = slotsLoaded ? availableSlots : getFallbackSlots();

  // Convert 12-hour display slot to 24-hour database format
  const convertTo24Hour = (time12h: string) => {
    if (!time12h.includes("AM") && !time12h.includes("PM")) return time12h;
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const formatTime12Hour = (time24: string) => {
    if (time24.includes("AM") || time24.includes("PM")) return time24;
    const [hoursStr, minutesStr] = time24.split(":");
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, "0")}:${minutesStr} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDoctor || !selectedDate || !selectedTime) {
      setErrorMsg("Please select a service, specialist, date, and time slot.");
      return;
    }
    if (!patientData.firstName || !patientData.lastName || !patientData.email || !patientData.phone) {
      setErrorMsg("Please complete all patient detail fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("adminToken");
      const startTime24 = convertTo24Hour(selectedTime);
      const bookingPayload = {
        serviceId: selectedService,
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        startTime: startTime24,
        status: status,
        patient: {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          isFirstVisit: patientData.isFirstVisit,
          chiefComplaint: patientData.chiefComplaint
        }
      };

      const res = await fetch(`${API_URL}/admin/appointments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error?.message || "Failed to schedule appointment.");
      }

      setSuccessData(resJson.data);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-slate-200/60 p-8 text-center shadow-lg animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 border-4 border-emerald-100 shadow-sm">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Appointment Scheduled!</h2>
          <p className="text-slate-500 text-sm mb-6">The appointment has been registered successfully.</p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left mb-6 space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Booking Reference</p>
              <p className="font-mono font-bold text-base text-blue-600">{successData.bookingRef}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient Name</p>
                <p className="text-sm font-semibold text-slate-800">{successData.patient?.firstName} {successData.patient?.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                  successData.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>{successData.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Date & Time</p>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {new Date(successData.appointmentDate).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5 text-slate-400" /> {successData.startTime}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Specialist</p>
                <p className="text-sm font-semibold text-slate-800">Dr. {successData.doctor?.firstName} {successData.doctor?.lastName}</p>
                <p className="text-xs text-blue-650 font-bold">{successData.service?.name}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setSuccessData(null)} className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs cursor-pointer shadow-sm active:scale-98 transition-all">
              Schedule Another
            </button>
            <Link href="/admin/appointments" className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-center rounded-xl font-bold text-xs shadow-sm active:scale-98 transition-all flex items-center justify-center">
              View Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/appointments" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Schedule Appointment
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Book or schedule a client appointment from the office panel.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Patient Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Patient Information
              </h3>
              {selectedExistingPatient && (
                <button 
                  type="button" 
                  onClick={handleClearPatientSelection}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Existing Patient Search (Only visible if a patient is not selected) */}
            {!selectedExistingPatient && (
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search Existing Patient</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search patient by Name, Email, or Phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  />
                  {searchingPatients && (
                    <div className="w-4 h-4 border-2 border-slate-350 border-t-blue-500 rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2"></div>
                  )}
                </div>

                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{p.phone} • {p.email}</p>
                        </div>
                        <UserPlus className="w-4 h-4 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected existing patient banner */}
            {selectedExistingPatient && (
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {patientData.firstName.substring(0, 1)}{patientData.lastName.substring(0, 1)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Existing Patient Selected</p>
                  <p className="text-[10px] text-slate-500">ID: {patientData.id}</p>
                </div>
                <div className="ml-auto bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Returning Patient
                </div>
              </div>
            )}

            {/* Patient Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={patientData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="First name"
                  disabled={!!selectedExistingPatient}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={patientData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="Last name"
                  disabled={!!selectedExistingPatient}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={patientData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="email@example.com"
                  disabled={!!selectedExistingPatient}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={patientData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="Phone number"
                  disabled={!!selectedExistingPatient}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reason for Visit / Complaint</label>
                <textarea
                  name="chiefComplaint"
                  value={patientData.chiefComplaint}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white resize-none"
                  placeholder="e.g. Toothache on upper left molar..."
                />
              </div>

              {!selectedExistingPatient && (
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFirstVisit"
                    name="isFirstVisit"
                    checked={patientData.isFirstVisit}
                    onChange={handleInputChange}
                    className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isFirstVisit" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                    This is the patient's first visit to the clinic
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Specialty, Specialist & Date */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" /> Appointment Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Service *</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  required
                >
                  <option value="">-- Choose a Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Specialist *</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  required
                >
                  <option value="">-- Choose a Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Date *</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(""); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="CONFIRMED">Confirmed (Auto-Approved)</option>
                  <option value="PENDING">Pending (Requires Approval)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Time Slot Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-blue-600" /> Select Time Slot
            </h3>

            {!selectedDate || !selectedDoctor ? (
              <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center gap-2">
                <Info className="w-4 h-4" /> Please select a Specialist and Date first to view slot availability.
              </div>
            ) : slotsLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs italic animate-pulse">
                Checking availability slots...
              </div>
            ) : displayedSlots.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-center font-medium">
                No slots found. The specialist may be unavailable or closed on this date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {displayedSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 px-1 border text-center text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm ${
                      selectedTime === slot
                        ? 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-600/25 scale-98'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    {formatTime12Hour(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Booking Summary Card */}
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 p-6 shadow-md z-10 sticky top-24 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Booking Summary</h3>
            
            <div className="space-y-4 text-xs font-medium">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient Name</p>
                <p className="text-slate-800 font-bold mt-0.5">
                  {patientData.firstName || patientData.lastName 
                    ? `${patientData.firstName} ${patientData.lastName}`
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Selected Service</p>
                <p className="text-slate-800 font-bold mt-0.5">
                  {selectedService 
                    ? services.find(s => s.id === selectedService)?.name 
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assigned Doctor</p>
                <p className="text-slate-800 font-bold mt-0.5">
                  {selectedDoctor 
                    ? `Dr. ${doctors.find(d => d.id === selectedDoctor)?.firstName} ${doctors.find(d => d.id === selectedDoctor)?.lastName}`
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Scheduled Time</p>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <p className="text-slate-800 font-bold">
                    {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                  </p>
                  {selectedTime && (
                    <p className="text-blue-600 font-bold text-xs flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5 text-blue-600" /> {formatTime12Hour(selectedTime)}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-bold">Approval Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border mt-1 ${
                  status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>{status}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedService || !selectedDoctor || !selectedDate || !selectedTime}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-98 transition-all cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Scheduling...
                  </span>
                ) : (
                  "Confirm & Schedule"
                )}
              </button>
              <Link href="/admin/appointments" className="block w-full py-2.5 text-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-sm">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
