"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Image as ImageIcon, Plus, Edit2, Trash2, Check, X,
  Save, Eye, EyeOff, LayoutGrid, ListFilter
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

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

export default function GalleryAdmin() {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form Fields
  const [url, setUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("clinic");
  const [altText, setAltText] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

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

  useEffect(() => {
    fetchImages();
  }, [router]);

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

  // Submit Form (Create / Edit)
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

  // Toggle Visibility Status
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

  // Delete Image
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

  const filteredImages = categoryFilter === "all"
    ? images
    : images.filter(img => img.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Configure clinic tour photos, machinery images, operations, events, and other static displays.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {/* Alerts */}
      {feedbackMsg && (
        <div className={`p-4 rounded-md border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Filter Options */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
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
            className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
              categoryFilter === item.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading gallery images...</div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm bg-white rounded border border-slate-200">
          No images uploaded in this category. Click "Add Image" to populate your gallery.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <div key={img.id} className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm flex flex-col group relative">
              
              {/* Image Preview Box */}
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden shrink-0 border-b border-slate-100">
                <img 
                  src={img.url} 
                  alt={img.altText} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                />
                
                {/* Category overlay */}
                <span className="absolute top-2 left-2 bg-slate-900/75 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-slate-800">
                  {img.category}
                </span>

                {/* Priority Badge */}
                <span className="absolute top-2 right-2 bg-blue-600/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500 font-mono">
                  # {img.sortOrder}
                </span>
              </div>

              {/* Description Panel */}
              <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-700 font-medium line-clamp-2">
                    {img.caption || <span className="italic text-slate-400">No caption provided</span>}
                  </p>
                  <p className="text-[10px] text-slate-450 mt-1 font-mono">Alt: {img.altText}</p>
                </div>

                {/* Foot Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {/* Publish checkbox toggle */}
                  <button 
                    onClick={() => handleTogglePublish(img)}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                      img.isPublished ? 'text-green-700' : 'text-slate-400'
                    }`}
                  >
                    {img.isPublished ? (
                      <><Eye className="w-3.5 h-3.5"/> Visible</>
                    ) : (
                      <><EyeOff className="w-3.5 h-3.5"/> Hidden</>
                    )}
                  </button>

                  {/* Actions buttons */}
                  <div className="inline-flex gap-1.5">
                    <button 
                      onClick={() => handleOpenEditModal(img)}
                      className="p-1 text-slate-450 hover:text-blue-600 cursor-pointer"
                      title="Edit metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5"/>
                    </button>
                    <button 
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1 text-slate-450 hover:text-red-600 cursor-pointer"
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-slate-200 w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'create' ? 'Add Gallery Image' : 'Edit Image Metadata'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Provide image URLs, categorization tags, and details.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Image Source URL <span className="text-red-555 font-bold">*</span></label>
                <input 
                  type="text" required placeholder="https://example.com/gallery/clinic-tour-1.jpg" value={url} onChange={e => setUrl(e.target.value)}
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
                    className="py-2 px-3 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
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
                <label className="text-xs font-semibold text-slate-600">Alt Text (For accessibility & SEO) <span className="text-red-555 font-bold">*</span></label>
                <input 
                  type="text" required placeholder="e.g. Clean and modern root canal operation theatre" value={altText} onChange={e => setAltText(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Caption / Overlay Text</label>
                <textarea 
                  rows={2} placeholder="A short description of what this image shows..." value={caption} onChange={e => setCaption(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
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
                  <Save className="w-4 h-4" /> Save Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
