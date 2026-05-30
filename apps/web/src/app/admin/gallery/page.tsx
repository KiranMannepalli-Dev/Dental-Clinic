"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Image as ImageIcon, Plus, Edit2, Trash2, Check, X,
  Save, Eye, EyeOff, ArrowLeftRight
} from "lucide-react";


interface GalleryImage {
  id: string;
  url: string;
  thumbUrl: string;
  caption?: string;
  category: string; // clinic, team, operations, events
  altText: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

interface BeforeAfterImage {
  id: string;
  serviceId: string;
  beforeUrl: string;
  afterUrl: string;
  caption?: string;
  patientNote?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  service?: {
    name: string;
  };
}

interface Service {
  id: string;
  name: string;
}

export default function GalleryAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'static' | 'transformations'>('static');
  
  // Static Gallery States
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Static Gallery Form Fields
  const [url, setUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("clinic");
  const [altText, setAltText] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  // Before/After Transformations States
  const [transformations, setTransformations] = useState<BeforeAfterImage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isBaModalOpen, setIsBaModalOpen] = useState(false);
  const [baModalMode, setBaModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBaId, setSelectedBaId] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState("all");

  // Before/After Form Fields
  const [baServiceId, setBaServiceId] = useState("");
  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");
  const [baCaption, setBaCaption] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [baSortOrder, setBaSortOrder] = useState(0);
  const [baIsPublished, setBaIsPublished] = useState(true);
  
  // Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  // Fetch Static Images
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/admin/gallery`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setImages(data.data || []);
    } catch (err) {
      console.error("Error fetching gallery images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Transformations
  const fetchTransformations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const res = await fetch(`${API_URL}/admin/before-after`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();
      setTransformations(data.data || []);
    } catch (err) {
      console.error("Error fetching transformations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Services
  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const res = await fetch(`${API_URL}/admin/services`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();
      setServices(data.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    fetchServices();
    if (activeTab === 'static') {
      fetchImages();
    } else {
      fetchTransformations();
    }
  }, [activeTab, router]);

  // Reset Static Form
  const resetForm = () => {
    setUrl("");
    setThumbUrl("");
    setCaption("");
    setCategory("clinic");
    setAltText("");
    setSortOrder(0);
    setIsPublished(true);
    setSelectedImageId(null);
  };

  // Reset Before/After Form
  const resetBaForm = () => {
    setBaServiceId(services[0]?.id || "");
    setBeforeUrl("");
    setAfterUrl("");
    setBaCaption("");
    setPatientNote("");
    setBaSortOrder(0);
    setBaIsPublished(true);
    setSelectedBaId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (img: GalleryImage) => {
    resetForm();
    setModalMode('edit');
    setSelectedImageId(img.id);

    setUrl(img.url);
    setThumbUrl(img.thumbUrl || "");
    setCaption(img.caption || "");
    setCategory(img.category);
    setAltText(img.altText);
    setSortOrder(img.sortOrder);
    setIsPublished(img.isPublished);

    setIsModalOpen(true);
  };

  const handleOpenBaCreateModal = () => {
    resetBaForm();
    setBaModalMode('create');
    setIsBaModalOpen(true);
  };

  const handleOpenBaEditModal = (ba: BeforeAfterImage) => {
    resetBaForm();
    setBaModalMode('edit');
    setSelectedBaId(ba.id);

    setBaServiceId(ba.serviceId);
    setBeforeUrl(ba.beforeUrl);
    setAfterUrl(ba.afterUrl);
    setBaCaption(ba.caption || "");
    setPatientNote(ba.patientNote || "");
    setBaSortOrder(ba.sortOrder);
    setBaIsPublished(ba.isPublished);

    setIsBaModalOpen(true);
  };

  // Handle image upload from API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'static' | 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMsg({ type: 'error', text: "File is too large. Max size is 5MB." });
      return;
    }

    if (target === 'static') setUploadingImage(true);
    else if (target === 'before') setUploadingBefore(true);
    else if (target === 'after') setUploadingAfter(true);

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
        if (target === 'static') {
          setUrl(data.url);
          setAltText(file.name.split('.')[0].replace(/[-_]/g, ' '));
        }
        else if (target === 'before') setBeforeUrl(data.url);
        else if (target === 'after') setAfterUrl(data.url);
        
        setFeedbackMsg({ type: 'success', text: "File uploaded successfully!" });
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Upload failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during upload." });
    } finally {
      if (target === 'static') setUploadingImage(false);
      else if (target === 'before') setUploadingBefore(false);
      else if (target === 'after') setUploadingAfter(false);
    }
  };

  // Submit Static Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      
      const payload = {
        url,
        thumbUrl: thumbUrl || url,
        caption: caption || null,
        category,
        altText,
        sortOrder,
        isPublished
      };

      const urlPath = modalMode === 'create'
        ? `${API_URL}/admin/gallery`
        : `${API_URL}/admin/gallery/${selectedImageId}`;
      
      const method = modalMode === 'create' ? "POST" : "PUT";

      const res = await fetch(urlPath, {
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
          text: `Gallery item successfully ${modalMode === 'create' ? 'created' : 'updated'}!`
        });
        setIsModalOpen(false);
        fetchImages();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to save gallery item" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  // Submit Before/After Form
  const handleBaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!baServiceId) {
      setFeedbackMsg({ type: 'error', text: "Please select an associated service." });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      
      const payload = {
        serviceId: baServiceId,
        beforeUrl,
        afterUrl,
        caption: baCaption || null,
        patientNote: patientNote || null,
        sortOrder: baSortOrder,
        isPublished: baIsPublished
      };

      const urlPath = baModalMode === 'create'
        ? `${API_URL}/admin/before-after`
        : `${API_URL}/admin/before-after/${selectedBaId}`;
      
      const method = baModalMode === 'create' ? "POST" : "PUT";

      const res = await fetch(urlPath, {
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
          text: `Transformation successfully ${baModalMode === 'create' ? 'created' : 'updated'}!`
        });
        setIsBaModalOpen(false);
        fetchTransformations();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to save transformation" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  // Toggle Visibility Status - Static
  const handleTogglePublish = async (img: GalleryImage) => {
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/gallery/${img.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !img.isPublished })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Image visibility updated!` });
        fetchImages();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to toggle visibility status" });
    }
  };

  // Toggle Visibility Status - Before/After
  const handleToggleBaPublish = async (ba: BeforeAfterImage) => {
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/before-after/${ba.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !ba.isPublished })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Transformation visibility updated!` });
        fetchTransformations();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to toggle status" });
    }
  };

  // Delete Image - Static
  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image? This action is permanent.")) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/gallery/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Image deleted successfully.` });
        fetchImages();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Deletion failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during deletion." });
    }
  };

  // Delete Transformation
  const handleDeleteBa = async (id: string) => {
    if (!confirm("Are you sure you want to delete this before/after transformation? This action is permanent.")) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/before-after/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Transformation deleted successfully.` });
        fetchTransformations();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Deletion failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during deletion." });
    }
  };

  const filteredImages = categoryFilter === "all"
    ? images
    : images.filter(img => img.category === categoryFilter);

  const filteredTransformations = serviceFilter === "all"
    ? transformations
    : transformations.filter(ba => ba.serviceId === serviceFilter);

  return (
    <div className="space-y-6">
      {/* Tab Switcher Headers */}
      <div className="flex border-b border-slate-200 shrink-0">
        <button 
          onClick={() => { setActiveTab('static'); setFeedbackMsg(null); }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'static' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Static Gallery
        </button>
        <button 
          onClick={() => { setActiveTab('transformations'); setFeedbackMsg(null); }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'transformations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" /> Before & After transformations
        </button>
      </div>

      {/* Action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {activeTab === 'static' 
              ? "Configure clinic tour photos, machinery images, operations, events, and other static displays."
              : "Manage patient treatment results showing Before and After dental transformation cases."}
          </p>
        </div>
        <button 
          onClick={activeTab === 'static' ? handleOpenCreateModal : handleOpenBaCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-4 h-4" /> {activeTab === 'static' ? "Add Image" : "Add Case"}
        </button>
      </div>

      {/* Alerts */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' ? 'bg-green-50/80 backdrop-blur-sm text-green-800 border-green-200' : 'bg-red-50/80 backdrop-blur-sm text-red-800 border-red-200'
        }`}>
          <span className="font-medium">{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline cursor-pointer hover:text-slate-900">Dismiss</button>
        </div>
      )}

      {activeTab === 'static' ? (
        <>
          {/* Static Gallery Section */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
            {[
              { key: 'all', label: 'All Images' },
              { key: 'clinic', label: 'Clinic Tour' },
              { key: 'team', label: 'Our Team' },
              { key: 'operations', label: 'Dental Operations' },
              { key: 'events', label: 'Events & Programs' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setCategoryFilter(item.key)}
                className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  categoryFilter === item.key 
                    ? 'border-blue-600 text-blue-600 scale-102' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs italic">Loading gallery images...</div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60">
              No images uploaded in this category. Click "Add Image" to populate your gallery.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((img) => (
                <div key={img.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm flex flex-col group relative hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-video w-full bg-slate-100 relative overflow-hidden shrink-0 border-b border-slate-100">
                    <img 
                      src={img.url} 
                      alt={img.altText} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm text-white text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border border-slate-800">
                      {img.category}
                    </span>
                    <span className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-lg border border-blue-500 font-mono">
                      # {img.sortOrder}
                    </span>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between gap-3 bg-white/40">
                    <div>
                      <p className="text-xs text-slate-700 font-bold line-clamp-2">
                        {img.caption || <span className="italic text-slate-400 font-normal">No caption provided</span>}
                      </p>
                      <p className="text-[10px] text-slate-455 mt-1 font-mono font-medium">Alt: {img.altText}</p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-150/60 flex items-center justify-between">
                      <button 
                        onClick={() => handleTogglePublish(img)}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-colors duration-150 ${
                          img.isPublished ? 'text-green-700 hover:text-green-800' : 'text-slate-400 hover:text-slate-500'
                        }`}
                      >
                        {img.isPublished ? (
                          <><Eye className="w-3.5 h-3.5 text-green-600"/> Visible</>
                        ) : (
                          <><EyeOff className="w-3.5 h-3.5 text-slate-400"/> Hidden</>
                        )}
                      </button>

                      <div className="inline-flex gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/40">
                        <button 
                          onClick={() => handleOpenEditModal(img)}
                          className="p-1 text-slate-450 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit metadata"
                        >
                          <Edit2 className="w-3.5 h-3.5"/>
                        </button>
                        <button 
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-1 text-slate-450 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Image"
                        >
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Before/After Transformations Section */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
            <button
              onClick={() => setServiceFilter("all")}
              className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                serviceFilter === "all" 
                  ? 'border-blue-600 text-blue-600 scale-102' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              All Treatments
            </button>
            {services.map(srv => (
              <button
                key={srv.id}
                onClick={() => setServiceFilter(srv.id)}
                className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  serviceFilter === srv.id 
                    ? 'border-blue-600 text-blue-600 scale-102' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {srv.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs italic">Loading cases...</div>
          ) : filteredTransformations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60">
              No transformation cases recorded. Click "Add Case" to display before/after summaries.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTransformations.map((ba) => (
                <div key={ba.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm flex flex-col group relative hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  {/* Before / After side-by-side splits */}
                  <div className="flex aspect-video w-full bg-slate-100 relative overflow-hidden shrink-0 border-b border-slate-100">
                    <div className="w-1/2 h-full relative border-r border-slate-200">
                      <img src={ba.beforeUrl} alt="Before" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">Before</span>
                    </div>
                    <div className="w-1/2 h-full relative">
                      <img src={ba.afterUrl} alt="After" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 bg-blue-600/85 backdrop-blur-sm text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">After</span>
                    </div>
                    <span className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-lg border border-blue-500 font-mono">
                      # {ba.sortOrder}
                    </span>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between gap-3 bg-white/40">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-50 text-blue-750 text-[10px] font-bold border border-blue-150 mb-2">
                        {ba.service?.name}
                      </span>
                      <p className="text-xs text-slate-700 font-bold line-clamp-2 leading-relaxed">
                        {ba.caption || <span className="italic text-slate-400 font-normal">No caption provided</span>}
                      </p>
                      {ba.patientNote && (
                        <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 italic leading-relaxed">
                          Note: {ba.patientNote}
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-slate-150/60 flex items-center justify-between">
                      <button 
                        onClick={() => handleToggleBaPublish(ba)}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-colors duration-150 ${
                          ba.isPublished ? 'text-green-700 hover:text-green-800' : 'text-slate-400 hover:text-slate-500'
                        }`}
                      >
                        {ba.isPublished ? (
                          <><Eye className="w-3.5 h-3.5 text-green-600"/> Visible</>
                        ) : (
                          <><EyeOff className="w-3.5 h-3.5 text-slate-400"/> Hidden</>
                        )}
                      </button>

                      <div className="inline-flex gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/40">
                        <button 
                          onClick={() => handleOpenBaEditModal(ba)}
                          className="p-1 text-slate-450 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit Case"
                        >
                          <Edit2 className="w-3.5 h-3.5"/>
                        </button>
                        <button 
                          onClick={() => handleDeleteBa(ba.id)}
                          className="p-1 text-slate-455 hover:text-red-650 transition-colors cursor-pointer"
                          title="Delete Case"
                        >
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* STATIC ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-slate-200 w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'create' ? 'Add Gallery Image' : 'Edit Image Metadata'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Provide image details, category, and sorting preferences.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative">
                  {url ? (
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-350" />
                  )}
                </div>
                
                <div className="flex-grow space-y-2 text-center sm:text-left">
                  <label className="text-xs font-bold text-slate-700 block">Gallery Photo</label>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center">
                    <label className="px-3.5 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm active:scale-97 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      {uploadingImage ? "Uploading..." : "Upload Photo"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'static')} 
                        disabled={uploadingImage}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Max size 5MB (JPEG/PNG/WebP).
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Image Source URL <span className="text-red-555 font-bold">*</span></label>
                <input 
                  type="text" required placeholder="Upload image or enter direct URL" value={url} onChange={e => setUrl(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Thumbnail URL (Optional)</label>
                <input 
                  type="text" placeholder="Defaults to Source URL if left blank" value={thumbUrl} onChange={e => setThumbUrl(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Category <span className="text-red-555 font-bold">*</span></label>
                  <select 
                    value={category} onChange={e => setCategory(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="clinic">Clinic Tour</option>
                    <option value="team">Our Team</option>
                    <option value="operations">Dental Operations</option>
                    <option value="events">Events & Programs</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Sort Priority (Order index)</label>
                  <input 
                    type="number" min={0} value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Alt Text (Accessibility & SEO) <span className="text-red-555 font-bold">*</span></label>
                <input 
                  type="text" required placeholder="e.g. Clean root canal operatory suite" value={altText} onChange={e => setAltText(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Caption / Overlay Text</label>
                <textarea 
                  rows={2} placeholder="A short description of what this image shows..." value={caption} onChange={e => setCaption(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 resize-none" 
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer" 
                  />
                  <span className="text-sm font-semibold text-slate-700">Publish Immediately (Visible to visitors)</span>
                </label>
              </div>

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
                  <Save className="w-4 h-4" /> Save Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BEFORE / AFTER ADD / EDIT MODAL */}
      {isBaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-slate-200 w-full max-w-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {baModalMode === 'create' ? 'Add Transformation Case' : 'Edit Case Details'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Upload comparative tooth photos showing treatment progress.</p>
              </div>
              <button onClick={() => setIsBaModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBaSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Dental Treatment Service <span className="text-red-555 font-bold">*</span></label>
                <select 
                  value={baServiceId} onChange={e => setBaServiceId(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  required
                >
                  <option value="">Select Treatment</option>
                  {services.map(srv => (
                    <option key={srv.id} value={srv.id}>{srv.name}</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload Section - Before & After Pair */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Image Slot */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block text-center">Before Image <span className="text-red-555">*</span></span>
                  <div className="aspect-square w-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative rounded-lg">
                    {beforeUrl ? (
                      <img src={beforeUrl} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-350 italic">No Before Image</span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <label className="px-3 py-1 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-all shadow-sm active:scale-97">
                      {uploadingBefore ? "Uploading..." : "Upload Photo"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'before')} 
                        disabled={uploadingBefore}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* After Image Slot */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block text-center">After Image <span className="text-red-555">*</span></span>
                  <div className="aspect-square w-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative rounded-lg">
                    {afterUrl ? (
                      <img src={afterUrl} alt="After" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-350 italic">No After Image</span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <label className="px-3 py-1 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-all shadow-sm active:scale-97">
                      {uploadingAfter ? "Uploading..." : "Upload Photo"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'after')} 
                        disabled={uploadingAfter}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Before Image URL <span className="text-red-555 font-bold">*</span></label>
                  <input 
                    type="text" required placeholder="Direct URL or upload photo" value={beforeUrl} onChange={e => setBeforeUrl(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">After Image URL <span className="text-red-555 font-bold">*</span></label>
                  <input 
                    type="text" required placeholder="Direct URL or upload photo" value={afterUrl} onChange={e => setAfterUrl(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Sort Priority (Order index)</label>
                <input 
                  type="number" min={0} value={baSortOrder} onChange={e => setBaSortOrder(parseInt(e.target.value) || 0)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Case Caption / Treatment Goal <span className="text-red-555 font-bold">*</span></label>
                <input 
                  type="text" required placeholder="e.g. 6-Month teeth alignment using metal braces" value={baCaption} onChange={e => setBaCaption(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Clinical Patient Notes (Internal Observations)</label>
                <textarea 
                  rows={2} placeholder="Observations, patient starting condition, details of treatment plan..." value={patientNote} onChange={e => setPatientNote(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 resize-none" 
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" checked={baIsPublished} onChange={e => setBaIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer" 
                  />
                  <span className="text-sm font-semibold text-slate-700">Publish Immediately (Visible to visitors)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" onClick={() => setIsBaModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
