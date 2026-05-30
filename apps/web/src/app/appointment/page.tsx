"use client";

import { useState, useEffect } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, User, Calendar as CalendarIcon, Clock as ClockIcon, ArrowLeft, Stethoscope, AlertCircle } from "lucide-react";
import Link from "next/link";
import { services } from "@/data/services";
import { API_URL } from "@/lib/api";

// --- Static Data for Reliable Booking ---

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

const steps = ["Service", "Doctor", "Date & Time", "Details", "Confirm"];

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

  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbDoctors, setDbDoctors] = useState<any[]>([]);
  const [dbSlots, setDbSlots] = useState<string[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const [bookingRef, setBookingRef] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

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
          if (sData.success && sData.data) {
            setDbServices(sData.data);
          }
        }
        if (doctorsRes.ok) {
          const dData = await doctorsRes.json();
          if (dData.success && dData.data) {
            setDbDoctors(dData.data);
          }
        }
        if (settingsRes.ok) {
          const stData = await settingsRes.json();
          if (stData.success && stData.data) {
            setClinicSettings(stData.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch from API, falling back to static local data", err);
      }
    }
    loadData();
  }, [API_URL]);

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
  }, [selectedDoctor, selectedDate, API_URL]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setPatientData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Convert 12-hour slot (e.g. "09:00 AM") to 24-hour format (e.g. "09:00") for the backend
  const convertTo24Hour = (time12h: string) => {
    if (!time12h.includes("AM") && !time12h.includes("PM")) return time12h; // already 24h
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // Format 24-hour slot (e.g. "14:00") to 12-hour format (e.g. "02:00 PM") for display
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

  const getFallbackSlots = () => {
    if (!selectedDate) return [];
    if (!clinicSettings || !clinicSettings.workingHours) {
      return timeSlots;
    }
    
    const dayOfWeek = getDayOfWeek(selectedDate);
    const schedule = clinicSettings.workingHours.find((h: any) => h.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isAvailable) {
      return []; // Closed day
    }
    
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

  const displayedSlots = slotsLoaded ? dbSlots : getFallbackSlots();

  const selectedServiceObj = displayedServices.find(s => s.id === selectedService);
  const selectedDoctorObj = displayedDoctors.find(d => d.id === selectedDoctor);

  // Success State
  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <PageHero
          title="Booking"
          titleAccent="Confirmed"
          subtitle="Thank you for choosing Heshvitha Dental. We look forward to seeing you!"
          breadcrumbs={[{ label: "Appointment Confirmation" }]}
        />

        <div className="py-12 md:py-16 flex items-center justify-center container mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 max-w-xl w-full text-center hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 border-4 border-emerald-100 shadow-inner">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2 font-display">You're All Set!</h2>
            <p className="text-slate-600 mb-8 text-sm">We've sent a confirmation email with details to <span className="font-semibold text-slate-800">{patientData.email}</span>.</p>

            <div className="bg-slate-50 p-6 rounded-lg text-left border border-slate-200 mb-8 space-y-5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Booking Reference</p>
                <p className="font-mono font-bold text-lg text-blue-600">{bookingRef || `BS-${Math.floor(100000 + Math.random() * 900000)}`}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Date & Time</p>
                  <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-blue-600" /> {selectedDate}</p>
                  <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-1"><ClockIcon className="w-3.5 h-3.5 text-blue-600" /> {selectedTime}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Doctor</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img src={selectedDoctorObj?.image} alt="Doctor" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                    <p className="font-semibold text-slate-800 text-sm">{selectedDoctorObj?.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm transition-all cursor-pointer" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PageHero
        title="Book an"
        titleAccent="Appointment"
        subtitle="Schedule your visit in just a few clicks. Select your preferred service, doctor, and time slot below."
        breadcrumbs={[{ label: "Book Appointment" }]}
      />

      <div className="py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 max-w-5xl">

          {/* Progress Indicator */}
          <div className="mb-12 relative max-w-3xl mx-auto hidden sm:block">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            <div className="flex justify-between relative z-10">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                return (
                  <div key={step} className="flex flex-col items-center group">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 shadow-sm
                      ${isActive ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                        : isCompleted ? "bg-blue-600 text-white"
                          : "bg-white text-slate-400 border border-slate-200"}`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                    </div>
                    <span className={`absolute -bottom-6 whitespace-nowrap text-[11px] font-bold tracking-wide uppercase transition-colors duration-300 
                      ${isActive ? "text-blue-600" : isCompleted ? "text-slate-700" : "text-slate-400"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-200 p-6 md:p-10 min-h-[500px] flex flex-col relative max-w-4xl mx-auto">

            {/* Mobile Step Indicator */}
            <div className="sm:hidden mb-6 text-center">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50/80 px-3.5 py-1.5 rounded-full">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
              </span>
            </div>

            {/* Step 1: Services */}
            {currentStep === 1 && (
              <div className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Step 1</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 font-display">What do you need help with?</h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => { setSelectedService(service.id); setCurrentStep(2); }}
                      className={`text-left p-5 rounded-xl border transition-all duration-300 group cursor-pointer
                        ${selectedService === service.id
                          ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600"
                          : "border-slate-200 hover:border-blue-300 hover:shadow-md bg-white"}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors
                        ${selectedService === service.id ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"}`}>
                        <service.icon className="w-5 h-5" />
                      </div>
                      <h3 className={`font-bold text-sm mb-1 ${selectedService === service.id ? "text-blue-700" : "text-slate-800"}`}>
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{service.shortDesc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Doctor */}
            {currentStep === 2 && (
              <div className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Step 2</p>
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 font-display">Choose a Specialist</h2>
                    <p className="text-sm text-slate-500 mt-2">Select a doctor or skip to let us assign the best available specialist.</p>
                  </div>
                  {selectedService && (
                    <div className="inline-flex items-baseline gap-1.5 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-lg shrink-0 w-max sm:mt-6">
                      <span className="text-sm font-medium text-slate-600">Service Type :</span>
                      <span className="text-sm font-bold text-blue-700">
                        {displayedServices.find(s => s.id === selectedService || s.slug === selectedService)?.name || selectedService}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {displayedDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => { setSelectedDoctor(doctor.id); setCurrentStep(3); }}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 group flex gap-4 items-center cursor-pointer
                        ${selectedDoctor === doctor.id
                          ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600"
                          : "border-slate-200 hover:border-blue-300 hover:shadow-md bg-white"}`}
                    >
                      <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                      <div className="flex-grow">
                        <h3 className={`font-bold text-base ${selectedDoctor === doctor.id ? "text-blue-700" : "text-slate-800"}`}>
                          {doctor.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{doctor.specialization}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${selectedDoctor === doctor.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 group-hover:border-blue-400"}`}>
                        {selectedDoctor === doctor.id && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {currentStep === 3 && (
              <div className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Step 3</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 font-display">Pick a Date & Time</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-3">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-sm font-medium transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-3">Available Times</label>
                    {!selectedDate ? (
                      <div className="h-[200px] rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-medium">
                        Please select a date first
                      </div>
                    ) : displayedSlots.length === 0 ? (
                      <div className="h-[200px] rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-500 text-sm font-medium p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                        No available slots found for this date. The clinic or doctor may be fully booked or closed on this day.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {displayedSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-3 px-2 rounded-lg text-xs font-bold transition-all border cursor-pointer shadow-sm
                              ${selectedTime === slot
                                ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600/20"
                                : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600"}`}
                          >
                            {formatTime12Hour(slot)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Patient Details */}
            {currentStep === 4 && (
              <div className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Step 4</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 font-display">Your Details</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">First Name *</label>
                    <input type="text" name="firstName" value={patientData.firstName} onChange={handleInputChange} className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-sm transition-all" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Last Name *</label>
                    <input type="text" name="lastName" value={patientData.lastName} onChange={handleInputChange} className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-sm transition-all" placeholder="Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address *</label>
                    <input type="email" name="email" value={patientData.email} onChange={handleInputChange} className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-sm transition-all" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                    <input type="tel" name="phone" value={patientData.phone} onChange={handleInputChange} className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-sm transition-all" placeholder="083746 21025" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">What is the reason for your visit? (Optional)</label>
                    <textarea name="chiefComplaint" value={patientData.chiefComplaint} onChange={handleInputChange} rows={3} className="w-full p-4 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-sm transition-all resize-none" placeholder="Describe your symptoms or what you'd like to discuss..."></textarea>
                  </div>

                  <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setPatientData(prev => ({ ...prev, isFirstVisit: !prev.isFirstVisit }))}>
                      <input type="checkbox" name="isFirstVisit" checked={patientData.isFirstVisit} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-600 cursor-pointer" />
                      <span className="text-sm font-medium text-slate-800">I am a new patient</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setPatientData(prev => ({ ...prev, hasInsurance: !prev.hasInsurance }))}>
                      <input type="checkbox" name="hasInsurance" checked={patientData.hasInsurance} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-600 cursor-pointer" />
                      <span className="text-sm font-medium text-slate-800">I have dental insurance</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirm */}
            {currentStep === 5 && (
              <div className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Step 5</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 font-display">Review & Confirm</h2>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-start pb-5 border-b border-slate-200">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          {selectedServiceObj?.icon ? <selectedServiceObj.icon className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service</p>
                          <p className="font-bold text-slate-900">{selectedServiceObj?.name}</p>
                        </div>
                      </div>
                      <button onClick={() => setCurrentStep(1)} className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">Edit</button>
                    </div>

                    <div className="flex justify-between items-start pb-5 border-b border-slate-200">
                      <div className="flex gap-4">
                        <img src={selectedDoctorObj?.image} alt="Doctor" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Doctor</p>
                          <p className="font-bold text-slate-900">{selectedDoctorObj?.name}</p>
                          <p className="text-xs text-slate-500">{selectedDoctorObj?.specialization}</p>
                        </div>
                      </div>
                      <button onClick={() => setCurrentStep(2)} className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">Edit</button>
                    </div>

                    <div className="flex justify-between items-start pb-5 border-b border-slate-200">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-700">
                          <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date & Time</p>
                          <p className="font-bold text-slate-900">{selectedDate}</p>
                          <p className="text-sm font-semibold text-blue-600">{selectedTime ? formatTime12Hour(selectedTime) : ""}</p>
                        </div>
                      </div>
                      <button onClick={() => setCurrentStep(3)} className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">Edit</button>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-700">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient Info</p>
                          <p className="font-bold text-slate-900">{patientData.firstName} {patientData.lastName}</p>
                          <p className="text-xs font-medium text-slate-600">{patientData.phone}</p>
                          <p className="text-xs font-medium text-slate-600">{patientData.email}</p>
                        </div>
                      </div>
                      <button onClick={() => setCurrentStep(4)} className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">Edit</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              {errorMsg && (
                <div className="mb-4 p-4 bg-red-50/80 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1 || isSubmitting}
                  className="text-slate-500 hover:text-slate-900 h-11 px-4 rounded-lg font-medium cursor-pointer"
                >
                  {currentStep > 1 && <ArrowLeft className="w-4 h-4 mr-2" />} Back
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg px-8 h-11 text-sm font-bold shadow-sm cursor-pointer"
                    onClick={() => {
                      if (currentStep === 1 && !selectedService) return;
                      if (currentStep === 2 && !selectedDoctor) return;
                      if (currentStep === 3 && (!selectedDate || !selectedTime)) return;
                      if (currentStep === 4 && (!patientData.firstName || !patientData.lastName || !patientData.email || !patientData.phone)) return;
                      setCurrentStep(prev => prev + 1);
                    }}
                    disabled={
                      (currentStep === 1 && !selectedService) ||
                      (currentStep === 2 && !selectedDoctor) ||
                      (currentStep === 3 && (!selectedDate || !selectedTime)) ||
                      (currentStep === 4 && (!patientData.firstName || !patientData.lastName || !patientData.email || !patientData.phone))
                    }
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-lg px-8 h-11 text-white text-sm font-bold shadow-md cursor-pointer"
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Confirm Booking <Check className="w-4 h-4 ml-2" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
