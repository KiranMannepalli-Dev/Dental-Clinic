"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical, ClipboardList, TestTube2, Microscope,
  FileText, Calendar, CheckCircle, Clock, AlertCircle,
  RefreshCw, Download, Plus, Search, ArrowLeft, Printer,
  Check, UploadCloud, CalendarDays, Eye, Trash2, Edit
} from "lucide-react";

import { FileUpload } from "@/components/ui/FileUpload";

// ─── Lab Data types (future DB integration ready) ────────────────────────
interface LabOrder {
  id: string;
  patientName: string;
  testName: string;
  orderedBy: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REPORTED";
  priority: "ROUTINE" | "URGENT" | "STAT";
  orderedAt: string;
  completedAt?: string;
  result?: string;
  notes?: string;
  fileUrl?: string; // Cloudinary file link
}

const MOCK_ORDERS: LabOrder[] = [
  { id: "LAB001", patientName: "Ravi Kumar", testName: "Dental X-Ray (OPG)", orderedBy: "Dr. Priya Sharma", status: "COMPLETED", priority: "ROUTINE", orderedAt: new Date().toISOString(), completedAt: new Date().toISOString(), result: "No significant pathology detected." },
  { id: "LAB002", patientName: "Anita Rao", testName: "CBCT Scan", orderedBy: "Dr. Suresh Babu", status: "IN_PROGRESS", priority: "URGENT", orderedAt: new Date().toISOString() },
  { id: "LAB003", patientName: "Mohammed Ali", testName: "Blood Glucose Test", orderedBy: "Dr. Priya Sharma", status: "PENDING", priority: "ROUTINE", orderedAt: new Date().toISOString() },
  { id: "LAB004", patientName: "Deepa Nair", testName: "Periapical X-Ray", orderedBy: "Dr. Kiran M.", status: "REPORTED", priority: "ROUTINE", orderedAt: new Date().toISOString(), completedAt: new Date().toISOString(), result: "Periapical abscess noted at #36." },
  { id: "LAB005", patientName: "Sanjay Gupta", testName: "Blood Pressure Check", orderedBy: "Dr. Suresh Babu", status: "PENDING", priority: "STAT", orderedAt: new Date().toISOString() },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
  COMPLETED: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  REPORTED: { label: "Reported", color: "bg-violet-50 text-violet-700 border-violet-200", icon: FileText },
};

const PRIORITY_CONFIG: Record<string, string> = {
  ROUTINE: "bg-slate-100 text-slate-600 border-slate-200",
  URGENT: "bg-orange-50 text-orange-700 border-orange-200",
  STAT: "bg-red-50 text-red-700 border-red-200",
};

export default function LabDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<LabOrder[]>(MOCK_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveCategory, setArchiveCategory] = useState("all");
  const [archiveSort, setArchiveSort] = useState("date-desc");
  const [archiveStartDate, setArchiveStartDate] = useState("");
  const [archiveEndDate, setArchiveEndDate] = useState("");

  // Order Completion form
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [resultFileUrl, setResultFileUrl] = useState("");

  // New order form
  const [newPatient, setNewPatient] = useState("");
  const [newTest, setNewTest] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newPriority, setNewPriority] = useState("ROUTINE");
  const [newNotes, setNewNotes] = useState("");

  // Sub-Navigation Tabs
  const [labActiveTab, setLabActiveTab] = useState<"all_orders" | "file_uploads" | "daily_schedules">("all_orders");
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/lab-tests`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        console.warn("Lab tests request failed with status: ", res.status);
        return;
      }
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        // Map MedicalTest database records to LabOrder interface
        const dbOrders = json.data.map((item: any) => {
          // orderedBy is parsed from prefix in notes, or defaults to Dr. Priya Sharma
          let orderedBy = "Dr. Priya Sharma";
          let cleanNotes = item.notes || "";
          if (item.notes && item.notes.startsWith("Ordered By: ")) {
            const parts = item.notes.split(". Notes: ");
            orderedBy = parts[0].replace("Ordered By: ", "");
            cleanNotes = parts[1] || "";
          }

          // priority is ROUTINE, URGENT, or STAT
          let priority: any = "ROUTINE";
          if (item.cost >= 1200) priority = "STAT";
          else if (item.cost >= 800) priority = "URGENT";

          // Extract file url if it was stored in notes/file link
          let fileUrl = "";
          if (item.notes && item.notes.includes("File attached: ")) {
            fileUrl = item.notes.split("File attached: ")[1] || "";
          }

          return {
            id: item.id.substring(0, 8).toUpperCase(),
            patientName: item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : "Unknown Patient",
            testName: item.testName,
            orderedBy,
            status: item.status,
            priority,
            orderedAt: item.testDate || item.createdAt,
            completedAt: item.status === "COMPLETED" ? item.updatedAt : undefined,
            result: item.result || undefined,
            notes: cleanNotes || undefined,
            fileUrl: fileUrl || undefined,
            dbId: item.id
          };
        });
        setOrders(dbOrders);
      }
    } catch (error) {
      console.error("Error fetching lab orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { router.push("/admin/login"); return; }
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [router]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "PENDING").length,
    inProgress: orders.filter(o => o.status === "IN_PROGRESS").length,
    completed: orders.filter(o => ["COMPLETED", "REPORTED"].includes(o.status)).length,
    urgent: orders.filter(o => o.priority === "URGENT" || o.priority === "STAT").length,
  };

  const filtered = orders.filter(o => {
    const matchSearch = search === "" ||
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.testName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id: string, newStatus: LabOrder["status"]) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const dbId = (order as any).dbId || id;
    
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/lab-tests/${dbId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleOpenComplete = (id: string) => {
    setCompletingOrderId(id);
    setResultNotes("");
    setResultFileUrl("");
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingOrderId) return;
    const order = orders.find(o => o.id === completingOrderId);
    if (!order) return;
    const dbId = (order as any).dbId || completingOrderId;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/lab-tests/${dbId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "COMPLETED",
          result: resultNotes,
          fileUrl: resultFileUrl || null
        })
      });
      if (res.ok) {
        setCompletingOrderId(null);
        setResultNotes("");
        setResultFileUrl("");
        fetchOrders();
      }
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/lab-tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName: newPatient,
          testName: newTest,
          orderedBy: newDoctor,
          priority: newPriority,
          notes: newNotes || null
        })
      });
      if (res.ok) {
        setShowNewOrderModal(false);
        setNewPatient(""); setNewTest(""); setNewDoctor(""); setNewPriority("ROUTINE"); setNewNotes("");
        fetchOrders();
      }
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Laboratory Dashboard</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage lab orders, diagnostics, X-rays, and test reports</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Switch Department
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" /> New Lab Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Orders", value: stats.total, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
          { label: "Pending", value: stats.pending, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Completed", value: stats.completed, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Urgent / STAT", value: stats.urgent, color: "text-red-700", bg: "bg-red-50 border-red-200" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Sub-Navigation Tabs ─── */}
      <div className="flex border-b border-slate-200 bg-white/40 p-1.5 rounded-xl gap-2 w-max shadow-sm border">
        {[
          { id: "all_orders", label: "Lab Orders", icon: ClipboardList },
          { id: "file_uploads", label: "Uploaded Files & Reports", icon: UploadCloud },
          { id: "daily_schedules", label: "Daily Schedule", icon: CalendarDays },
        ].map(t => {
          const Icon = t.icon;
          const isActive = labActiveTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setLabActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                  : "text-slate-650 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content: Lab Orders List ─── */}
      {labActiveTab === "all_orders" && (
        <div className="space-y-4">
          {/* Search + Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by patient, test, or order ID..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="py-2 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none bg-white cursor-pointer font-semibold">
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REPORTED">Reported</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Patient</th>
                    <th className="p-4">Test / Procedure</th>
                    <th className="p-4">Ordered By</th>
                    <th className="p-4 text-center">Priority</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Ordered</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="p-10 text-center text-slate-400 text-sm italic">No lab orders found.</td></tr>
                  ) : (
                    filtered.map(order => {
                      const statusConf = STATUS_CONFIG[order.status];
                      const StatusIcon = statusConf.icon;
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg border border-violet-100">
                              {order.id}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-900 text-sm">{order.patientName}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <TestTube2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                              <span className="text-sm text-slate-700 font-medium">{order.testName}</span>
                            </div>
                            {order.notes && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{order.notes}</p>}
                          </td>
                          <td className="p-4 text-xs text-slate-600 font-semibold">{order.orderedBy}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_CONFIG[order.priority]}`}>
                              {order.priority}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusConf.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConf.label}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-400">
                            {new Date(order.orderedAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-violet-700 hover:border-violet-300 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                              >
                                View
                              </button>
                              {order.status === "PENDING" && (
                                <button
                                  onClick={() => handleStatusChange(order.id, "IN_PROGRESS")}
                                  className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Start
                                </button>
                              )}
                              {order.status === "IN_PROGRESS" && (
                                <button
                                  onClick={() => handleOpenComplete(order.id)}
                                  className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Complete
                                </button>
                              )}
                              {order.status === "COMPLETED" && (
                                <button
                                  onClick={() => handleStatusChange(order.id, "REPORTED")}
                                  className="px-2.5 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Report
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
            <div className="p-3 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-400 font-semibold">
              Showing {filtered.length} of {orders.length} lab orders
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content: File Uploads View ─── */}
      {labActiveTab === "file_uploads" && (() => {
        // Filter and sort the completed files list locally
        const uploadedOrders = orders
          .filter(o => o.fileUrl)
          .filter(o => {
            const matchSearch = archiveSearch === "" ||
              o.patientName.toLowerCase().includes(archiveSearch.toLowerCase()) ||
              o.testName.toLowerCase().includes(archiveSearch.toLowerCase()) ||
              o.id.toLowerCase().includes(archiveSearch.toLowerCase());
            
            const matchCategory = archiveCategory === "all" || 
              o.testName.toLowerCase().includes(archiveCategory.toLowerCase()) ||
              (o.notes && o.notes.toLowerCase().includes(archiveCategory.toLowerCase()));

            if (archiveStartDate) {
              const start = new Date(archiveStartDate);
              start.setHours(0, 0, 0, 0);
              const orderDate = new Date(o.completedAt || o.orderedAt);
              if (orderDate < start) return false;
            }
            if (archiveEndDate) {
              const end = new Date(archiveEndDate);
              end.setHours(23, 59, 59, 999);
              const orderDate = new Date(o.completedAt || o.orderedAt);
              if (orderDate > end) return false;
            }
            
            return matchSearch && matchCategory;
          })
          .sort((a, b) => {
            if (archiveSort === "date-desc") {
              return new Date(b.completedAt || b.orderedAt).getTime() - new Date(a.completedAt || a.orderedAt).getTime();
            }
            if (archiveSort === "date-asc") {
              return new Date(a.completedAt || a.orderedAt).getTime() - new Date(b.completedAt || b.orderedAt).getTime();
            }
            if (archiveSort === "name-asc") {
              return a.patientName.localeCompare(b.patientName);
            }
            return 0;
          });

        return (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Lab Report & Image Archive</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Quickly view or access raw files uploaded to Cloudinary for lab findings.</p>
              </div>
            </div>

            {/* Archive Filters bar */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850 text-xs">
              <div className="relative flex-grow min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Patient name, test or ID..."
                  value={archiveSearch}
                  onChange={e => setArchiveSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-205 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-450 font-bold">Category:</span>
                <select
                  value={archiveCategory}
                  onChange={e => setArchiveCategory(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-250 focus:outline-none focus:border-violet-500 font-semibold"
                >
                  <option value="all">All Categories</option>
                  <option value="X-Ray">Dental X-Ray</option>
                  <option value="Scan">CBCT Scan</option>
                  <option value="Blood">Blood Test</option>
                  <option value="Biopsy">Oral Biopsy</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-455 font-bold">From:</span>
                <input
                  type="date"
                  value={archiveStartDate}
                  onChange={e => setArchiveStartDate(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-250 focus:outline-none focus:border-violet-500 font-semibold"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-455 font-bold">To:</span>
                <input
                  type="date"
                  value={archiveEndDate}
                  onChange={e => setArchiveEndDate(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-250 focus:outline-none focus:border-violet-500 font-semibold"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-450 font-bold">Sort By:</span>
                <select
                  value={archiveSort}
                  onChange={e => setArchiveSort(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-250 focus:outline-none focus:border-violet-500 font-semibold"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Patient Name (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedOrders.length === 0 ? (
                <div className="col-span-full py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 italic text-sm">
                  No matching archived reports found.
                </div>
              ) : (
                uploadedOrders.map(o => (
                  <div key={o.id} className="border border-slate-200/65 dark:border-slate-800/60 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] font-bold text-violet-650 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded border border-violet-150 dark:border-violet-900/40">{o.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550">{new Date(o.completedAt || o.orderedAt).toLocaleDateString("en-IN")}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{o.patientName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{o.testName}</p>
                      </div>
                      {o.result && (
                        <p className="text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-850 dark:text-emerald-450 p-2 rounded-lg border border-emerald-150 dark:border-emerald-900/30 line-clamp-2">
                          {o.result}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-850 flex gap-2">
                      <a
                        href={o.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-grow py-1.5 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900 text-violet-750 dark:text-violet-400 text-xs font-bold rounded-lg border border-violet-200/50 dark:border-violet-800 text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View File
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setCompletingOrderId(o.id);
                          setResultNotes(o.result || "");
                          setResultFileUrl(o.fileUrl || "");
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* ─── Tab Content: Daily Schedules ─── */}
      {labActiveTab === "daily_schedules" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Today's Diagnostic Workload</h3>
              <p className="text-xs text-slate-450 mt-0.5">Schedules grouped and prioritized for the current day.</p>
            </div>
            <span className="px-3 py-1 bg-violet-50 border border-violet-150 rounded-full text-violet-700 text-xs font-bold">
              {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Urgent & STAT diagnostics column */}
            <div className="border border-red-150 rounded-xl p-4 bg-red-50/10 space-y-3">
              <h4 className="font-bold text-red-750 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> High Priority / STAT
              </h4>
              <div className="space-y-2">
                {orders.filter(o => ["URGENT", "STAT"].includes(o.priority) && o.status !== "COMPLETED" && o.status !== "REPORTED").length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No urgent tests currently in queue.</p>
                ) : (
                  orders.filter(o => ["URGENT", "STAT"].includes(o.priority) && o.status !== "COMPLETED" && o.status !== "REPORTED").map(o => (
                    <div key={o.id} className="bg-white border border-red-100 rounded-lg p-3 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{o.patientName}</p>
                        <p className="text-xs text-slate-500 font-semibold">{o.testName}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">{o.priority}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Standard Queue column */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3">
              <h4 className="font-bold text-slate-650 text-xs uppercase tracking-wider">Routine Schedule</h4>
              <div className="space-y-2">
                {orders.filter(o => o.priority === "ROUTINE" && o.status !== "COMPLETED" && o.status !== "REPORTED").length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No routine tests in queue.</p>
                ) : (
                  orders.filter(o => o.priority === "ROUTINE" && o.status !== "COMPLETED" && o.status !== "REPORTED").map(o => (
                    <div key={o.id} className="bg-white border border-slate-150 rounded-lg p-3 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-sm text-slate-850">{o.patientName}</p>
                        <p className="text-xs text-slate-500 font-semibold">{o.testName}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{o.orderedBy}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Order Modal ─────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-t-2xl flex justify-between items-start">
              <div>
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">{selectedOrder.id}</p>
                <h3 className="font-bold text-lg">{selectedOrder.testName}</h3>
                <p className="text-white/70 text-sm mt-0.5">{selectedOrder.patientName}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-white/20 cursor-pointer">
                <span className="text-white text-lg leading-none">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${STATUS_CONFIG[selectedOrder.status].color}`}>
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</p>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-bold border ${PRIORITY_CONFIG[selectedOrder.priority]}`}>
                    {selectedOrder.priority}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400 font-semibold">Ordered By</span><span className="text-slate-800 font-bold">{selectedOrder.orderedBy}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-semibold">Ordered At</span><span className="text-slate-800 font-bold">{new Date(selectedOrder.orderedAt).toLocaleString("en-IN")}</span></div>
                {selectedOrder.completedAt && <div className="flex justify-between"><span className="text-slate-400 font-semibold">Completed At</span><span className="text-slate-800 font-bold">{new Date(selectedOrder.completedAt).toLocaleString("en-IN")}</span></div>}
              </div>
              {selectedOrder.result && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Result / Findings</p>
                  <p className="text-sm text-emerald-800 font-medium">{selectedOrder.result}</p>
                </div>
              )}
              {selectedOrder.fileUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Uploaded Report / X-Ray</p>
                    <a href={selectedOrder.fileUrl} target="_blank" rel="noreferrer"
                      className="text-sm text-blue-700 font-semibold hover:underline truncate block">
                      View / Download File →
                    </a>
                  </div>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-slate-700">{selectedOrder.notes}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm cursor-pointer">Close</button>
                <button onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                  <Printer className="w-4 h-4" /> Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── New Order Modal ──────────────────────────────────────────────── */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-base">New Lab Order</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create a new diagnostic/lab test request</p>
              </div>
              <button onClick={() => setShowNewOrderModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer text-lg leading-none">×</button>
            </div>
            <form onSubmit={handleAddOrder} className="p-6 space-y-4">
              {[
                { label: "Patient Name *", value: newPatient, set: setNewPatient, type: "text", placeholder: "e.g. Ravi Kumar" },
                { label: "Test / Procedure *", value: newTest, set: setNewTest, type: "text", placeholder: "e.g. OPG X-Ray" },
                { label: "Ordered By (Doctor) *", value: newDoctor, set: setNewDoctor, type: "text", placeholder: "e.g. Dr. Priya Sharma" },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{f.label}</label>
                  <input type={f.type} required value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Priority</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 bg-white cursor-pointer">
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Emergency)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Notes (Optional)</label>
                <textarea rows={2} value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Any special instructions..."
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 resize-none" />
              </div>
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowNewOrderModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm cursor-pointer">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Complete Order Modal (with Cloudinary Upload) ──────────────── */}
      {completingOrderId && (() => {
        const order = orders.find(o => o.id === completingOrderId);
        if (!order) return null;
        const isEditing = order.status === "COMPLETED" || order.status === "REPORTED";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="bg-[#0f1117] rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-0.5">{order.id}</p>
                  <h3 className="font-bold text-white text-base">{isEditing ? "Edit Lab Findings" : "Complete Lab Order"}</h3>
                  <p className="text-xs text-slate-400">{order.patientName} — {order.testName}</p>
                </div>
                <button onClick={() => setCompletingOrderId(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCompleteOrder} className="p-5 space-y-5">
                {/* Results / Findings */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Results / Findings *</label>
                  <textarea
                    required
                    rows={3}
                    value={resultNotes}
                    onChange={e => setResultNotes(e.target.value)}
                    placeholder="e.g. No significant pathology detected. Periapical abscess noted at #36..."
                    className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 resize-none placeholder-slate-600"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Report / X-Ray (Optional)</label>
                  <FileUpload
                    folder="lab_reports"
                    accept="image/*,application/pdf"
                    maxSizeMB={10}
                    onUploadComplete={(url) => setResultFileUrl(url)}
                  />
                  {resultFileUrl && (
                    <p className="text-[10px] text-emerald-400 font-semibold">✓ File ready to attach to this order</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCompletingOrderId(null)}
                    className="flex-1 py-2.5 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 text-sm cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm cursor-pointer shadow-lg shadow-violet-500/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> {isEditing ? "Save Findings" : "Mark as Completed"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
