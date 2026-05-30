"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, UserPlus, Shield, ToggleLeft, ToggleRight, Trash2, 
  Edit3, Mail, ShieldAlert, X, Check, Key
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function StaffAdmin() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  
  // Feedback alerts
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("RECEPTIONIST");
  const [password, setPassword] = useState("");
  
  // Fetch logged-in user and staff list
  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      // Read current logged-in user email
      const userStr = localStorage.getItem("adminUser");
      if (userStr) {
        const u = JSON.parse(userStr);
        setCurrentUserEmail(u.email);
        setCurrentUserId(u.id);
      }

      const res = await fetch(`${API_URL}/admin/staff`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      if (res.status === 403) {
        // Not a Super Admin
        setFeedbackMsg({ type: 'error', text: "Access Denied: Only Clinic Owners (SUPER_ADMIN) can access staff management." });
        setStaff([]);
        return;
      }

      const data = await res.json();
      setStaff(data.data || []);
    } catch (err) {
      console.error("Error fetching staff list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Add Staff Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, role, password, isActive: true })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Staff member ${name} created successfully!` });
        setShowAddModal(false);
        // Clear fields
        setName("");
        setEmail("");
        setRole("RECEPTIONIST");
        setPassword("");
        fetchStaff();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to create account" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Staff Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const payload: any = {
        name,
        email,
        role
      };
      if (password) {
        payload.password = password;
      }
      
      const res = await fetch(`${API_URL}/admin/staff/${showEditModal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Staff account updated successfully!" });
        setShowEditModal(null);
        setPassword("");
        fetchStaff();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to update account" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle staff active state
  const handleToggleStatus = async (member: any) => {
    if (member.id === currentUserId) {
      setFeedbackMsg({ type: 'error', text: "You cannot deactivate your own account." });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !member.isActive })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ 
          type: 'success', 
          text: `Account for ${member.name} has been ${!member.isActive ? "Activated" : "Deactivated"}.` 
        });
        fetchStaff();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to toggle status" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  // Delete Staff member
  const handleDeleteStaff = async (id: string, name: string) => {
    if (id === currentUserId) {
      setFeedbackMsg({ type: 'error', text: "You cannot delete your own account." });
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete staff member ${name}? This action is irreversible.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Staff account deleted successfully!" });
        fetchStaff();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to delete account" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-rose-50 text-rose-700 border-rose-250';
      case 'DOCTOR': return 'bg-teal-50 text-teal-700 border-teal-250';
      case 'RECEPTIONIST': return 'bg-blue-50 text-blue-700 border-blue-250';
      default: return 'bg-slate-50 text-slate-700 border-slate-250';
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' ? 'bg-green-50/80 backdrop-blur-sm text-green-800 border-green-200' : 'bg-red-50/80 backdrop-blur-sm text-red-800 border-red-200'
        }`}>
          <span className="font-medium">{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline cursor-pointer hover:text-slate-900">Dismiss</button>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Clinic Staff Registry
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure administrative permissions, add dental receptionists, and create doctor dashboard profiles.
          </p>
        </div>
        <button
          onClick={() => {
            // Set defaults for creation
            setName("");
            setEmail("");
            setRole("RECEPTIONIST");
            setPassword("");
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" /> Create Staff Member
        </button>
      </div>

      {/* Main Staff Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-55/60 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Role / Permission</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs italic">Loading staff database...</td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs italic">No staff members registered.</td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Name */}
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{member.id}</p>
                    </td>

                    {/* Email */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.email}</span>
                      </div>
                      {member.email === currentUserEmail && (
                        <span className="inline-block mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Logged In</span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold border ${getRoleBadge(member.role)}`}>
                        <Shield className="w-3 h-3" />
                        {member.role === 'SUPER_ADMIN' ? 'SUPER ADMIN (OWNER)' : member.role === 'DOCTOR' ? 'DOCTOR / DOCTOR' : 'RECEPTIONIST'}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="p-4 text-xs text-slate-500 font-medium">
                      {member.lastLogin 
                        ? new Date(member.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : "Never Logged In"
                      }
                    </td>

                    {/* Status Active */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        disabled={member.id === currentUserId}
                        className={`inline-flex items-center gap-1 text-xs font-semibold focus:outline-none transition-colors ${
                          member.id === currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {member.isActive ? (
                          <span className="flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded-lg border border-green-150">
                            <Check className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2 py-1 rounded-lg border border-red-150">
                            <X className="w-3.5 h-3.5" /> Suspended
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setName(member.name);
                            setEmail(member.email);
                            setRole(member.role);
                            setPassword(""); // Keep password blank unless changing
                            setShowEditModal(member);
                          }}
                          className="p-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white rounded-lg transition-colors cursor-pointer shadow-sm hover:shadow"
                          title="Edit Staff Credentials"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id, member.name)}
                          disabled={member.id === currentUserId}
                          className="p-2 border border-red-200 hover:border-red-300 text-red-650 hover:text-red-700 bg-red-50/50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                          title="Delete Staff Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* CREATE STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Add Staff Member</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Create a new dashboard access account.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Permission Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 bg-white cursor-pointer"
                  required
                >
                  <option value="RECEPTIONIST">Receptionist (Bookings and Moderation)</option>
                  <option value="DOCTOR">Doctor / Specialist (View schedule & records)</option>
                  <option value="SUPER_ADMIN">Owner / Super Admin (Full Control)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Access Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 bg-white"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-55/60 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors text-sm cursor-pointer shadow-sm"
                >
                  {isSubmitting ? "Creating..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Staff Credentials</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Update account properties or reset password.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Permission Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 bg-white cursor-pointer"
                  required
                  disabled={showEditModal.id === currentUserId} // Can't change one's own role
                >
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="DOCTOR">Doctor / Specialist</option>
                  <option value="SUPER_ADMIN">Owner / Super Admin</option>
                </select>
                {showEditModal.id === currentUserId && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-0.5">To prevent locking yourself out, you cannot modify your own role.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Reset Password</label>
                  <span className="text-[10px] text-slate-400 italic font-medium">Leave blank to keep current</span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 bg-white"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors text-sm cursor-pointer shadow-sm"
                >
                  {isSubmitting ? "Saving..." : "Update Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
