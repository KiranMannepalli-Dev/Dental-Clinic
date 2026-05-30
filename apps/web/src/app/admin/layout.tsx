"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import {
  Users, Calendar as CalendarIcon, Activity, LogOut,
  FileText, Image as ImageIcon, Star, Settings, MessageSquare,
  Menu, X, Bell, BarChart2, UserCircle, Lock, ChevronDown
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string>("RECEPTIONIST");
  const [userName, setUserName] = useState<string>("Admin");

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notification state
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // My Profile modal
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileOldPwd, setProfileOldPwd] = useState("");
  const [profileNewPwd, setProfileNewPwd] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) { setCheckingAuth(false); return; }
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      const userStr = localStorage.getItem("adminUser");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUserRole(u.role || "RECEPTIONIST");
          setUserName(u.name || "Admin");
          setProfileName(u.name || "Admin");
        } catch {}
      }
      setCheckingAuth(false);
    }
  }, [pathname, router, isLoginPage]);

  // Fetch notification count every 60 seconds
  useEffect(() => {
    if (!isAuthenticated || isLoginPage) return;
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;
        const res = await fetch(`${API_URL}/admin/dashboard/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifCount(data.data?.total || 0);
        }
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLoginPage]);

  // Close notification popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const body: any = { name: profileName };
      if (profileOldPwd && profileNewPwd) {
        body.oldPassword = profileOldPwd;
        body.newPassword = profileNewPwd;
      }
      const res = await fetch(`${API_URL}/admin/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
        setUserName(profileName);
        const userStr = localStorage.getItem("adminUser");
        if (userStr) {
          const u = JSON.parse(userStr);
          localStorage.setItem("adminUser", JSON.stringify({ ...u, name: profileName }));
        }
        setProfileOldPwd("");
        setProfileNewPwd("");
      } else {
        setProfileMsg({ type: "error", text: data.error?.message || "Failed to update profile" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setProfileSaving(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-500">
        Verifying authorization...
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  const allNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Activity, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] },
    { href: "/admin/appointments", label: "Appointments", icon: CalendarIcon, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] },
    { href: "/admin/patients", label: "Patients", icon: Users, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] },
    { href: "/admin/staff", label: "Staff Directory", icon: Users, roles: ["SUPER_ADMIN"] },
    { href: "/admin/doctors", label: "Specialists", icon: Users, roles: ["SUPER_ADMIN", "RECEPTIONIST"] },
    { href: "/admin/services", label: "Services", icon: Settings, roles: ["SUPER_ADMIN", "RECEPTIONIST"] },
    { href: "/admin/blog", label: "Blog", icon: FileText, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, roles: ["SUPER_ADMIN", "RECEPTIONIST"] },
    { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] },
    { href: "/admin/contacts", label: "Leads / Contacts", icon: MessageSquare, roles: ["SUPER_ADMIN", "RECEPTIONIST"] },
    { href: "/admin/reports", label: "Analytics", icon: BarChart2, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] },
    { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN"] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-4 border-b border-slate-900 shrink-0 bg-slate-950/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain bg-white/95 p-1.5 rounded-md shadow-md border border-slate-800" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[11px] tracking-tight text-white leading-tight">Heshvitha Multi speciality</span>
            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-1">Dental Hospital</span>
          </div>
        </Link>
        {/* Close button (mobile only) */}
        <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-grow overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900 hover:translate-x-1"
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? "scale-110 text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                {item.label}
                {item.href === "/admin/appointments" && notifCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {notifCount > 99 ? "99+" : notifCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-900 shrink-0 space-y-1">
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <UserCircle className="w-4 h-4" /> My Profile
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* ─── Mobile Overlay ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ───────────────────────────────────────────────── */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-950 text-white shrink-0 border-r border-slate-900 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <SidebarContent />
      </aside>

      {/* ─── Main Panel ─────────────────────────────────────────────── */}
      <div className="flex-grow flex flex-col overflow-hidden bg-slate-50/70 min-w-0">

        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-base text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full hidden sm:block" />
              {navItems.find((i) => pathname.startsWith(i.href))?.label || "Overview"}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
              {userRole === "SUPER_ADMIN" ? "Owner / Director" : userRole === "DOCTOR" ? "Doctor" : "Receptionist"}
            </span>

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in zoom-in-90 fade-in duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-800">Notifications</p>
                    <span className="text-[10px] text-slate-400 font-medium">{notifCount} pending</span>
                  </div>
                  <Link href="/admin/appointments?status=PENDING" onClick={() => setNotifOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50"
                  >
                    <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Pending Appointments</p>
                      <p className="text-[10px] text-slate-500">Review and confirm new bookings</p>
                    </div>
                  </Link>
                  <Link href="/admin/contacts" onClick={() => setNotifOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-violet-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-violet-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Unread Inquiries</p>
                      <p className="text-[10px] text-slate-500">Patient contact messages</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Avatar / Profile button */}
            <button
              onClick={() => setProfileOpen(true)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-slate-200 shadow-md cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="font-bold text-xs text-white uppercase">{userName.substring(0, 2)}</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {children}
        </main>
      </div>

      {/* ─── My Profile / Change Password Modal ────────────────────── */}
      {profileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">My Profile</h3>
                  <p className="text-[10px] text-slate-400 font-medium">{userRole === "SUPER_ADMIN" ? "Owner / Director" : userRole}</p>
                </div>
              </div>
              <button onClick={() => { setProfileOpen(false); setProfileMsg(null); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleProfileSave} className="p-5 space-y-4">
              {profileMsg && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${profileMsg.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}>
                  {profileMsg.text}
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Display Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5"><Lock className="w-3 h-3" /> Change Password (Optional)</p>
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password" value={profileOldPwd} onChange={(e) => setProfileOldPwd(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                      placeholder="Current password"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password" value={profileNewPwd} onChange={(e) => setProfileNewPwd(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                      placeholder="New password (min 6 chars)"
                      minLength={profileOldPwd ? 6 : undefined}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setProfileOpen(false); setProfileMsg(null); }}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={profileSaving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors">
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
