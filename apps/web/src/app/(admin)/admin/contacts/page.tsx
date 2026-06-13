"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, Phone, Clock, Check, Trash2, X, Eye, 
  Save, Filter, User, AlertCircle, CheckCircle, HelpCircle
} from "lucide-react";


interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  notes?: string;
  createdAt: string;
}

export default function ContactsAdmin() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filter selection
  const [tabFilter, setTabFilter] = useState<'all' | 'unread' | 'unresolved' | 'resolved'>('all');

  // Detail Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/admin/contacts`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setSubmissions(data.data || []);
    } catch (err) {
      console.error("Error fetching contact leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [router]);

  // Open Details Modal and mark as read automatically
  const handleOpenDetails = async (lead: ContactSubmission) => {
    setSelectedLead(lead);
    setAdminNotes(lead.notes || "");
    setIsModalOpen(true);

    if (!lead.isRead) {
      // Automatically call API to mark as read
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`${API_URL}/admin/contacts/${lead.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ isRead: true })
        });
        // Update local list silently
        setSubmissions(subs => subs.map(s => s.id === lead.id ? { ...s, isRead: true } : s));
      } catch (err) {
        console.error("Failed to auto-mark as read:", err);
      }
    }
  };

  // Submit Details Changes (Notes & Resolution Status)
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setSaveLoading(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/contacts/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: adminNotes || null,
          isResolved: selectedLead.isResolved
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Lead modifications saved successfully!" });
        setIsModalOpen(false);
        fetchSubmissions();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to update lead" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    } finally {
      setSaveLoading(false);
    }
  };

  // Quick toggle resolved
  const handleToggleResolved = async (lead: ContactSubmission, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening details modal
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/contacts/${lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isResolved: !lead.isResolved })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Lead marked as ${!lead.isResolved ? 'Resolved' : 'Unresolved'}` });
        fetchSubmissions();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to toggle resolution status" });
    }
  };

  // Delete Contact Lead
  const handleDeleteLead = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening modal
    if (!confirm(`Are you sure you want to delete lead submission from ${name}?`)) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/contacts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Lead from ${name} was deleted.` });
        fetchSubmissions();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Deletion failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during deletion." });
    }
  };

  // Apply filters locally
  const filteredSubmissions = submissions.filter(sub => {
    if (tabFilter === "unread") return !sub.isRead;
    if (tabFilter === "unresolved") return !sub.isResolved;
    if (tabFilter === "resolved") return sub.isResolved;
    return true; // all
  });

  return (
    <div className="space-y-6">
      {/* Description header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Monitor callback queries, general clinic inquiries, and patient contact form leads.</p>
        </div>
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

      {/* Leads Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {[
          { key: 'all', label: 'Inbox (All)' },
          { key: 'unread', label: 'Unread Messages' },
          { key: 'unresolved', label: 'Action Required' },
          { key: 'resolved', label: 'Resolved Leads' }
        ].map(tab => {
          const count = submissions.filter(s => {
            if (tab.key === "unread") return !s.isRead;
            if (tab.key === "unresolved") return !s.isResolved;
            if (tab.key === "resolved") return s.isResolved;
            return true;
          }).length;

          const isSelected = tabFilter === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setTabFilter(tab.key as any)}
              className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected 
                  ? 'border-blue-650 text-blue-650 scale-102' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors ${
                isSelected ? 'bg-blue-50 text-blue-700 border border-blue-200/50' : 'bg-slate-100 text-slate-500'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table view */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Contact Person</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Resolution Status</th>
                <th className="p-4">Received Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs italic">Loading submissions...</td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs italic">No submissions found in this category.</td>
                </tr>
              ) : (
                filteredSubmissions.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => handleOpenDetails(lead)}
                    className={`hover:bg-slate-50/40 transition-colors cursor-pointer duration-150 ${
                      !lead.isRead ? 'bg-blue-50/10 font-bold text-slate-950' : 'text-slate-700 font-medium'
                    }`}
                  >
                    {/* Name & Contact */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        {!lead.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 shadow shadow-blue-500/55 animate-pulse" title="Unread Lead"></span>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                          <div className="flex flex-col gap-0.5 text-xs text-slate-500 font-medium mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400"/> {lead.email}</span>
                            {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400"/> {lead.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subject & message snippet */}
                    <td className="p-4 max-w-xs md:max-w-md">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{lead.subject}</p>
                      <p className="text-xs text-slate-550 font-normal line-clamp-2 mt-0.5">{lead.message}</p>
                    </td>

                    {/* Resolution Status */}
                    <td className="p-4">
                      <button
                        onClick={(e) => handleToggleResolved(lead, e)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider transition-all cursor-pointer ${
                          lead.isResolved 
                            ? 'bg-green-50 text-green-700 border-green-200/60 hover:bg-green-100/80 shadow-sm shadow-green-500/5' 
                            : 'bg-amber-50 text-amber-750 border-amber-250 hover:bg-amber-100/80 shadow-sm shadow-amber-500/5'
                        }`}
                      >
                        {lead.isResolved ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-600"/> Resolved</>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5 text-amber-600"/> Action Required</>
                        )}
                      </button>
                    </td>

                    {/* Received Date */}
                    <td className="p-4 text-xs text-slate-450 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(lead.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1 bg-slate-50/80 p-1 rounded-lg border border-slate-100/50">
                        <button
                          onClick={() => handleOpenDetails(lead)}
                          className="p-1 text-slate-450 hover:text-blue-650 transition-colors rounded cursor-pointer"
                          title="Open submission details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.subject)}&body=Dear ${encodeURIComponent(lead.name)},%0A%0AThank you for reaching out to Heshvitha Dental.%0A%0A`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-slate-450 hover:text-emerald-650 transition-colors rounded cursor-pointer inline-flex items-center"
                          title="Reply via email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button
                          onClick={(e) => handleDeleteLead(lead.id, lead.name, e)}
                          className="p-1 text-slate-450 hover:text-red-650 transition-colors rounded cursor-pointer"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* DETAIL MODAL DRAWER */}
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-md border border-slate-200 w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Lead Submission Details</h2>
                <p className="text-xs text-slate-500 mt-1">Review contact information and add follow-up comments.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveChanges} className="flex-grow overflow-y-auto p-6 space-y-4">
              
              {/* Profile Card */}
              <div className="p-4 rounded border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedLead.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedLead.email}</p>
                  </div>
                  {selectedLead.phone && (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                      {selectedLead.phone}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-150 flex justify-between">
                  <span>ID: {selectedLead.id}</span>
                  <span>Received: {new Date(selectedLead.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Message Box */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</span>
                <p className="font-semibold text-slate-800 text-sm">{selectedLead.subject}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Content</span>
                <div className="p-4 rounded bg-slate-100 text-sm text-slate-700 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line border border-slate-200">
                  {selectedLead.message}
                </div>
              </div>

              {/* Follow-up Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-550 uppercase tracking-wider">Admin Follow-up Notes</label>
                <textarea 
                  rows={4} 
                  placeholder="Record callback attempts, email threads, or notes about resolution..." 
                  value={adminNotes} 
                  onChange={e => setAdminNotes(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>

              {/* Resolution status check */}
              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={selectedLead.isResolved} 
                    onChange={e => setSelectedLead({ ...selectedLead, isResolved: e.target.checked })}
                    className="w-4 h-4 rounded text-green-600 border-slate-300 cursor-pointer" 
                  />
                  <span className="text-sm font-semibold text-slate-700">Mark Lead as Resolved</span>
                </label>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={saveLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saveLoading ? 'Saving...' : 'Save changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
