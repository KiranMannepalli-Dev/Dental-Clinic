"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Plus, Edit2, Trash2, Calendar, Star, Check, X,
  Clock, Save, ShieldAlert, Award, FileText, CheckSquare, User2
} from "lucide-react";


interface Doctor {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  qualification: string;
  specialization: string;
  experience: number;
  consultationFee: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  languages: string[];
  bio?: string;
  availability?: any[];
  avatarUrl?: string;
}

export default function DoctorsAdmin() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'availability'>('profile');

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState(1);
  const [consultationFee, setConsultationFee] = useState(500);
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("English, Telugu, Hindi");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Availability schedule fields (for editing)
  const [schedule, setSchedule] = useState<any[]>([
    { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
    { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
    { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
    { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
    { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
    { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '13:00', slotMinutes: 30, isAvailable: true },
    { dayOfWeek: 'SUNDAY', startTime: '09:00', endTime: '13:00', slotMinutes: 30, isAvailable: false },
  ]);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/admin/doctors`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setDoctors(data.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [router]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setQualification("");
    setSpecialization("");
    setExperience(1);
    setConsultationFee(500);
    setBio("");
    setLanguages("English, Telugu, Hindi");
    setIsActive(true);
    setIsFeatured(false);
    setAvatarUrl("");
    setSchedule([
      { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
      { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
      { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
      { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
      { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', slotMinutes: 30, isAvailable: true },
      { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '13:00', slotMinutes: 30, isAvailable: true },
      { dayOfWeek: 'SUNDAY', startTime: '09:00', endTime: '13:00', slotMinutes: 30, isAvailable: false },
    ]);
    setSelectedDoctorId(null);
    setActiveTab('profile');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc: Doctor) => {
    resetForm();
    setModalMode('edit');
    setSelectedDoctorId(doc.id);
    
    // Fill profile fields
    setFirstName(doc.firstName);
    setLastName(doc.lastName);
    setEmail(doc.email);
    setPhone(doc.phone || "");
    setQualification(doc.qualification);
    setSpecialization(doc.specialization);
    setExperience(doc.experience);
    setConsultationFee(parseFloat(doc.consultationFee));
    setBio(doc.bio || "");
    setLanguages(doc.languages.join(", "));
    setIsActive(doc.isActive);
    setIsFeatured(doc.isFeatured);
    setAvatarUrl(doc.avatarUrl || "");
    
    // Fill availability fields
    if (doc.availability && doc.availability.length > 0) {
      const mergedSchedule = schedule.map(defaultDay => {
        const docDay = doc.availability?.find(d => d.dayOfWeek === defaultDay.dayOfWeek);
        return docDay ? { ...defaultDay, ...docDay } : defaultDay;
      });
      setSchedule(mergedSchedule);
    }
    
    setIsModalOpen(true);
  };

  // Submit Form (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const langArray = languages.split(",").map(l => l.trim()).filter(Boolean);
      
      const payload: any = {
        firstName,
        lastName,
        email,
        phone: phone || null,
        qualification,
        specialization,
        experience,
        consultationFee,
        bio: bio || null,
        languages: langArray,
        isActive,
        isFeatured,
        avatarUrl: avatarUrl || null,
      };

      if (modalMode === 'edit') {
        payload.availability = schedule;
      }

      const url = modalMode === 'create' 
        ? `${API_URL}/admin/doctors`
        : `${API_URL}/admin/doctors/${selectedDoctorId}`;
      
      const method = modalMode === 'create' ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Specialist successfully ${modalMode === 'create' ? 'registered' : 'updated'}!`
        });
        setIsModalOpen(false);
        fetchDoctors();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to save profile" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMsg({ type: 'error', text: "File is too large. Max size is 5MB." });
      return;
    }

    setUploadingImage(true);
    setFeedbackMsg(null);

    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/admin/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        setAvatarUrl(data.url);
        setFeedbackMsg({ type: 'success', text: "Photo uploaded successfully!" });
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Upload failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during upload." });
    } finally {
      setUploadingImage(false);
    }
  };

  // Toggle Doctor Active Status
  const handleToggleActive = async (doc: Doctor) => {
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/doctors/${doc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !doc.isActive })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Dr. ${doc.lastName} status changed!` });
        fetchDoctors();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to toggle status" });
    }
  };

  // Toggle Doctor Featured Status
  const handleToggleFeatured = async (doc: Doctor) => {
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/doctors/${doc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isFeatured: !doc.isFeatured })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Dr. ${doc.lastName} featured status changed!` });
        fetchDoctors();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to toggle featured status" });
    }
  };

  // Delete Specialist
  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Dr. ${name}? This action is permanent.`)) return;
    
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/doctors/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Dr. ${name} was deleted successfully.` });
        fetchDoctors();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Deletion failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during deletion." });
    }
  };

  // Update schedule array state
  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add, Edit, Delete, and Configure Working Schedules for Dental Specialists.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-all shadow-md shadow-blue-500/10 cursor-pointer hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Specialist
        </button>
      </div>

      {/* Alert Messaging */}
      {feedbackMsg && (
        <div className={`p-4 rounded-md border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' ? 'bg-green-50/80 dark:bg-emerald-950/20 backdrop-blur-sm text-green-800 dark:text-emerald-450 border-green-200 dark:border-emerald-900/30' : 'bg-red-50/80 dark:bg-red-955/20 backdrop-blur-sm text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
        }`}>
          <span className="font-semibold">{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-semibold underline cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">Dismiss</button>
        </div>
      )}

      {/* Table grid */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/85 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold tracking-wider">
                <th className="p-4">Specialist Details</th>
                <th className="p-4">Qualifications</th>
                <th className="p-4">Fee & Experience</th>
                <th className="p-4">Status Toggles</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-550 text-xs italic">Loading Specialists...</td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-550 text-xs italic">No Specialists Registered.</td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors duration-150">
                    {/* Details */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-605 dark:text-blue-400 flex items-center justify-center font-semibold text-sm shrink-0 border border-blue-150 dark:border-blue-900/40 overflow-hidden uppercase shadow-inner">
                          {doc.avatarUrl ? (
                            <img src={doc.avatarUrl} alt="Doctor" className="w-full h-full object-cover" />
                          ) : (
                            `${doc.firstName[0]}${doc.lastName[0]}`
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Dr. {doc.firstName} {doc.lastName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{doc.email} {doc.phone && `• ${doc.phone}`}</p>
                        </div>
                      </div>
                    </td>

                    {/* Qualifications */}
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{doc.specialization}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{doc.qualification}</p>
                    </td>

                    {/* Fee & Experience */}
                    <td className="p-4">
                      <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold">₹{parseFloat(doc.consultationFee).toLocaleString()}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{doc.experience} Years Experience</p>
                    </td>

                    {/* Toggles */}
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {/* Active toggle */}
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={doc.isActive} 
                            onChange={() => handleToggleActive(doc)}
                            className="w-4 h-4 rounded border-slate-355 dark:border-slate-700 text-blue-600 focus:ring-blue-550/30 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${doc.isActive ? 'text-green-700 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {doc.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                        {/* Featured toggle */}
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={doc.isFeatured} 
                            onChange={() => handleToggleFeatured(doc)}
                            className="w-4 h-4 rounded border-slate-355 dark:border-slate-700 text-yellow-500 focus:ring-yellow-500/30 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${doc.isFeatured ? 'text-yellow-750 dark:text-yellow-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {doc.isFeatured ? '★ Featured' : 'Standard'}
                          </span>
                        </label>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{doc.rating.toFixed(1)}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">({doc.reviewCount})</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1 bg-slate-50/80 dark:bg-slate-950/80 p-1.5 rounded-md border border-slate-100/50 dark:border-slate-850">
                        <button 
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-955/30 rounded-md transition-colors cursor-pointer"
                          title="Edit Specialist"
                        >
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={() => handleDeleteDoctor(doc.id, `${doc.firstName} ${doc.lastName}`)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/30 rounded-md transition-colors cursor-pointer"
                          title="Delete Specialist"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-955/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {modalMode === 'create' ? 'Register New Specialist' : 'Edit Specialist Profile'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Configure Profile Details, Specialties, and Working Schedules.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-450 hover:text-slate-650 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Sub-Tabs (Edit mode only) */}
            {modalMode === 'edit' && (
              <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0 px-6 bg-slate-50/30 dark:bg-slate-955/30 gap-1 p-1">
                <button 
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-4 text-xs font-semibold rounded-md border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'profile' 
                      ? 'bg-white dark:bg-slate-800 text-blue-650 dark:text-blue-400 border-slate-200/50 dark:border-slate-700 shadow-sm' 
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
                  }`}
                >
                  <Award className="w-4 h-4" /> Profile Info
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('availability')}
                  className={`py-2 px-4 text-xs font-semibold rounded-md border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'availability' 
                      ? 'bg-white dark:bg-slate-800 text-blue-650 dark:text-blue-400 border-slate-200/50 dark:border-slate-700 shadow-sm' 
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-855 dark:hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-4 h-4" /> Working Schedule
                </button>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              
              {/* TAB 1: Profile Info */}
              {(modalMode === 'create' || activeTab === 'profile') && (
                <div className="space-y-4">
                  {/* Photo Upload Section */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User2 className="w-8 h-8 text-slate-355 dark:text-slate-600" />
                      )}
                    </div>
                    
                    <div className="flex-grow space-y-2 text-center sm:text-left">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Specialist Photo</label>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center">
                        <label className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md cursor-pointer transition-all shadow-sm flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          {uploadingImage ? "Uploading..." : "Upload Photo"}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            disabled={uploadingImage}
                            className="hidden" 
                          />
                        </label>
                        {avatarUrl && (
                          <button 
                            type="button" 
                            onClick={() => setAvatarUrl("")}
                            className="px-3.5 py-1.5 bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-955/40 text-xs font-semibold rounded-md cursor-pointer transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        Recommended: Square aspect ratio (1:1), size 400x400 pixels (max 5MB, JPEG/PNG/WebP).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">First Name <span className="text-red-555 font-bold">*</span></label>
                      <input 
                        type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                        className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Last Name <span className="text-red-555 font-bold">*</span></label>
                      <input 
                        type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                        className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address <span className="text-red-555 font-bold">*</span></label>
                      <input 
                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Contact Number</label>
                      <input 
                        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Qualifications <span className="text-red-555 font-bold">*</span></label>
                      <input 
                        type="text" required placeholder="e.g. BDS, MDS (Orthodontics)" value={qualification} onChange={e => setQualification(e.target.value)}
                        className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Specialization <span className="text-red-555 font-bold">*</span></label>
                      <input 
                        type="text" required placeholder="e.g. Endodontist, Orthodontist" value={specialization} onChange={e => setSpecialization(e.target.value)}
                        className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Years of Experience <span className="text-red-555 font-bold">*</span></label>
                      <input 
                        type="number" required min={0} value={experience} onChange={e => setExperience(parseInt(e.target.value) || 0)}
                        className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Consultation Fee (₹) <span className="text-red-555 font-bold">*</span></label>
                      <input 
                        type="number" required min={0} value={consultationFee} onChange={e => setConsultationFee(parseFloat(e.target.value) || 0)}
                        className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Languages Spoken (comma-separated)</label>
                    <input 
                      type="text" value={languages} onChange={e => setLanguages(e.target.value)}
                      className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Bio / Professional Summary</label>
                    <textarea 
                      rows={3} value={bio} onChange={e => setBio(e.target.value)}
                      className="py-2 px-3 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:border-blue-550 resize-none" 
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-305 dark:border-slate-700 cursor-pointer" 
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mark Profile as Active</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-yellow-500 border-slate-305 dark:border-slate-700 cursor-pointer" 
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">★ Feature on Homepage</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: Availability timing configuration (only in edit mode) */}
              {modalMode === 'edit' && activeTab === 'availability' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-955/20 text-amber-805 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30 rounded-md text-xs leading-relaxed flex gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span>Seeding or updating hours here directly updates the selectable slots on the appointment booking page. Deselected days will show as unavailable.</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {schedule.map((item, idx) => (
                      <div key={item.dayOfWeek} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Day & Toggle */}
                        <div className="w-32 flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={item.isAvailable} 
                            onChange={e => handleScheduleChange(idx, 'isAvailable', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold tracking-wider ${item.isAvailable ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-550'}`}>
                            {item.dayOfWeek}
                          </span>
                        </div>

                        {/* Timing selectors */}
                        {item.isAvailable ? (
                          <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">From</span>
                              <input 
                                type="text" placeholder="09:00" value={item.startTime} onChange={e => handleScheduleChange(idx, 'startTime', e.target.value)}
                                className="py-1 px-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs w-20 text-center focus:outline-none" 
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">To</span>
                              <input 
                                type="text" placeholder="17:00" value={item.endTime} onChange={e => handleScheduleChange(idx, 'endTime', e.target.value)}
                                className="py-1 px-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs w-20 text-center focus:outline-none" 
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400 dark:text-slate-550 font-medium">Slot Minutes</span>
                              <input 
                                type="number" min={10} max={120} value={item.slotMinutes} onChange={e => handleScheduleChange(idx, 'slotMinutes', parseInt(e.target.value) || 30)}
                                className="py-1 px-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs w-16 text-center focus:outline-none" 
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic font-medium">Off-duty / Unavailable</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
