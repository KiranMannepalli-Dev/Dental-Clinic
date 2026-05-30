"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, Plus, Edit2, Trash2, Check, X,
  Save, DollarSign, Clock, ShieldAlert, Award
} from "lucide-react";


interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: 'COSMETIC' | 'ORTHODONTICS' | 'PEDIATRIC' | 'ORAL_SURGERY' | 'PREVENTIVE' | 'EMERGENCY' | 'IMPLANTS' | 'GENERAL';
  duration: number;
  priceMin?: string;
  priceMax?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  recoveryTime?: string;
  iconName?: string;
  imageUrl?: string;
}

export default function ServicesAdmin() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [category, setCategory] = useState<'COSMETIC' | 'ORTHODONTICS' | 'PEDIATRIC' | 'ORAL_SURGERY' | 'PREVENTIVE' | 'EMERGENCY' | 'IMPLANTS' | 'GENERAL'>('GENERAL');
  const [duration, setDuration] = useState(30);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [recoveryTime, setRecoveryTime] = useState("");
  const [iconName, setIconName] = useState("Activity");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/admin/services`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setServices(data.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [router]);

  const resetForm = () => {
    setName("");
    setShortDescription("");
    setFullDescription("");
    setCategory('GENERAL');
    setDuration(30);
    setPriceMin("");
    setPriceMax("");
    setIsActive(true);
    setIsFeatured(false);
    setSortOrder(0);
    setRecoveryTime("");
    setIconName("Activity");
    setImageUrl("");
    setUploadingImage(false);
    setSelectedServiceId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (srv: Service) => {
    resetForm();
    setModalMode('edit');
    setSelectedServiceId(srv.id);

    setName(srv.name);
    setShortDescription(srv.shortDescription);
    setFullDescription(srv.fullDescription);
    setCategory(srv.category);
    setDuration(srv.duration);
    setPriceMin(srv.priceMin ? parseFloat(srv.priceMin).toString() : "");
    setPriceMax(srv.priceMax ? parseFloat(srv.priceMax).toString() : "");
    setIsActive(srv.isActive);
    setIsFeatured(srv.isFeatured);
    setSortOrder(srv.sortOrder);
    setRecoveryTime(srv.recoveryTime || "");
    setIconName(srv.iconName || "Activity");
    setImageUrl(srv.imageUrl || "");
    setIsModalOpen(true);
  };

  // Submit Form (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      
      const payload = {
        name,
        shortDescription,
        fullDescription,
        category,
        duration,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        isActive,
        isFeatured,
        sortOrder,
        recoveryTime: recoveryTime || null,
        iconName: iconName || "Activity",
        imageUrl: imageUrl || null
      };

      const url = modalMode === 'create'
        ? `${API_URL}/admin/services`
        : `${API_URL}/admin/services/${selectedServiceId}`;
      
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
          text: `Service successfully ${modalMode === 'create' ? 'created' : 'updated'}!`
        });
        setIsModalOpen(false);
        fetchServices();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to save service" });
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
        setImageUrl(data.url);
        setFeedbackMsg({ type: 'success', text: "Service image uploaded successfully!" });
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Upload failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during upload." });
    } finally {
      setUploadingImage(false);
    }
  };

  // Toggle Service Active Status
  const handleToggleActive = async (srv: Service) => {
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/services/${srv.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !srv.isActive })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Service status updated!` });
        fetchServices();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to toggle status" });
    }
  };

  // Toggle Service Featured Status
  const handleToggleFeatured = async (srv: Service) => {
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/services/${srv.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isFeatured: !srv.isFeatured })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Service featured status updated!` });
        fetchServices();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to toggle featured status" });
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove it from search systems.`)) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/services/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Service ${name} was deleted successfully.` });
        fetchServices();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Deletion failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during deletion." });
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'PREVENTIVE': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'ORTHODONTICS': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'COSMETIC': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'EMERGENCY': return 'bg-red-50 text-red-700 border-red-200';
      case 'IMPLANTS': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ORAL_SURGERY': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Configure dental services, pricing tiers, descriptions, categories, and ordering.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Alert Messaging */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' ? 'bg-green-50/80 backdrop-blur-sm text-green-800 border-green-200' : 'bg-red-50/80 backdrop-blur-sm text-red-800 border-red-200'
        }`}>
          <span className="font-medium">{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline cursor-pointer hover:text-slate-900">Dismiss</button>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4 w-16">Sort</th>
                <th className="p-4">Service Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Duration & Pricing</th>
                <th className="p-4">Status Toggles</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs italic">Loading services...</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs italic">No services configured in DB.</td>
                </tr>
              ) : (
                services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                    {/* Sort Order */}
                    <td className="p-4 text-slate-500 font-mono text-sm font-semibold">
                      {srv.sortOrder}
                    </td>

                    {/* Service Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 overflow-hidden shadow-inner">
                          {srv.imageUrl ? (
                            <img src={srv.imageUrl} alt="Service" className="w-full h-full object-cover" />
                          ) : (
                            <Settings className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{srv.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">{srv.shortDescription}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(srv.category)}`}>
                        {srv.category}
                      </span>
                    </td>

                    {/* Duration & Pricing */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-slate-850 font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{srv.duration} mins</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-semibold">
                        {srv.priceMin ? (
                          <span>₹{parseFloat(srv.priceMin).toLocaleString()}{srv.priceMax && ` - ₹${parseFloat(srv.priceMax).toLocaleString()}`}</span>
                        ) : (
                          <span className="italic text-slate-400">Request Quote</span>
                        )}
                      </div>
                    </td>

                    {/* Status Toggles */}
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {/* Active toggle */}
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={srv.isActive} 
                            onChange={() => handleToggleActive(srv)}
                            className="w-4 h-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${srv.isActive ? 'text-green-700' : 'text-slate-400'}`}>
                            {srv.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                        {/* Featured toggle */}
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={srv.isFeatured} 
                            onChange={() => handleToggleFeatured(srv)}
                            className="w-4 h-4 rounded border-slate-350 text-yellow-500 focus:ring-yellow-500/30 cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${srv.isFeatured ? 'text-yellow-700' : 'text-slate-400'}`}>
                            {srv.isFeatured ? '★ Featured' : 'Standard'}
                          </span>
                        </label>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100/50">
                        <button 
                          onClick={() => handleOpenEditModal(srv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={() => handleDeleteService(srv.id, srv.name)}
                          className="p-1.5 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Service"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-slate-200 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'create' ? 'Add New Treatment Service' : 'Edit Treatment Service'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Configure pricing tier, description, recovery periods, and availability features.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              
              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Settings className="w-8 h-8 text-slate-350" />
                  )}
                </div>
                
                <div className="flex-grow space-y-2 text-center sm:text-left">
                  <label className="text-xs font-bold text-slate-700 block">Service Photo / Banner</label>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center">
                    <label className="px-3.5 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm active:scale-97 flex items-center gap-1.5">
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
                    {imageUrl && (
                      <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-97"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Recommended: Square aspect ratio (1:1), size 400x400 pixels (max 5MB, JPEG/PNG/WebP).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Service Name <span className="text-red-555 font-bold">*</span></label>
                  <input 
                    type="text" required placeholder="e.g. Laser Teeth Whitening" value={name} onChange={e => setName(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Category <span className="text-red-555 font-bold">*</span></label>
                  <select 
                    value={category} onChange={e => setCategory(e.target.value as any)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="GENERAL">General Dentistry</option>
                    <option value="COSMETIC">Cosmetic Dentistry</option>
                    <option value="ORTHODONTICS">Orthodontics</option>
                    <option value="PEDIATRIC">Pediatric Dentistry</option>
                    <option value="ORAL_SURGERY">Oral Surgery</option>
                    <option value="PREVENTIVE">Preventive Dentistry</option>
                    <option value="EMERGENCY">Emergency Dentistry</option>
                    <option value="IMPLANTS">Implants</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Icon Class Name (Lucide Icon)</label>
                  <input 
                    type="text" placeholder="e.g. Activity, Shield, Heart" value={iconName} onChange={e => setIconName(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Duration (Minutes) <span className="text-red-555 font-bold">*</span></label>
                  <input 
                    type="number" required min={5} max={480} value={duration} onChange={e => setDuration(parseInt(e.target.value) || 30)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Min Price (₹)</label>
                  <input 
                    type="number" min={0} placeholder="e.g. 1500" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Max Price (₹)</label>
                  <input 
                    type="number" min={0} placeholder="e.g. 5000" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Sort Priority (Order index)</label>
                  <input 
                    type="number" min={0} value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Recovery Time (Summary)</label>
                  <input 
                    type="text" placeholder="e.g. Immediate, 1-2 days" value={recoveryTime} onChange={e => setRecoveryTime(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Short Description (Card layout summary) <span className="text-red-555 font-bold">*</span></label>
                <input 
                  type="text" required placeholder="A brief 1-2 sentence overview for listings" value={shortDescription} onChange={e => setShortDescription(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Full Description (Comprehensive text for detail pages) <span className="text-red-555 font-bold">*</span></label>
                <textarea 
                  rows={4} required placeholder="Detailed information detailing procedures, benefits, and specifications..." value={fullDescription} onChange={e => setFullDescription(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer" 
                  />
                  <span className="text-sm font-semibold text-slate-700">Mark Service as Active</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-yellow-500 border-slate-300 cursor-pointer" 
                  />
                  <span className="text-sm font-semibold text-slate-700">★ Highlight as Featured</span>
                </label>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
