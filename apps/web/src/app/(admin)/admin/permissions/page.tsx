"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Users, UserPlus, Edit3, Trash2, Key,
  Mail, ToggleLeft, ToggleRight, Lock, X, Save, Eye, EyeOff,
  CheckCircle, AlertCircle, RefreshCw, Shield, Crown, Stethoscope
} from "lucide-react";

const ROLES = [
  {
    key: "SUPER_ADMIN",
    label: "Super Admin",
    icon: Crown,
    color: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Full access: all settings, staff, billing, reports, and permissions",
    permissions: ["Dashboard","Appointments","Patients","Staff","Doctors","Services","Blog","Gallery","Reviews","Leads","Reports","Settings","Permissions"]
  },
  {
    key: "RECEPTIONIST",
    label: "Receptionist",
    icon: Shield,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Day-to-day clinic operations — booking, patients, and communications",
    permissions: ["Dashboard","Appointments","Patients","Doctors","Services","Blog","Reviews","Leads","Reports"]
  },
  {
    key: "DOCTOR",
    label: "Doctor",
    icon: Stethoscope,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Read-only medical records and own appointment calendar",
    permissions: ["Dashboard","Appointments","Patients","Blog","Reviews","Reports"]
  }
];

const ALL_PERMISSIONS = [
  "Dashboard","Appointments","Patients","Staff","Doctors","Services",
  "Blog","Gallery","Reviews","Leads","Reports","Settings","Permissions"
];

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function PermissionsPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");

  // Edit role modal
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [editRole, setEditRole] = useState("RECEPTIONIST");
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Add user modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("RECEPTIONIST");
  const [addPassword, setAddPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Reset password modal
  const [resetUser, setResetUser] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [activeTab, setActiveTab] = useState<"members" | "matrix">("members");

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) { router.push("/admin/login"); return; }

      const userStr = localStorage.getItem("adminUser");
      if (userStr) {
        try { const u = JSON.parse(userStr); setCurrentUserId(u.id); } catch {}
      }

      const res = await fetch(`${API_URL}/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setStaff(data.data || []);
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Failed to fetch staff list." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleToggleActive = async (user: StaffMember) => {
    if (user.id === currentUserId) {
      setFeedbackMsg({ type: "error", text: "You cannot deactivate your own account." });
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff/${user.id}/toggle-active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `${user.name} ${data.data?.isActive ? "activated" : "deactivated"}.` });
        fetchStaff();
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Failed to toggle status." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingRole(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: editRole })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `${editingUser.name}'s role updated to ${editRole}.` });
        setEditingUser(null);
        fetchStaff();
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Failed to update role." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDelete = async (user: StaffMember) => {
    if (user.id === currentUserId) {
      setFeedbackMsg({ type: "error", text: "You cannot delete your own account." });
      return;
    }
    if (!confirm(`Delete ${user.name}? This action is permanent.`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `${user.name} deleted successfully.` });
        fetchStaff();
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Deletion failed." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: addName, email: addEmail, role: addRole, password: addPassword })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `${addName} added successfully as ${addRole}.` });
        setShowAddModal(false);
        setAddName(""); setAddEmail(""); setAddRole("RECEPTIONIST"); setAddPassword("");
        fetchStaff();
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Failed to add user." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    } finally {
      setIsAdding(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setIsResetting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/staff/${resetUser.id}/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: "success", text: `Password reset for ${resetUser.name}.` });
        setResetUser(null); setNewPassword("");
      } else {
        setFeedbackMsg({ type: "error", text: data.error?.message || "Password reset failed." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error." });
    } finally {
      setIsResetting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = ROLES.find(r => r.key === role);
    return r ? r.bg : "bg-slate-50 text-slate-600 border-slate-200";
  };

  const getRoleLabel = (role: string) => ROLES.find(r => r.key === role)?.label || role;

  const grouped = ROLES.map(role => ({
    ...role,
    members: staff.filter(s => s.role === role.key)
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" /> Permissions & Access Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage staff roles, access levels, and security settings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStaff}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          feedbackMsg.type === "success" ? "bg-green-50/80 backdrop-blur-sm text-green-800 border-green-200" : "bg-red-50/80 backdrop-blur-sm text-red-800 border-red-200"
        }`}>
          <span className="font-medium flex items-center gap-2">
            {feedbackMsg.type === "success" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            {feedbackMsg.text}
          </span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl w-fit">
        {([["members", "Team Members"], ["matrix", "Permissions Matrix"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Team Members */}
      {activeTab === "members" && (
        <div className="space-y-5">
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {grouped.map((roleGroup) => {
                const RoleIcon = roleGroup.icon;
                return (
                  <div key={roleGroup.key} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    {/* Role Header */}
                    <div className={`p-4 bg-gradient-to-br ${roleGroup.color} text-white`}>
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-5 h-5" />
                        <span className="font-bold text-sm">{roleGroup.label}</span>
                        <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                          {roleGroup.members.length} member{roleGroup.members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-white/75 text-xs mt-1">{roleGroup.description}</p>
                    </div>

                    {/* Members */}
                    <div className="divide-y divide-slate-100">
                      {roleGroup.members.length === 0 ? (
                        <p className="p-4 text-xs text-slate-400 italic text-center">No members in this role</p>
                      ) : (
                        roleGroup.members.map(user => (
                          <div key={user.id} className="p-4 flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-gradient-to-br ${roleGroup.color}`}>
                              {user.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
                                {user.id === currentUserId && (
                                  <span className="text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">You</span>
                                )}
                                <span className={`ml-auto w-2 h-2 rounded-full flex-shrink-0 ${user.isActive ? "bg-emerald-400" : "bg-red-400"}`} title={user.isActive ? "Active" : "Inactive"} />
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {user.email}
                              </p>
                              <p className="text-[10px] text-slate-300 mt-0.5">
                                Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                              </p>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => { setEditingUser(user); setEditRole(user.role); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Change Role"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleActive(user)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                title={user.isActive ? "Deactivate" : "Activate"}
                              >
                                {user.isActive ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-red-400" />}
                              </button>
                              <button
                                onClick={() => { setResetUser(user); setNewPassword(""); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Reset Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                              {user.id !== currentUserId && (
                                <button
                                  onClick={() => handleDelete(user)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Permissions Matrix */}
      {activeTab === "matrix" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-600" /> Role Permissions Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Overview of what each role can access across the system</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-4 text-left">Module / Section</th>
                  {ROLES.map(r => (
                    <th key={r.key} className="p-4 text-center min-w-[130px]">
                      <div className="flex flex-col items-center gap-1">
                        <r.icon className="w-4 h-4" />
                        {r.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {ALL_PERMISSIONS.map(perm => (
                  <tr key={perm} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4">
                      <span className="text-sm font-semibold text-slate-800">{perm}</span>
                    </td>
                    {ROLES.map(role => {
                      const hasAccess = role.permissions.includes(perm);
                      return (
                        <td key={role.key} className="p-4 text-center">
                          {hasAccess ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-300">
                              ✗
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-amber-50/60 border-t border-amber-100 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Permissions are enforced by role assignments. Only <strong>Super Admins</strong> can change roles and access this page.</span>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900">Change Role</h3>
                <p className="text-xs text-slate-400 mt-0.5">Update access level for <strong>{editingUser.name}</strong></p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRole} className="p-6 space-y-4">
              <div className="space-y-3">
                {ROLES.map(role => (
                  <label key={role.key} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${editRole === role.key ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="role" value={role.key} checked={editRole === role.key} onChange={() => setEditRole(role.key)} className="mt-0.5 cursor-pointer" />
                    <div>
                      <div className="flex items-center gap-2">
                        <role.icon className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-slate-900 text-sm">{role.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSavingRole || editRole === editingUser.role} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50">
                  <Save className="w-4 h-4" /> {isSavingRole ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900">Add Staff Member</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create a new admin account with appropriate role</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                <input type="text" required value={addName} onChange={e => setAddName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <input type="email" required value={addEmail} onChange={e => setAddEmail(e.target.value)}
                  placeholder="jane@heshvitha.com"
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Role</label>
                <select value={addRole} onChange={e => setAddRole(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white cursor-pointer">
                  {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Temporary Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required minLength={6} value={addPassword} onChange={e => setAddPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full py-2.5 px-3 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isAdding} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50">
                  <UserPlus className="w-4 h-4" /> {isAdding ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-400 mt-0.5">Set a new password for <strong>{resetUser.name}</strong></p>
              </div>
              <button onClick={() => setResetUser(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input type={showNewPassword ? "text" : "password"} required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full py-2.5 px-3 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setResetUser(null)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isResetting} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm cursor-pointer disabled:opacity-50">
                  <Key className="w-4 h-4" /> {isResetting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
