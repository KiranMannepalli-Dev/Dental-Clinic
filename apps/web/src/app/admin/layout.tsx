"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, Calendar as CalendarIcon, Activity, LogOut, 
  FileText, Image as ImageIcon, Star, Settings, MessageSquare
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      setCheckingAuth(false);
    }
  }, [pathname, router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-500">
        Verifying authorization...
      </div>
    );
  }

  // Standalone layout for login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Logged-in admin dashboard shell layout
  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Activity },
    { href: "/admin/appointments", label: "Appointments", icon: CalendarIcon },
    { href: "/admin/doctors", label: "Specialists", icon: Users },
    { href: "/admin/services", label: "Services", icon: Settings },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/contacts", label: "Leads / Contacts", icon: MessageSquare },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-md mr-3 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight">Heshvitha Admin</span>
            <span className="text-xs text-slate-500 font-medium">Dental Portal</span>
          </div>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <h1 className="font-semibold text-lg text-slate-800">
            {navItems.find(i => i.href === pathname)?.label || "Overview"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
              <span className="font-bold text-xs text-slate-600 uppercase">AD</span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="p-6 overflow-y-auto flex-grow">
          {children}
        </main>
      </div>

    </div>
  );
}
