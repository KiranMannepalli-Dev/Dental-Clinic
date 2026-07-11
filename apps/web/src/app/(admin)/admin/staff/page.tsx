"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, UserPlus, Shield, Trash2, Edit3, Mail, X, Check,
  Key, Eye, EyeOff, Crown, Stethoscope, Clock, RefreshCw,
  AlertCircle, CheckCircle, Lock, ToggleLeft, ToggleRight,
  Search, Copy, ShieldAlert, Activity
} from "lucide-react";

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, {
  label: string; description: string;
  badge: string; gradient: string; icon: any;
}> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    description: "Full system access — billing, staff, settings, reports",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    gradient: "from-rose-500 to-pink-600",
    icon: Crown,
  },
  DOCTOR: {
    label: "Doctor",
    description: "View own schedule, patient records, blog & reviews",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    gradient: "from-teal-500 to-cyan-600",
    icon: Stethoscope,
  },
  RECEPTIONIST: {
    label: "Receptionist",
    description: "Manage appointments, patients, contacts, and content",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    gradient: "from-blue-500 to-indigo-600",
    icon: Shield,
  },
};

export default function StaffAdmin() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ─── Modals ───────────────────────────────────────────────────────────────
  // Create user
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("RECEPTIONIST");
  const [createPassword, setCreatePassword] = useState("");
  const [showCreatePwd, setShowCreatePwd] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit user
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("RECEPTIONIST");
  const [isEditing, setIsEditing] = useState(false);

  // Reset password
  const [resetUser, setResetUser] = useState<any | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Delete confirm
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) { router.push("/admin/login"); return; }

      const userStr = localStorage.getItem("adminUser");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setCurrentUserId(u.id || "");
          setCurrentUserEmail(u.email || "");
        } catch {}
      }

      const res = await fetch(`${API_URL}/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) { localStorage.removeItem("adminToken"); router.push("/admin/login"); return; }
      if (res.status === 403) {
        setFeedbackMsg({ type: "error", text: "Access denied. Only Super Admins can manage users." });
        setStaff([]); return;
      }

      const data = await res.json();
      setStaff(data.data || []);
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error fetching staff list." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  // Auto-dismiss feedback
  useEffect(() => {
    if (!feedbackMsg) return;
    const t = setTimeout(() => setFeedbackMsg(null), 5000);
    return () => clearTimeout(t);
  }, [feedbackMsg]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: createName, email: createEmail, role: createRole, password: createPassword, isActive: true })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `✓ ${createName} created successfully as ${ROLE_CONFIG[createRole]?.label}.` });
        setShowCreateModal(false);
        setCreateName(""); setCreateEmail(""); setCreateRole("RECEPTIONIST"); setCreatePassword("");
        fetchStaff();
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Failed to create user." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsEditing(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const payload: any = { name: editName, email: editEmail };
      if (editUser.id !== currentUserId) payload.role = editRole;

      const res = await fetch(`${API_URL}/admin/staff/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `✓ ${editName}'s profile updated successfully.` });
        setEditUser(null);
        fetchStaff();
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Update failed." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    } finally {
      setIsEditing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setIsResetting(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      // Use PATCH /:id with password field
      const res = await fetch(`${API_URL}/admin/staff/${resetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: resetPassword })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `✓ Password reset for ${resetUser.name}.` });
        setResetUser(null); setResetPassword("");
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Password reset failed." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleStatus = async (member: any) => {
    if (member.id === currentUserId) {
      setFeedbackMsg({ type: "error", text: "You cannot deactivate your own account." }); return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !member.isActive })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `${member.name} ${!member.isActive ? "activated" : "deactivated"}.` });
        fetchStaff();
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Failed to toggle status." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff/${deleteUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `✓ ${deleteUser.name}'s account permanently deleted.` });
        setDeleteUser(null);
        fetchStaff();
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Deletion failed." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setFeedbackMsg({ type: "success", text: "Copied to clipboard!" });
  };

  // ─── Filtering ────────────────────────────────────────────────────────────
  const filtered = staff.filter(m => {
    const matchSearch = search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "active" && m.isActive) ||
      (statusFilter === "inactive" && !m.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const counts = {
    total: staff.length,
    active: staff.filter(s => s.isActive).length,
    superAdmin: staff.filter(s => s.role === "SUPER_ADMIN").length,
    doctor: staff.filter(s => s.role === "DOCTOR").length,
    receptionist: staff.filter(s => s.role === "RECEPTIONIST").length,
  };

  const openEdit = (member: any) => {
    setEditUser(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-8">

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Admin User Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, edit, and control all admin dashboard login accounts
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStaff}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => { setShowCreateModal(true); setCreateName(""); setCreateEmail(""); setCreateRole("RECEPTIONIST"); setCreatePassword(""); setShowCreatePwd(false); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Create New User
          </button>
        </div>
      </div>

      {/* ─── Feedback ───────────────────────────────────────────────────── */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${
          feedbackMsg.type === "success"
            ? "bg-green-50/90 backdrop-blur-sm text-green-800 border-green-200"
            : "bg-red-50/90 backdrop-blur-sm text-red-800 border-red-200"
        }`}>
          <span className="font-semibold flex items-center gap-2">
            {feedbackMsg.type === "success"
              ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            {feedbackMsg.text}
          </span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs underline font-bold cursor-pointer opacity-70 hover:opacity-100 ml-4 shrink-0">Dismiss</button>
        </div>
      )}

      {/* ─── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Users", value: counts.total, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
          { label: "Active", value: counts.active, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Super Admins", value: counts.superAdmin, color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
          { label: "Doctors", value: counts.doctor, color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
          { label: "Receptionists", value: counts.receptionist, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Search & Filters ───────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="py-2 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none bg-white cursor-pointer">
          <option value="all">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="DOCTOR">Doctor</option>
          <option value="RECEPTIONIST">Receptionist</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="py-2 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none bg-white cursor-pointer">
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive / Suspended</option>
        </select>
      </div>

      {/* ─── Users Table ────────────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <th className="p-4">User Account</th>
                <th className="p-4">Role & Access</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">Member Since</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 text-sm animate-pulse">Loading admin accounts...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 text-sm italic">No users match your filters.</td></tr>
              ) : (
                filtered.map(member => {
                  const roleConf = ROLE_CONFIG[member.role];
                  const RoleIcon = roleConf?.icon || Shield;
                  const isMe = member.id === currentUserId;
                  return (
                    <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors ${!member.isActive ? "opacity-60" : ""}`}>

                      {/* User info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm bg-gradient-to-br ${roleConf?.gradient || "from-slate-400 to-slate-500"} shrink-0`}>
                            {member.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-sm leading-tight">{member.name}</p>
                              {isMe && (
                                <span className="text-[8px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">You</span>
                              )}
                            </div>
                            <button
                              onClick={() => copyToClipboard(member.email)}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors mt-0.5 cursor-pointer group"
                              title="Copy email"
                            >
                              <Mail className="w-3 h-3" /> {member.email}
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <p className="text-[9px] text-slate-300 font-mono mt-0.5">{member.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${roleConf?.badge}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleConf?.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] leading-tight">{roleConf?.description}</p>
                      </td>

                      {/* Status toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(member)}
                          disabled={isMe}
                          title={isMe ? "Cannot deactivate own account" : (member.isActive ? "Click to deactivate" : "Click to activate")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            isMe ? "cursor-not-allowed opacity-50" : "hover:opacity-80 active:scale-95"
                          } ${member.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {member.isActive
                            ? <><Check className="w-3.5 h-3.5" /> Active</>
                            : <><X className="w-3.5 h-3.5" /> Suspended</>
                          }
                        </button>
                      </td>

                      {/* Last login */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Activity className="w-3.5 h-3.5 text-slate-300" />
                          {member.lastLogin
                            ? new Date(member.lastLogin).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                            : <span className="italic text-slate-300">Never logged in</span>
                          }
                        </div>
                      </td>

                      {/* Created at */}
                      <td className="p-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          {new Date(member.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(member)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            title="Edit name, email, role"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          {/* Reset Password */}
                          <button
                            onClick={() => { setResetUser(member); setResetPassword(""); setShowResetPwd(false); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            title="Reset password"
                          >
                            <Key className="w-3.5 h-3.5" /> Password
                          </button>
                          {/* Delete */}
                          {!isMe && (
                            <button
                              onClick={() => setDeleteUser(member)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                              title="Permanently delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-400 font-semibold">
            Showing {filtered.length} of {staff.length} admin accounts
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Create User
      ═══════════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Create Admin Account</h3>
                    <p className="text-blue-100 text-xs mt-0.5">Grant dashboard login access to a staff member</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name *</label>
                  <input type="text" required value={createName} onChange={e => setCreateName(e.target.value)}
                    placeholder="e.g. Dr. Priya Sharma"
                    className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address *</label>
                  <input type="email" required value={createEmail} onChange={e => setCreateEmail(e.target.value)}
                    placeholder="e.g. priya@heshvitha.com"
                    className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Permission Role *</label>
                  <select value={createRole} onChange={e => setCreateRole(e.target.value)}
                    className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer">
                    <option value="RECEPTIONIST">Receptionist — Bookings, patients, contacts</option>
                    <option value="DOCTOR">Doctor — Schedule & records (read access)</option>
                    <option value="SUPER_ADMIN">Super Admin — Full system access</option>
                  </select>
                  <div className={`flex items-start gap-2 p-2.5 rounded-lg text-xs font-medium ${ROLE_CONFIG[createRole]?.badge} border`}>
                    {(() => { const Ic = ROLE_CONFIG[createRole]?.icon || Shield; return <Ic className="w-3.5 h-3.5 shrink-0 mt-0.5" />; })()}
                    <span>{ROLE_CONFIG[createRole]?.description}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Temporary Password *</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCreatePwd ? "text" : "password"} required minLength={6}
                      value={createPassword} onChange={e => setCreatePassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                    />
                    <button type="button" onClick={() => setShowCreatePwd(!showCreatePwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showCreatePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">The user should change this on first login.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm cursor-pointer transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  {isCreating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Edit User
      ═══════════════════════════════════════════════════════════════════════ */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit User Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Update name, email, or role for {editUser.name}</p>
                </div>
              </div>
              <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name *</label>
                <input type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address *</label>
                <input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Permission Role</label>
                <select value={editRole} onChange={e => setEditRole(e.target.value)}
                  disabled={editUser.id === currentUserId}
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                {editUser.id === currentUserId && (
                  <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> You cannot change your own role to prevent lockout.
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditUser(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm cursor-pointer">Cancel</button>
                <button type="submit" disabled={isEditing}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> {isEditing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Reset Password
      ═══════════════════════════════════════════════════════════════════════ */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-amber-50 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Reset Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">For: <strong>{resetUser.name}</strong></p>
                </div>
              </div>
              <button onClick={() => setResetUser(null)} className="p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showResetPwd ? "text" : "password"} required minLength={6}
                    value={resetPassword} onChange={e => setResetPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  />
                  <button type="button" onClick={() => setShowResetPwd(!showResetPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showResetPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  This will immediately invalidate their current session.
                </p>
              </div>
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setResetUser(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm cursor-pointer">Cancel</button>
                <button type="submit" disabled={isResetting}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <Key className="w-4 h-4" /> {isResetting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Delete Confirm
      ═══════════════════════════════════════════════════════════════════════ */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-red-100 bg-red-50 flex items-center gap-3 rounded-t-2xl">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete User Account</h3>
                <p className="text-xs text-red-600 mt-0.5 font-semibold">This action is permanent and irreversible</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-1 border border-slate-200">
                <p className="font-bold text-slate-900">{deleteUser.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {deleteUser.email}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_CONFIG[deleteUser.role]?.badge}`}>
                  {ROLE_CONFIG[deleteUser.role]?.label}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Deleting this account will <strong>permanently remove</strong> all access. The user will not be able to log into the admin dashboard.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteUser(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <Trash2 className="w-4 h-4" /> {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
