"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope, FlaskConical, MonitorSmartphone,
  ChevronRight, LogOut, Building2, Shield, Activity, Lock, Mail, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

// ─── Department Definitions ───────────────────────────────────────────────────
const DEPARTMENTS = [
  {
    id: "ALL",
    label: "Master Control",
    sublabel: "Super Admin Access",
    description: "Full master access to all departments, system settings, user permissions, and complete clinic oversight.",
    icon: Shield,
    gradient: "from-amber-500 via-orange-600 to-red-700",
    glow: "shadow-amber-500/30",
    ring: "ring-amber-500/40",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-300",
    features: ["Global Dashboard", "All Departments", "User & Role Management", "System Configuration", "Full Reports"],
    redirectTo: "/admin/dashboard",
    roles: ["SUPER_ADMIN"],
  },
  {
    id: "OP",
    label: "OP Admin",
    sublabel: "Outpatient & Front Desk",
    description: "Appointments, patient registration, billing, contacts, services, and full clinic operations management.",
    icon: MonitorSmartphone,
    gradient: "from-blue-600 via-blue-700 to-indigo-800",
    glow: "shadow-blue-500/30",
    ring: "ring-blue-500/40",
    accentBg: "bg-blue-500/10",
    accentText: "text-blue-300",
    features: ["Appointments & Scheduling", "Patient Management", "Billing & Payments", "Leads & Contacts", "Reports & Analytics"],
    redirectTo: "/admin/dashboard",
    roles: ["SUPER_ADMIN", "RECEPTIONIST"],
  },
  {
    id: "DOCTOR",
    label: "Doctor",
    sublabel: "Clinical Dashboard",
    description: "View your daily schedule, patient records, clinical notes, and doctor-specific analytics.",
    icon: Stethoscope,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    glow: "shadow-emerald-500/30",
    ring: "ring-emerald-500/40",
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-300",
    features: ["My Schedule Today", "Patient Records", "Blog & Content", "Performance Reports"],
    redirectTo: "/admin/dashboard",
    roles: ["SUPER_ADMIN", "DOCTOR"],
  },
  {
    id: "LAB",
    label: "LAB",
    sublabel: "Laboratory & Diagnostics",
    description: "Manage dental lab orders, X-ray records, diagnostic results, and lab workflow tracking.",
    icon: FlaskConical,
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
    glow: "shadow-violet-500/30",
    ring: "ring-violet-500/40",
    accentBg: "bg-violet-500/10",
    accentText: "text-violet-300",
    features: ["Lab Test Orders", "X-Ray Management", "Diagnostic Results", "Lab Reports", "Equipment Logs"],
    redirectTo: "/admin/lab",
    roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"],
  },
];

const ROLE_NAV_MAP: Record<string, string[]> = {
  SUPER_ADMIN: ["ALL", "OP", "DOCTOR", "LAB"],
  RECEPTIONIST: ["OP", "LAB"],
  DOCTOR: ["DOCTOR", "LAB"],
};

export default function AdminPortal() {
  const router = useRouter();
  
  // Auth State
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [user, setUser] = useState<any>(null);
  
  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Portal State
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // PIN Modal State
  const [pinModalDept, setPinModalDept] = useState<typeof DEPARTMENTS[0] | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Auth check on mount
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setAuthStatus("unauthenticated");
      return;
    }

    const userStr = localStorage.getItem("adminUser");
    if (userStr) {
      try { 
        setUser(JSON.parse(userStr)); 
        setAuthStatus("authenticated");
      } catch {
        setAuthStatus("unauthenticated");
      }
    } else {
      setAuthStatus("unauthenticated");
    }

    // Clock tick
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Login failed"); }

      if (!res.ok) throw new Error(data.error?.message || "Login failed");

      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.data.user));
      
      setUser(data.data.user);
      setAuthStatus("authenticated");
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectDepartment = (dept: typeof DEPARTMENTS[0]) => {
    setPinModalDept(dept);
    setPin("");
    setPinError(false);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    setIsVerifying(true);
    setPinError(false);
    
    // Simulate API PIN verification (Accept 1234)
    setTimeout(() => {
      if (pin === "1234") {
        if (pinModalDept) {
          localStorage.setItem("adminDepartment", pinModalDept.id);
          router.push(pinModalDept.redirectTo);
        }
      } else {
        setPinError(true);
        setPin("");
        setIsVerifying(false);
      }
    }, 600);
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setPinError(false);
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setPinError(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminDepartment");
    setAuthStatus("unauthenticated");
    setUser(null);
  };

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── LOGIN VIEW ─────────────────────────────────────────────────────────────
  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-md shadow-sm">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white font-display">Admin Login</h1>
              <p className="text-slate-400 text-xs mt-2">Enter credentials to access the portal</p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-3 text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors text-sm"
                    placeholder="admin@heshvithadental.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoggingIn} className="w-full h-10 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm">
                {isLoggingIn ? "Authenticating..." : "Sign In"} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── PORTAL VIEW ────────────────────────────────────────────────────────────
  const userRole = user?.role || "RECEPTIONIST";
  const allowedDepts = ROLE_NAV_MAP[userRole] || ["OP"];
  const availableDepts = DEPARTMENTS.filter(d => allowedDepts.includes(d.id));

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Owner / Director",
    DOCTOR: "Doctor",
    RECEPTIONIST: "Receptionist",
  };

  return (
    <div className="min-h-screen bg-[#080c14] relative overflow-hidden flex flex-col">

      {/* ─── Animated Dental Background ───────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle repeating tooth/dental pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 22c-3 0-4-3-4-6s-1-4-2-4-2-2-2-4 1-5 4-5 3 2 4 4 1 5 4 5 2 2 2 4-1 6-4 6z' fill='none' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M12 11v11' fill='none' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, 
            backgroundSize: "60px 60px" 
          }} 
        />
        {/* Grid overlay for depth */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* ─── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Heshvitha Logo" className="h-10 w-auto object-contain bg-white p-0.5 rounded-lg shadow-lg shadow-blue-500/10" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">Heshvitha Dental</p>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Clinical Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white font-bold text-sm tabular-nums">
              {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p className="text-slate-500 text-[10px]">
              {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {user.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-slate-400 text-[10px] font-semibold">{roleLabel[userRole] || userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Select Your Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Choose Your <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Department</span>
          </h1>
          <p className="text-slate-400 text-xs mt-3 max-w-lg mx-auto leading-relaxed">
            Welcome back, <span className="text-white font-semibold">{user.name?.split(" ")[0]}</span>.
            Select the department dashboard you want to access today.
          </p>
        </div>

        {/* Department Cards */}
        <div className={`grid gap-4 w-full max-w-7xl ${availableDepts.length >= 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : availableDepts.length === 3 ? "grid-cols-1 sm:grid-cols-3 max-w-5xl" : availableDepts.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl" : "grid-cols-1 max-w-sm"}`}>
          {availableDepts.map((dept) => {
            const Icon = dept.icon;
            const isHovered = hoveredDept === dept.id;

            return (
              <button
                key={dept.id}
                onClick={() => handleSelectDepartment(dept)}
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
                className={`relative group text-left rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden bg-slate-900/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:bg-slate-800/60 hover:-translate-y-0.5 hover:shadow-lg`}
              >
                 <div className="relative p-4 flex items-center gap-4 h-full w-full">
                   <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${dept.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 shrink-0`}>
                     <Icon className="w-5 h-5 text-white" />
                   </div>
                   <div className="flex-grow min-w-0">
                     <h2 className="text-sm font-bold text-white leading-snug">{dept.label}</h2>
                     <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{dept.sublabel}</p>
                   </div>
                   <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-all shrink-0 group-hover:translate-x-0.5" />
                 </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-6 px-8 py-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> System Online</div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold"><Activity className="w-3 h-3" /> Heshvitha CMS v2.0</div>
      </div>

      {/* ─── PIN Modal ────────────────────────────────────────────────────── */}
      {pinModalDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-6 bg-gradient-to-br ${pinModalDept.gradient} relative`}>
              <button onClick={() => setPinModalDept(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer">✕</button>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner mb-4">
                  <pinModalDept.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{pinModalDept.label} Portal</h3>
                <p className="text-white/80 text-sm mt-1">Enter your 4-digit security PIN</p>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Enter Security PIN</label>
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                    autoFocus
                    required
                    value={pin}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPin(val);
                      setPinError(false);
                    }}
                    placeholder="••••"
                    className="w-full text-center tracking-[1.2em] text-3xl py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 font-mono font-bold transition-all"
                  />
                </div>

                {pinError && (
                  <p className="text-center text-red-500 text-xs font-bold animate-bounce">
                    Incorrect PIN. Try again.
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPinModalDept(null)}
                    className="flex-1 py-3 border border-slate-850 hover:bg-slate-850/50 text-slate-350 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pin.length !== 4 || isVerifying}
                    className={`flex-1 py-3 rounded-xl font-bold text-white text-xs transition-all ${
                      pin.length === 4 && !isVerifying
                        ? `bg-gradient-to-r ${pinModalDept.gradient} shadow-lg hover:opacity-90 cursor-pointer`
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {isVerifying ? "Verifying..." : "Access Portal"}
                  </button>
                </div>
                
                <p className="text-center text-[10px] text-slate-555 font-bold uppercase tracking-wider">Demo PIN: 1234</p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
