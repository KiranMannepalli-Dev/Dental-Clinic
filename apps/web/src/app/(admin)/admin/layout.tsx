"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import {
  Users, Calendar as CalendarIcon, Activity, LogOut,
  FileText, Image as ImageIcon, Star, Settings, MessageSquare,
  Menu, X, Bell, BarChart2, UserCircle, Lock, ChevronDown,
  ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, Zap, Stethoscope, Shield, FlaskConical, ArrowLeftRight
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NotifData {
  pendingAppointments: number;
  unreadContacts: number;
  pendingReviews: number;
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
  CANCELLED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50",
  NO_SHOW: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700/50",
  RESCHEDULED: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/50",
};

// ─── Breadcrumb helper ────────────────────────────────────────────────────────
function getBreadcrumbs(pathname: string) {
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/admin/dashboard" }
  ];
  let current = "/admin";
  for (const seg of segments) {
    current += `/${seg}`;
    if (seg === "dashboard") continue;
    const label = seg
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    crumbs.push({ label, href: current });
  }
  return crumbs;
}

// ─── Animated Badge ───────────────────────────────────────────────────────────
function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center tabular-nums animate-pulse">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string>("RECEPTIONIST");
  const [userName, setUserName] = useState<string>("Admin");
  
  // Department State
  const [currentDept, setCurrentDept] = useState("OP");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notification state
  const [notifData, setNotifData] = useState<NotifData>({
    pendingAppointments: 0, unreadContacts: 0, pendingReviews: 0, total: 0
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Today's schedule
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // My Profile modal
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileOldPwd, setProfileOldPwd] = useState("");
  const [profileNewPwd, setProfileNewPwd] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const isRootOrLogin = pathname === "/admin" || pathname === "/admin/login";

  useEffect(() => {
    if (isRootOrLogin) { setCheckingAuth(false); return; }
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
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
      const dept = localStorage.getItem("adminDepartment") || "OP";
      setCurrentDept(dept);
      setCheckingAuth(false);
    }
  }, [pathname, router, isRootOrLogin]);

  // Fetch notifications every 30 seconds
  const fetchNotifs = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/dashboard/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setNotifData(data.data);
      }
    } catch {}
  }, []);

  // Fetch today's schedule
  const fetchTodaySchedule = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/dashboard/today-schedule`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTodaySchedule(data.data || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isRootOrLogin) return;
    fetchNotifs();
    fetchTodaySchedule();
    const interval = setInterval(() => {
      fetchNotifs();
      fetchTodaySchedule();
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isRootOrLogin, fetchNotifs, fetchTodaySchedule]);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (scheduleRef.current && !scheduleRef.current.contains(e.target as Node)) setScheduleOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Verifying authorization...
      </div>
    );
  }

  if (isRootOrLogin) return <>{children}</>;

  const allNavItems = [
    // OP & DOCTOR
    { href: "/admin/dashboard", label: "Dashboard", icon: Activity, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"], depts: ["OP", "DOCTOR"], badge: 0, category: "Core Operations" },
    { href: "/admin/appointments", label: "Appointments", icon: CalendarIcon, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"], depts: ["OP", "DOCTOR"], badge: notifData.pendingAppointments, category: "Core Operations" },
    { href: "/admin/patients", label: "Patients", icon: Users, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"], depts: ["OP", "DOCTOR"], badge: 0, category: "Core Operations" },
    { href: "/admin/reports", label: "Analytics", icon: BarChart2, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"], depts: ["OP", "DOCTOR"], badge: 0, category: "Core Operations" },
    
    // OP Only
    { href: "/admin/schedule", label: "Schedule Manager", icon: CalendarIcon, roles: ["SUPER_ADMIN", "RECEPTIONIST"], depts: ["OP"], badge: 0, category: "Front Desk & Operations" },
    { href: "/admin/doctors", label: "Specialists", icon: Users, roles: ["SUPER_ADMIN", "RECEPTIONIST"], depts: ["OP"], badge: 0, category: "Front Desk & Operations" },
    { href: "/admin/services", label: "Services", icon: Stethoscope, roles: ["SUPER_ADMIN", "RECEPTIONIST"], depts: ["OP"], badge: 0, category: "Front Desk & Operations" },
    { href: "/admin/blog", label: "Blog", icon: FileText, roles: ["SUPER_ADMIN", "RECEPTIONIST"], depts: ["OP"], badge: 0, category: "Content & Reviews" },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, roles: ["SUPER_ADMIN", "RECEPTIONIST"], depts: ["OP"], badge: 0, category: "Content & Reviews" },
    { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["SUPER_ADMIN", "RECEPTIONIST"], depts: ["OP"], badge: notifData.pendingReviews, category: "Content & Reviews" },
    { href: "/admin/contacts", label: "Leads / Contacts", icon: MessageSquare, roles: ["SUPER_ADMIN", "RECEPTIONIST"], depts: ["OP"], badge: notifData.unreadContacts, category: "Content & Reviews" },
    
    // LAB
    { href: "/admin/lab", label: "Lab Dashboard", icon: FlaskConical, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"], depts: ["LAB"], badge: 0, category: "Laboratory" },

    // Admin Settings
    { href: "/admin/staff", label: "Admin Users", icon: Users, roles: ["SUPER_ADMIN"], depts: ["ALL"], badge: 0, category: "Administration" },
    { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN"], depts: ["ALL"], badge: 0, category: "Administration" },
    { href: "/admin/permissions", label: "Permissions", icon: Lock, roles: ["SUPER_ADMIN"], depts: ["ALL"], badge: 0, category: "Administration" },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole) && (currentDept === "ALL" || item.depts.includes(currentDept)));
  const breadcrumbs = getBreadcrumbs(pathname);
  const currentPageLabel = navItems.find((i) => pathname.startsWith(i.href))?.label || "Overview";
  const roleLabel =
    userRole === "SUPER_ADMIN"
      ? (currentDept === "ALL" ? "Owner / Director" : (currentDept === "DOCTOR" ? "Doctor" : currentDept === "LAB" ? "Lab Technician" : "Receptionist"))
      : (userRole === "DOCTOR" ? "Doctor" : "Receptionist");

  const deptLabel = currentDept === "ALL" ? "Master Control" : currentDept === "LAB" ? "Laboratory" : currentDept === "DOCTOR" ? "Clinical" : "OP Admin";

  const SidebarContent = () => {
    // Unique list of categories in the visible navigation items
    const categories = Array.from(new Set(navItems.map((item) => item.category)));

    return (
      <>
        <div className="h-20 flex items-center px-4 border-b border-slate-200 dark:border-slate-900 shrink-0 bg-slate-50/50 dark:bg-slate-950/60 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain bg-white p-1.5 rounded-md shadow-md border border-slate-200 dark:border-slate-800" />
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-[11px] tracking-tight text-slate-900 dark:text-white leading-tight">Heshvitha Multi Speciality</span>
              <span className="text-[8px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">Dental Hospital</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Department Switcher */}
        <div className="px-3 pt-3">
          <Link href="/admin" className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer group">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${currentDept === 'ALL' ? 'bg-amber-600' : currentDept === 'LAB' ? 'bg-violet-500' : currentDept === 'DOCTOR' ? 'bg-teal-500' : 'bg-blue-600'}`}>
                {currentDept === 'ALL' ? <Shield className="w-3.5 h-3.5 text-white" /> : currentDept === 'LAB' ? <FlaskConical className="w-3.5 h-3.5 text-white" /> : currentDept === 'DOCTOR' ? <Stethoscope className="w-3.5 h-3.5 text-white" /> : <Activity className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                <span className="text-xs font-bold leading-tight">{deptLabel}</span>
              </div>
            </div>
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
          </Link>
        </div>

        <div className="p-3 flex-grow overflow-y-auto">
          {/* Today's stat summary */}
          {todaySchedule.length > 0 && (
            <div className="mb-4 px-2 py-2 rounded-lg bg-blue-600/5 dark:bg-blue-600/10 border border-blue-650/15 dark:border-blue-600/20">
              <p className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Today's Schedule
              </p>
              <p className="text-slate-800 dark:text-white text-sm font-semibold">{todaySchedule.length} <span className="text-slate-400 dark:text-slate-400 text-xs font-normal">Appointments</span></p>
            </div>
          )}

          <nav className="space-y-4">
            {categories.map((category) => {
              const items = navItems.filter((item) => item.category === category);
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-1">
                  {/* Category Header (Only visible in Master Control to keep specific depts clean) */}
                  {currentDept === "ALL" && (
                    <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      {category}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link key={item.href} href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 font-semibold"
                              : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 hover:translate-x-0.5"
                          }`}
                        >
                          <item.icon className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isActive ? "scale-110 text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                          <span className="flex-1 truncate">{item.label}</span>
                          <NavBadge count={item.badge} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-900 shrink-0">
        {/* Role indicator */}
        <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-transparent">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-[10px] shrink-0">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{userName}</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">{roleLabel}</p>
          </div>
        </div>
        {currentDept === "ALL" && (
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 px-3 py-2 w-full text-slate-550 dark:text-slate-400 hover:text-blue-650 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-blue-500/10 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <UserCircle className="w-4 h-4" /> My Profile
          </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-slate-550 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
    );
  };

  return (
    <div className="admin-layout-wrapper min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">

      {/* ─── Mobile Overlay ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ───────────────────────────────────────────────── */}
      <aside className={`
        fixed md:sticky md:top-0 md:h-screen md:max-h-screen md:self-start inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-200 shrink-0 border-r border-slate-250/80 dark:border-slate-900 shadow-lg dark:shadow-2xl
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <SidebarContent />
      </aside>

      {/* ─── Main Panel ─────────────────────────────────────────────── */}
      <div className="flex-grow flex flex-col overflow-hidden bg-slate-50/70 dark:bg-slate-950/40 min-w-0">

        {/* Top Header */}
        <header className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-30 sticky top-0 transition-colors">

          {/* Main header row */}
          <div className="h-14 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger (mobile) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-1 text-xs" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>

              {/* Mobile: just page name */}
              <h1 className="sm:hidden font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                {currentPageLabel}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">

              {/* Role chip */}
              <span className="hidden lg:block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-sm">
                {roleLabel}
              </span>

              {/* Today's Schedule Button */}
              <div ref={scheduleRef} className="relative">
                <button
                  onClick={() => { setScheduleOpen(!scheduleOpen); if (notifOpen) setNotifOpen(false); }}
                  className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer text-xs font-medium border border-slate-200 dark:border-slate-850"
                  title="Today's Schedule"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Today</span>
                  {todaySchedule.length > 0 && (
                    <span className="bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {todaySchedule.length > 9 ? "9+" : todaySchedule.length}
                    </span>
                  )}
                </button>

                {/* Today's Schedule Popover */}
                {scheduleOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                        Today's Appointments
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
                      {todaySchedule.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">No appointments today</p>
                      ) : todaySchedule.map((appt: any) => (
                        <Link
                          key={appt.id}
                          href="/admin/appointments"
                          onClick={() => setScheduleOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="shrink-0 text-center mt-0.5">
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{appt.startTime || "--:--"}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {appt.patient?.firstName} {appt.patient?.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-450 truncate">
                              {appt.service?.name} · Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                            </p>
                          </div>
                          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border ${STATUS_COLORS[appt.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                            {appt.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href="/admin/appointments"
                        onClick={() => setScheduleOpen(false)}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        View all appointments →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); if (scheduleOpen) setScheduleOpen(false); }}
                  className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {notifData.total > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notifData.total > 9 ? "9+" : notifData.total}
                    </span>
                  )}
                </button>

                {/* Notification Popover */}
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        Notifications
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{notifData.total} pending</span>
                    </div>

                    {/* Pending Appointments */}
                    <Link href="/admin/appointments?status=PENDING" onClick={() => setNotifOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors border-b border-slate-50 dark:border-slate-850/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pending Appointments</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450">Review and confirm new bookings</p>
                      </div>
                      {notifData.pendingAppointments > 0 && (
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {notifData.pendingAppointments}
                        </span>
                      )}
                    </Link>

                    {/* Unread Contacts */}
                    <Link href="/admin/contacts" onClick={() => setNotifOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors border-b border-slate-50 dark:border-slate-850/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Unread Inquiries</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450">Patient contact messages</p>
                      </div>
                      {notifData.unreadContacts > 0 && (
                        <span className="bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {notifData.unreadContacts}
                        </span>
                      )}
                    </Link>

                    {/* Pending Reviews */}
                    <Link href="/admin/reviews" onClick={() => setNotifOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pending Reviews</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450">Awaiting moderation & publish</p>
                      </div>
                      {notifData.pendingReviews > 0 && (
                        <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {notifData.pendingReviews}
                        </span>
                      )}
                    </Link>

                    {notifData.total === 0 && (
                      <div className="px-4 py-4 text-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">All caught up!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Avatar / Profile button */}
              {currentDept === "ALL" && (
                <button
                  onClick={() => setProfileOpen(true)}
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="font-bold text-xs text-white uppercase">{userName.substring(0, 2)}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {children}
        </main>
      </div>

      {/* ─── My Profile / Change Password Modal ────────────────────── */}
      {profileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">My Profile</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{roleLabel}</p>
                </div>
              </div>
              <button onClick={() => { setProfileOpen(false); setProfileMsg(null); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleProfileSave} className="p-5 space-y-4">
              {profileMsg && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${profileMsg.type === "success" ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/40" : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/40"}`}>
                  {profileMsg.text}
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Display Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-550" />
                  <input
                    type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-1.5"><Lock className="w-3 h-3" /> Change Password (Optional)</p>
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-550" />
                    <input
                      type="password" value={profileOldPwd} onChange={(e) => setProfileOldPwd(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                      placeholder="Current password"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-550" />
                    <input
                      type="password" value={profileNewPwd} onChange={(e) => setProfileNewPwd(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                      placeholder="New password (min 6 chars)"
                      minLength={profileOldPwd ? 6 : undefined}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setProfileOpen(false); setProfileMsg(null); }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={profileSaving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors disabled:opacity-60">
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
