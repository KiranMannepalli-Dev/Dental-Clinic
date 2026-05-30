"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Plus, Edit2, Trash2, Check, X,
  Save, Eye, Calendar, User, Tag
} from "lucide-react";


interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImageUrl?: string;
  authorId: string;
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  readTimeMinutes: number;
  publishedAt?: string;
  createdAt: string;
  author?: {
    firstName: string;
    lastName: string;
  };
}

export default function BlogAdmin() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [category, setCategory] = useState("Oral Health");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/admin/blogs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setBlogs(data.data || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/public/doctors`);
      const data = await res.json();
      const list = data.data || [];
      setDoctors(list);
      if (list.length > 0 && !authorId) {
        setAuthorId(list[0].id);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchDoctors();
  }, [router]);

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setFeaturedImageUrl("");
    if (doctors.length > 0) {
      setAuthorId(doctors[0].id);
    } else {
      setAuthorId("");
    }
    setCategory("Oral Health");
    setTags("");
    setStatus('DRAFT');
    setReadTimeMinutes(5);
    setSelectedBlogId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (blog: Blog) => {
    resetForm();
    setModalMode('edit');
    setSelectedBlogId(blog.id);

    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setFeaturedImageUrl(blog.featuredImageUrl || "");
    setAuthorId(blog.authorId);
    setCategory(blog.category);
    setTags(blog.tags.join(", "));
    setStatus(blog.status);
    setReadTimeMinutes(blog.readTimeMinutes);

    setIsModalOpen(true);
  };

  // Submit Form (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

      const payload = {
        title,
        excerpt,
        content,
        featuredImageUrl: featuredImageUrl || null,
        authorId,
        category,
        tags: tagsArray,
        status,
        readTimeMinutes
      };

      const url = modalMode === 'create'
        ? `${API_URL}/admin/blogs`
        : `${API_URL}/admin/blogs/${selectedBlogId}`;
      
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
          text: `Article successfully ${modalMode === 'create' ? 'created' : 'updated'}!`
        });
        setIsModalOpen(false);
        fetchBlogs();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to save article" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  // Delete Blog Post
  const handleDeleteBlog = async (id: string, titleName: string) => {
    if (!confirm(`Are you sure you want to delete "${titleName}"? This action is permanent.`)) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/blogs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Article was deleted successfully.` });
        fetchBlogs();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Deletion failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during deletion." });
    }
  };

  const getStatusBadgeClass = (stat: string) => {
    switch (stat) {
      case 'PUBLISHED': return 'bg-green-50 text-green-700 border-green-200';
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'ARCHIVED': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Publish articles, clinical guides, dental news, and lifestyle tips for patients.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create Article
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

      {/* Blogs Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Article Info</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs italic">Loading articles...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs italic">No blog posts found. Click "Create Article" to write your first post.</td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                    {/* Title & Excerpt */}
                    <td className="p-4 max-w-xs md:max-w-md">
                      <p className="font-bold text-slate-900 text-sm line-clamp-1">{blog.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">{blog.excerpt}</p>
                    </td>

                    {/* Author */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-800 font-bold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dr. {blog.author?.firstName} {blog.author?.lastName}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200/50 text-[10px] font-bold uppercase text-slate-600">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {blog.category}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="p-4 text-xs text-slate-555">
                      <div className="flex flex-col gap-1 font-medium">
                        <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                        {blog.publishedAt && (
                          <span className="text-green-700 font-bold">Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusBadgeClass(blog.status)}`}>
                        {blog.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100/50">
                        <button 
                          onClick={() => handleOpenEditModal(blog)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={() => handleDeleteBlog(blog.id, blog.title)}
                          className="p-1.5 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Article"
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
          <div className="bg-white rounded-md border border-slate-200 w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'create' ? 'Draft New Article' : 'Edit Article'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Design clinical guides, news, and other announcements.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Article Title <span className="text-red-555 font-bold">*</span></label>
                <input 
                  type="text" required placeholder="e.g. 5 Simple Ways to Maintain Dental Hygiene at Home" value={title} onChange={e => setTitle(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Author (Specialist) <span className="text-red-555 font-bold">*</span></label>
                  <select 
                    value={authorId} onChange={e => setAuthorId(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Category <span className="text-red-555 font-bold">*</span></label>
                  <input 
                    type="text" required placeholder="e.g. Oral Health, Technology" value={category} onChange={e => setCategory(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Est. Read Time (Minutes)</label>
                  <input 
                    type="number" min={1} value={readTimeMinutes} onChange={e => setReadTimeMinutes(parseInt(e.target.value) || 5)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Featured Image URL</label>
                  <input 
                    type="text" placeholder="https://example.com/image.jpg" value={featuredImageUrl} onChange={e => setFeaturedImageUrl(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Tags (comma-separated)</label>
                  <input 
                    type="text" placeholder="hygiene, tips, prevention" value={tags} onChange={e => setTags(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Excerpt / Short Summary <span className="text-red-555 font-bold">*</span></label>
                <input 
                  type="text" required placeholder="A brief one-sentence hook for lists and SEO summaries" value={excerpt} onChange={e => setExcerpt(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Article Content (Supports HTML) <span className="text-red-555 font-bold">*</span></label>
                <textarea 
                  rows={8} required placeholder="Write the main body of your article here. You can use standard HTML formatting tags like <p>, <h2>, <ul>, etc." value={content} onChange={e => setContent(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-blue-500 leading-relaxed" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Publication Status</label>
                  <select 
                    value={status} onChange={e => setStatus(e.target.value as any)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published (Show on website)</option>
                    <option value="ARCHIVED">Archived (Hide from listings)</option>
                  </select>
                </div>
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
                  <Save className="w-4 h-4" /> Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
