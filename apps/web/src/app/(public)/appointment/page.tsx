"use client";

import { useState, useEffect } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, User, Calendar as CalendarIcon, Clock as ClockIcon, ArrowLeft, Stethoscope, AlertCircle, FileText, Sparkles, ShieldCheck, Info } from "lucide-react";
import Link from "next/link";
import { services } from "@/data/services";
import { API_URL } from "@/lib/api";

const doctors = [
  { id: "dr-arjun-mehta", name: "Dr. Arjun Mehta", specialization: "Orthodontist", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=faces" },
  { id: "dr-priya-reddy", name: "Dr. Priya Reddy", specialization: "Cosmetic Dentist", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces" },
  { id: "dr-rohan-sharma", name: "Dr. Rohan Sharma", specialization: "Oral Surgeon", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=faces" },
  { id: "dr-ananya-patel", name: "Dr. Ananya Patel", specialization: "Pediatric Dentist", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=faces" },
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

const steps = ["Treatment", "Specialist", "Schedule", "Details", "Review"];

export default function AppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    chiefComplaint: "",
    isFirstVisit: true,
    hasInsurance: false,
    preferredContact: "Phone",
  });

  interface TimeSlotInfo {
    time: string;
    available: boolean;
    status: 'AVAILABLE' | 'FULLY_BOOKED' | 'BLOCKED' | 'PAST';
    bookingCount: number;
  }

  const isToday = (date: string) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    return date === todayStr;
  };

  const isPastTime = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime < now;
  };

  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbDoctors, setDbDoctors] = useState<any[]>([]);
  const [dbSlots, setDbSlots] = useState<TimeSlotInfo[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const [bookingRef, setBookingRef] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get("service");
      if (serviceParam) {
        setSelectedService(serviceParam);
        setCurrentStep(2); // Auto-advance to Doctor selection
      }
    }
  }, []);

  // Fetch services, doctors, and settings
  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, doctorsRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/public/services`),
          fetch(`${API_URL}/public/doctors`),
          fetch(`${API_URL}/public/settings`)
        ]);
        if (servicesRes.ok) {
          const sData = await servicesRes.json();
          if (sData.success && sData.data) setDbServices(sData.data);
        }
        if (doctorsRes.ok) {
          const dData = await doctorsRes.json();
          if (dData.success && dData.data) setDbDoctors(dData.data);
        }
        if (settingsRes.ok) {
          const stData = await settingsRes.json();
          if (stData.success && stData.data) setClinicSettings(stData.data);
        }
      } catch (err) {
        console.warn("Could not fetch from API, falling back to static local data", err);
      }
    }
    loadData();
  }, []);

  // Fetch available slots
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setDbSlots([]);
      setSlotsLoaded(false);
      return;
    }
    async function loadSlots() {
      setSlotsLoaded(false);
      try {
        const res = await fetch(`${API_URL}/public/appointments/slots?doctorId=${selectedDoctor}&date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setDbSlots(data.data);
            setSlotsLoaded(true);
          }
        }
      } catch (err) {
        console.warn("Could not fetch slots from API, falling back to static times", err);
        setSlotsLoaded(false);
      }
    }
    loadSlots();
  }, [selectedDoctor, selectedDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setPatientData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const startTime24 = convertTo24Hour(selectedTime || "");
      const bookingPayload = {
        serviceId: selectedService,
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        startTime: startTime24,
        patient: {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          isFirstVisit: patientData.isFirstVisit,
          chiefComplaint: patientData.chiefComplaint
        }
      };

      const res = await fetch(`${API_URL}/public/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error?.message || "Failed to book appointment. Please try again.");
      }

      setBookingRef(resJson.data.bookingRef);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedServices = dbServices.length > 0
    ? dbServices.map(s => {
        const localSvc = services.find(ls => ls.slug === s.slug || ls.id === s.id);
        return {
          id: s.id,
          name: s.name,
          title: s.name,
          slug: s.slug,
          shortDesc: s.shortDescription,
          icon: localSvc?.icon || Stethoscope,
          image: s.imageUrl || localSvc?.image || "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80"
        };
      })
    : services;

  const displayedDoctors = dbDoctors.length > 0
    ? dbDoctors.map(d => {
        const localDoc = doctors.find(ld => ld.id === d.id || ld.id === d.slug);
        return {
          id: d.id,
          name: `Dr. ${d.firstName} ${d.lastName}`,
          specialization: d.specialization,
          image: d.avatarUrl || localDoc?.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=faces",
          slug: d.slug
        };
      })
    : doctors;

  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return "";
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date(dateStr).getDay()];
  };

  const getFallbackSlots = (): TimeSlotInfo[] => {
    if (!selectedDate) return [];
    
    const createFallbackInfo = (time24: string): TimeSlotInfo => {
      const past = isToday(selectedDate) && isPastTime(time24);
      return {
        time: time24,
        available: !past,
        status: past ? 'PAST' : 'AVAILABLE',
        bookingCount: 0
      };
    };

    if (!clinicSettings || !clinicSettings.workingHours) {
      return timeSlots.map(slot => {
        const time24 = convertTo24Hour(slot);
        return createFallbackInfo(time24);
      });
    }
    
    const dayOfWeek = getDayOfWeek(selectedDate);
    const schedule = clinicSettings.workingHours.find((h: any) => h.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isAvailable) return [];
    
    const slots: TimeSlotInfo[] = [];
    let [currentH, currentM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const duration = schedule.slotMinutes || 30;

    while (currentH < endH || (currentH === endH && currentM < endM)) {
      const timeStr24 = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
      slots.push(createFallbackInfo(timeStr24));
      
      currentM += duration;
      if (currentM >= 60) {
        currentH += Math.floor(currentM / 60);
        currentM %= 60;
      }
    }
    return slots;
  };

  const displayedSlots = slotsLoaded ? dbSlots : getFallbackSlots();

  const selectedServiceObj = displayedServices.find(s => s.id === selectedService);
  const selectedDoctorObj = displayedDoctors.find(d => d.id === selectedDoctor);

  // Success screen
  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        <PageHero
          title="Booking"
          titleAccent="Confirmed"
          subtitle="Thank you for choosing Heshvitha Dental. We look forward to seeing you!"
          breadcrumbs={[{ label: "Appointment Confirmation" }]}
        />
        <div className="py-12 md:py-16 flex items-center justify-center container mx-auto px-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 max-w-xl w-full text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6 border-4 border-emerald-100 dark:border-emerald-900/30 shadow-inner">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2 font-display">You're All Set!</h2>
            <p className="text-slate-655 dark:text-slate-400 mb-8 text-sm">We've sent a confirmation email with details to <span className="font-semibold text-slate-800 dark:text-slate-200">{patientData.email}</span>.</p>

            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl text-left border border-slate-200 dark:border-slate-850 mb-8 space-y-5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Booking Reference</p>
                <p className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">{bookingRef || `BS-${Math.floor(100000 + Math.random() * 900000)}`}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Date & Time</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {selectedDate}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5 mt-1"><ClockIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-450" /> {selectedTime ? formatTime12Hour(selectedTime) : ""}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Doctor</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img src={selectedDoctorObj?.image} alt="Doctor" className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-800" />
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{selectedDoctorObj?.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm transition-all cursor-pointer" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Navigation validation helper
  const isStepComplete = (step: number) => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDoctor;
    if (step === 3) return !!selectedDate && !!selectedTime;
    if (step === 4) return !!patientData.firstName && !!patientData.lastName && !!patientData.email && !!patientData.phone;
    return true;
  };

  const activeStepLabel = steps[currentStep - 1];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200">
      <PageHero
        title="Book an"
        titleAccent="Appointment"
        subtitle="Schedule your visit in just a few clicks. Select your preferred service, doctor, and time slot below."
        breadcrumbs={[{ label: "Book Appointment" }]}
      />

      <div className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-16 max-w-7xl">
          
          {/* STEPPER HEADER PROGRESS */}
          <div className="mb-10 max-w-4xl mx-auto">
            <div className="relative flex justify-between items-center">
              <div className="absolute top-1/2 left-0 w-full h-[3px] bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
              <div
                className="absolute top-1/2 left-0 h-[3px] bg-blue-600 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((step, idx) => {
                const sNum = idx + 1;
                const isCurrent = sNum === currentStep;
                const isPassed = sNum < currentStep;
                return (
                  <button
                    key={step}
                    onClick={() => isStepComplete(sNum - 1) && sNum <= Math.max(1, currentStep) && setCurrentStep(sNum)}
                    disabled={sNum > currentStep && !isStepComplete(currentStep)}
                    className="flex flex-col items-center group relative z-10 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md
                      ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 scale-110"
                        : isPassed ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-655 border border-slate-200 dark:border-slate-800"}`}>
                      {isPassed ? <Check className="w-4 h-4" /> : sNum}
                    </div>
                    <span className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-bold tracking-wider uppercase hidden sm:inline transition-colors duration-300 
                      ${isCurrent ? "text-blue-600 dark:text-blue-400" : isPassed ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-655"}`}>
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TWO COLUMN BOOKING CHECKOUT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-12">
            
            {/* LEFT COLUMN: ACTIVE STEP SELECTOR */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Main Container Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-8 shadow-sm min-h-[460px] flex flex-col justify-between">
                <div>
                  
                  {/* Step Title Header */}
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-blue-605 dark:text-blue-400 uppercase tracking-widest mb-1">Step {currentStep} of {steps.length}</p>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">
                      {currentStep === 1 && "Choose Your Treatment"}
                      {currentStep === 2 && "Choose Your Specialist"}
                      {currentStep === 3 && "Select Date & Time"}
                      {currentStep === 4 && "Provide Your Information"}
                      {currentStep === 5 && "Review & Confirm Appointment"}
                    </h2>
                  </div>

                  {/* Step 1: Select Service */}
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                      {displayedServices.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => { setSelectedService(service.id); setCurrentStep(2); }}
                          className={`text-left p-4.5 rounded-xl border transition-all duration-300 group flex items-start gap-4.5 bg-white dark:bg-slate-900/60 cursor-pointer
                            ${selectedService === service.id
                              ? "border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-600"
                              : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900/60 hover:shadow-md"}`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors
                            ${selectedService === service.id ? "bg-blue-600 text-white" : "bg-blue-50 dark:bg-slate-850 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white"}`}>
                            <service.icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-bold text-sm mb-1 truncate ${selectedService === service.id ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                              {service.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-455 line-clamp-2 leading-relaxed">{service.shortDesc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Step 2: Select Doctor */}
                  {currentStep === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                      {displayedDoctors.map((doctor) => (
                        <button
                          key={doctor.id}
                          onClick={() => { setSelectedDoctor(doctor.id); setCurrentStep(3); }}
                          className={`text-left p-4 rounded-xl border transition-all duration-300 group flex gap-4 items-center bg-white dark:bg-slate-900/60 cursor-pointer
                            ${selectedDoctor === doctor.id
                              ? "border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-600"
                              : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900/60 hover:shadow-md"}`}
                        >
                          <img src={doctor.image} alt={doctor.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                          <div className="flex-grow min-w-0">
                            <h3 className={`font-bold text-sm truncate ${selectedDoctor === doctor.id ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                              {doctor.name}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{doctor.specialization}</p>
                          </div>
                          <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                            ${selectedDoctor === doctor.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 dark:border-slate-700 group-hover:border-blue-400"}`}>
                            {selectedDoctor === doctor.id && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Step 3: Date & Time Slot selection */}
                  {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">1. Select Date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 outline-none text-sm font-semibold transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 cursor-pointer"
                        />
                        <div className="mt-4 flex items-start gap-2 text-slate-400 dark:text-slate-500 text-xs">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Same-day bookings are subject to doctor scheduling confirmation.</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">2. Available Times</label>
                        {!selectedDate ? (
                          <div className="h-44 rounded-xl border border-dashed border-slate-350 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                            Choose a date on the left
                          </div>
                        ) : displayedSlots.length === 0 ? (
                          <div className="h-44 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-4 text-center">
                            <AlertCircle className="w-7 h-7 text-amber-500 mb-1.5 animate-bounce" />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-350">Fully Booked / Closed</p>
                            <p className="text-[10px] mt-1">Please select another date on the calendar.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                            {displayedSlots.map((slotInfo) => {
                              const isSelected = selectedTime === slotInfo.time;
                              const isAvail = slotInfo.available;
                              const status = slotInfo.status;
                              const count = slotInfo.bookingCount;

                              // Decide styling
                              let btnClass = "";
                              let statusText = "";
                              let isClickable = true;

                              if (status === 'AVAILABLE') {
                                if (isSelected) {
                                  btnClass = "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/20 scale-98 shadow-sm";
                                } else {
                                  btnClass = "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-900 hover:text-blue-600 dark:hover:text-blue-400";
                                }
                                if (count > 0) {
                                  statusText = `${3 - count} left`;
                                }
                              } else if (status === 'FULLY_BOOKED') {
                                btnClass = "bg-amber-50/10 dark:bg-amber-950/10 text-amber-600 dark:text-amber-550 border-amber-250/50 dark:border-amber-900/30 cursor-not-allowed opacity-70";
                                statusText = "Full";
                                isClickable = false;
                              } else if (status === 'PAST') {
                                btnClass = "bg-slate-105/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 border-slate-200/60 dark:border-slate-800/40 cursor-not-allowed opacity-50";
                                statusText = "Blocked";
                                isClickable = false;
                              } else if (status === 'BLOCKED') {
                                btnClass = "bg-red-50/10 dark:bg-red-950/10 text-red-500 dark:text-red-650 border-red-200/50 dark:border-red-900/30 cursor-not-allowed opacity-70";
                                statusText = "Blocked";
                                isClickable = false;
                              }

                              return (
                                <button
                                  key={slotInfo.time}
                                  type="button"
                                  disabled={!isClickable}
                                  onClick={() => isClickable && setSelectedTime(slotInfo.time)}
                                  className={`relative py-2 px-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center select-none flex flex-col items-center justify-center min-h-[52px] ${btnClass}`}
                                >
                                  <span>{formatTime12Hour(slotInfo.time)}</span>
                                  {statusText && (
                                    <span className={`text-[8px] uppercase tracking-wider font-extrabold mt-0.5 ${
                                      isSelected ? "text-blue-200" :
                                      status === 'AVAILABLE' ? "text-emerald-600 dark:text-emerald-400" :
                                      status === 'FULLY_BOOKED' ? "text-amber-600 dark:text-amber-500" :
                                      status === 'BLOCKED' ? "text-red-500" : "text-slate-400"
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
                    </div>
                  )}

                  {/* Step 4: Patient details input */}
                  {currentStep === 4 && (
                    <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wide">First Name *</label>
                        <input type="text" name="firstName" value={patientData.firstName} onChange={handleInputChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 outline-none text-sm transition-all" placeholder="John" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wide">Last Name *</label>
                        <input type="text" name="lastName" value={patientData.lastName} onChange={handleInputChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 outline-none text-sm transition-all" placeholder="Doe" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wide">Email Address *</label>
                        <input type="email" name="email" value={patientData.email} onChange={handleInputChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 outline-none text-sm transition-all" placeholder="john@example.com" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wide">Phone Number *</label>
                        <input type="tel" name="phone" value={patientData.phone} onChange={handleInputChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 outline-none text-sm transition-all" placeholder="083746 21025" />
                      </div>

                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wide">Symptoms / Reason for Visit (Optional)</label>
                        <textarea name="chiefComplaint" value={patientData.chiefComplaint} onChange={handleInputChange} rows={2.5} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 outline-none text-sm transition-all resize-none" placeholder="Describe symptoms or treatment requests..."></textarea>
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-2 gap-3 mt-1.5">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" onClick={() => setPatientData(prev => ({ ...prev, isFirstVisit: !prev.isFirstVisit }))}>
                          <input type="checkbox" name="isFirstVisit" checked={patientData.isFirstVisit} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded border-slate-350 focus:ring-blue-600 cursor-pointer shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">I am a new patient</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" onClick={() => setPatientData(prev => ({ ...prev, hasInsurance: !prev.hasInsurance }))}>
                          <input type="checkbox" name="hasInsurance" checked={patientData.hasInsurance} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded border-slate-350 focus:ring-blue-600 cursor-pointer shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">I have insurance</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Final Review */}
                  {currentStep === 5 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4.5 border border-slate-250/60 dark:border-slate-850 space-y-4">
                        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              {selectedServiceObj?.icon ? <selectedServiceObj.icon className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Treatment Type</p>
                              <p className="font-bold text-sm text-slate-850 dark:text-slate-100">{selectedServiceObj?.name}</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(1)} className="text-blue-650 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer">Modify</button>
                        </div>

                        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex gap-3">
                            <img src={selectedDoctorObj?.image} alt="Doctor" className="w-10 h-10 rounded-lg object-cover border border-slate-250 dark:border-slate-850 shrink-0" />
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Doctor / Specialist</p>
                              <p className="font-bold text-sm text-slate-850 dark:text-slate-100">{selectedDoctorObj?.name}</p>
                              <p className="text-[10px] text-slate-550 dark:text-slate-450">{selectedDoctorObj?.specialization}</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(2)} className="text-blue-650 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer">Modify</button>
                        </div>

                        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                              <CalendarIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date & Time Slot</p>
                              <p className="font-bold text-sm text-slate-855 dark:text-slate-100">
                                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-xs font-bold text-blue-600 dark:text-blue-450 mt-0.5">{selectedTime ? formatTime12Hour(selectedTime) : ""}</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(3)} className="text-blue-650 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer">Modify</button>
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Patient Credentials</p>
                              <p className="font-bold text-sm text-slate-855 dark:text-slate-100">{patientData.firstName} {patientData.lastName}</p>
                              <p className="text-[10px] text-slate-550 dark:text-slate-450">{patientData.phone} · {patientData.email}</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(4)} className="text-blue-650 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer">Modify</button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer buttons row */}
                <div className="mt-8 pt-4 border-t border-slate-150/60 dark:border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1 || isSubmitting}
                    className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    {currentStep > 1 && <ArrowLeft className="w-4 h-4" />} Back
                  </button>

                  {currentStep < steps.length ? (
                    <Button
                      onClick={() => isStepComplete(currentStep) && setCurrentStep(prev => prev + 1)}
                      disabled={!isStepComplete(currentStep)}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-10 text-xs font-bold shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBookingSubmit}
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 h-10 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Confirming..." : "Confirm Booking"}
                    </Button>
                  )}
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: STICKY BOOKING SUMMARY PANEL */}
            <div className="lg:col-span-1 sticky top-20">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
                
                <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2 pb-2.5 border-b border-slate-150/60 dark:border-slate-800">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Appointment Details
                </h3>

                {/* Live Selections */}
                <div className="space-y-4">
                  
                  {/* Service Detail */}
                  {selectedServiceObj ? (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        {selectedServiceObj.icon ? <selectedServiceObj.icon className="w-4.5 h-4.5" /> : <Stethoscope className="w-4.5 h-4.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Selected Treatment</p>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{selectedServiceObj.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-center text-slate-400 dark:text-slate-655 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3">
                      <Stethoscope className="w-4 h-4 shrink-0" />
                      <span>Select a treatment to start</span>
                    </div>
                  )}

                  {/* Doctor Detail */}
                  {selectedDoctorObj ? (
                    <div className="flex gap-3">
                      <img src={selectedDoctorObj.image} alt="Doctor" className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned Dentist</p>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{selectedDoctorObj.name}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-450">{selectedDoctorObj.specialization}</p>
                      </div>
                    </div>
                  ) : selectedServiceObj ? (
                    <div className="flex gap-3 items-center text-slate-400 dark:text-slate-655 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3">
                      <User className="w-4 h-4 shrink-0" />
                      <span>Select your doctor</span>
                    </div>
                  ) : null}

                  {/* Date & Time Detail */}
                  {selectedDate || selectedTime ? (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Time & Date</p>
                        {selectedDate && (
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-100">
                            {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                        {selectedTime && (
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{formatTime12Hour(selectedTime)}</p>
                        )}
                      </div>
                    </div>
                  ) : selectedDoctorObj ? (
                    <div className="flex gap-3 items-center text-slate-400 dark:text-slate-655 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3">
                      <CalendarIcon className="w-4 h-4 shrink-0" />
                      <span>Select date and slot</span>
                    </div>
                  ) : null}

                </div>

                {/* Error Banner inside summary */}
                {errorMsg && (
                  <div className="p-3 bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 rounded-xl text-xs text-red-655 dark:text-red-400 flex items-start gap-1.5 leading-snug font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Instant CTA Submit Shortcut */}
                {selectedService && selectedDoctor && selectedDate && selectedTime && (
                  <div className="pt-3 border-t border-slate-150/60 dark:border-slate-800">
                    {currentStep < 4 ? (
                      <Button
                        onClick={() => setCurrentStep(4)}
                        className="w-full bg-blue-650 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-bold shadow-md cursor-pointer"
                      >
                        Provide Patient Info &rarr;
                      </Button>
                    ) : currentStep === 4 ? (
                      <Button
                        onClick={() => isStepComplete(4) && setCurrentStep(5)}
                        disabled={!isStepComplete(4)}
                        className="w-full bg-blue-650 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                      >
                        Proceed to Review &rarr;
                      </Button>
                    ) : (
                      <Button
                        onClick={handleBookingSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? "Confirming..." : "Complete Booking"}
                      </Button>
                    )}
                  </div>
                )}

                {/* Trust Seal */}
                <div className="pt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>HIPAA Secure Booking</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
