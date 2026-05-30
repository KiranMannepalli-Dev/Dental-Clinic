"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Search, Calendar, Phone, Mail, FileText, X, Edit2, 
  Check, User, ShieldAlert, Award, HeartHandshake, History,
  Plus, Trash2, Microscope, CreditCard, UploadCloud, Eye, DollarSign
} from "lucide-react";


export default function PatientsAdmin() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // EMR details modal
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit patient profile fields
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editAllergies, setEditAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Sub-Tab selection
  const [activeSubTab, setActiveSubTab] = useState<'treatments' | 'tests' | 'billing' | 'reports'>('treatments');

  // Test form states
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [testName, setTestName] = useState("");
  const [testCategory, setTestCategory] = useState("X-Ray");
  const [testCost, setTestCost] = useState("500");
  const [testResult, setTestResult] = useState("");
  const [testStatus, setTestStatus] = useState("COMPLETED");
  const [testNotes, setTestNotes] = useState("");
  const [testDate, setTestDate] = useState("");
  const [services, setServices] = useState<any[]>([]);

  // Invoice form states
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; amount: number }[]>([{ description: "", amount: 0 }]);
  const [invoiceDiscount, setInvoiceDiscount] = useState("0");
  const [invoiceTax, setInvoiceTax] = useState("0");
  const [invoiceStatus, setInvoiceStatus] = useState<'UNPAID' | 'PAID' | 'PARTIALLY_PAID'>('UNPAID');
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState("CASH");

  // Report form states
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("X_RAY");
  const [reportFileUrl, setReportFileUrl] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [uploadingReport, setUploadingReport] = useState(false);

  // Fetch Patient list
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search
      });

      const res = await fetch(`${API_URL}/admin/patients?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setPatients(data.data || []);
      if (data.meta) {
        setTotalPages(data.meta.totalPages || 1);
        setTotalItems(data.meta.total || 0);
      }
    } catch (err) {
      console.error("Error fetching patients list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/services`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setServices(data.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchServices();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  // Fetch individual patient record (EMR history)
  const fetchPatientDetail = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const patient = data.data;
        setPatientDetail(patient);
        
        // Populate edit fields
        setEditFirstName(patient.firstName || "");
        setEditLastName(patient.lastName || "");
        setEditEmail(patient.email || "");
        setEditPhone(patient.phone || "");
        setEditGender(patient.gender || "");
        setEditBloodGroup(patient.bloodGroup || "");
        setEditAllergies(patient.allergies || []);
        setEditNotes(patient.notes || "");
        setEditAddress(patient.address || "");
        
        if (patient.dateOfBirth) {
          const dobDate = new Date(patient.dateOfBirth);
          const yyyy = dobDate.getFullYear();
          const mm = String(dobDate.getMonth() + 1).padStart(2, '0');
          const dd = String(dobDate.getDate()).padStart(2, '0');
          setEditDob(`${yyyy}-${mm}-${dd}`);
        } else {
          setEditDob("");
        }
      }
    } catch (err) {
      console.error("Error fetching patient EMR details:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientDetail(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${selectedPatientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          phone: editPhone,
          gender: editGender || null,
          bloodGroup: editBloodGroup || null,
          allergies: editAllergies,
          notes: editNotes || null,
          address: editAddress || null,
          dateOfBirth: editDob ? new Date(editDob).toISOString() : null
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Medical record successfully updated!" });
        setIsEditing(false);
        fetchPatientDetail(selectedPatientId);
        fetchPatients();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to save records" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Add Allergy helper
  const handleAddAllergy = () => {
    if (newAllergy.trim() && !editAllergies.includes(newAllergy.trim())) {
      setEditAllergies([...editAllergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setEditAllergies(editAllergies.filter((_, i) => i !== index));
  };

  const handleOpenAddTest = () => {
    setTestDate(new Date().toISOString().split('T')[0]);
    setTestName("");
    setTestCost("500");
    setTestResult("");
    setTestNotes("");
    setIsAddingTest(true);
  };

  const handleOpenAddInvoice = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNumber(`INV-${yyyy}${mm}${dd}-${random}`);
    setInvoiceItems([{ description: "", amount: 0 }]);
    setInvoiceDiscount("0");
    setInvoiceTax("0");
    setIsAddingInvoice(true);
  };

  // --- EMR API Actions ---

  // Add Medical Test
  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${selectedPatientId}/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          testName,
          category: testCategory,
          cost: parseFloat(testCost) || 0,
          result: testResult || null,
          status: testStatus,
          notes: testNotes || null,
          testDate: testDate ? new Date(testDate).toISOString() : new Date().toISOString()
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Clinical test record added!" });
        setIsAddingTest(false);
        setTestName("");
        setTestResult("");
        setTestNotes("");
        fetchPatientDetail(selectedPatientId);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to add test" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  // Delete Medical Test
  const handleDeleteTest = async (testId: string) => {
    if (!selectedPatientId) return;
    if (!confirm("Delete this test record?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${selectedPatientId}/tests/${testId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Test record deleted." });
        fetchPatientDetail(selectedPatientId);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: "Failed to delete test record" });
    }
  };

  // Add Invoice
  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setFeedbackMsg(null);

    // Calculate total
    const subtotal = invoiceItems.reduce((acc, item) => acc + (item.amount || 0), 0);
    const discountVal = parseFloat(invoiceDiscount) || 0;
    const taxVal = parseFloat(invoiceTax) || 0;
    const totalVal = Math.max(0, subtotal - discountVal + taxVal);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${selectedPatientId}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          invoiceNumber,
          items: invoiceItems.filter(i => i.description),
          discount: discountVal,
          tax: taxVal,
          total: totalVal,
          paymentStatus: invoiceStatus,
          paymentMethod: invoicePaymentMethod
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Invoice generated successfully!" });
        setIsAddingInvoice(false);
        setInvoiceNumber("");
        setInvoiceItems([{ description: "", amount: 0 }]);
        setInvoiceDiscount("0");
        setInvoiceTax("0");
        fetchPatientDetail(selectedPatientId);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to create invoice" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  // Add Invoice Item Row
  const handleAddInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: "", amount: 0 }]);
  };

  // Remove Invoice Item Row
  const handleRemoveInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  // Update Invoice Item Field
  const handleInvoiceItemChange = (index: number, field: 'description' | 'amount', value: any) => {
    const updated = [...invoiceItems];
    if (field === 'amount') {
      updated[index].amount = parseFloat(value) || 0;
    } else {
      updated[index].description = value;
    }
    setInvoiceItems(updated);
  };

  // Delete Invoice
  const handleDeleteInvoice = async (invId: string) => {
    if (!selectedPatientId) return;
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${selectedPatientId}/invoices/${invId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Invoice record deleted." });
        fetchPatientDetail(selectedPatientId);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: "Failed to delete invoice" });
    }
  };

  // Update Invoice Status
  const handleUpdateInvoiceStatus = async (invId: string, currentStatus: string) => {
    if (!selectedPatientId) return;
    const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${selectedPatientId}/invoices/${invId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Invoice payment status changed to ${newStatus}!` });
        fetchPatientDetail(selectedPatientId);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: "Failed to update invoice payment state" });
    }
  };

  // Upload Report File
  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMsg({ type: 'error', text: "File is too large. Max size is 5MB." });
      return;
    }

    setUploadingReport(true);
    setFeedbackMsg(null);

    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("image", file); // Multer maps this parameter key

      const res = await fetch(`${API_URL}/admin/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        setReportFileUrl(data.url);
        if (!reportTitle) {
          setReportTitle(file.name.split('.')[0].replace(/[-_]/g, ' '));
        }
        setFeedbackMsg({ type: 'success', text: "Report document uploaded to server!" });
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Upload failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during upload." });
    } finally {
      setUploadingReport(false);
    }
  };

  // Add Report Record
  const handleAddReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !reportFileUrl) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${selectedPatientId}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: reportTitle,
          fileUrl: reportFileUrl,
          reportType,
          notes: reportNotes || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Patient report logged successfully!" });
        setIsAddingReport(false);
        setReportTitle("");
        setReportFileUrl("");
        setReportNotes("");
        fetchPatientDetail(selectedPatientId);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to log report details" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network connection error" });
    }
  };

  // Delete Report
  const handleDeleteReport = async (reportId: string) => {
    if (!selectedPatientId) return;
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/patients/${selectedPatientId}/reports/${reportId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Report removed from EMR." });
        fetchPatientDetail(selectedPatientId);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: "Failed to remove report" });
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

      {/* Filter and Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-4 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Patient Directory & Health Records (EMR)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Access patient medical files, diagnostic tests, payment invoices, and visual treatment reports.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3 pt-2">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Patient name, Email, Phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-white" 
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-all duration-200 shadow-sm cursor-pointer">
            Search
          </button>
        </form>
      </div>

      {/* Patients Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Patient Name</th>
                <th className="p-4">Contact Detail</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-center">Visits / Bookings</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs italic">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs italic">No patient records found.</td>
                </tr>
              ) : (
                patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {pat.firstName} {pat.lastName}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{pat.id}</p>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {pat.phone}</span>
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {pat.email}</span>
                      </div>
                    </td>

                    <td className="p-4 text-xs text-slate-500 font-semibold">
                      {new Date(pat.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold font-mono">
                        {pat._count?.appointments || 0}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => { setSelectedPatientId(pat.id); setActiveSubTab('treatments'); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold hover:shadow transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> View EMR file
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMR DETAIL MODAL (Overlay) */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center border border-slate-200 shadow-sm text-white font-bold text-base">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {patientDetail ? `${patientDetail.firstName} ${patientDetail.lastName}` : "Patient Medical Record"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Electronic Health Summary (EMR)</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatientId(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {isDetailLoading ? (
                <div className="col-span-3 flex flex-col items-center justify-center py-20 text-slate-400 italic text-xs animate-pulse">
                  Fetching electronic medical records...
                </div>
              ) : !patientDetail ? (
                <div className="col-span-3 text-center py-20 text-slate-400 italic text-xs">
                  Could not load patient details.
                </div>
              ) : (
                <>
                  {/* Left Column: Profile Card */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <User className="w-4 h-4 text-blue-600" /> General Profile
                        </h4>
                        {!isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 text-slate-550 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Record
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <form onSubmit={handleEditSubmit} className="space-y-3.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
                              <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white" required />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
                              <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white" required />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
                              <select value={editGender} onChange={e => setEditGender(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white cursor-pointer">
                                <option value="">Select</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Blood Group</label>
                              <select value={editBloodGroup} onChange={e => setEditBloodGroup(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white cursor-pointer">
                                <option value="">Select</option>
                                <option value="A_POSITIVE">A+</option>
                                <option value="A_NEGATIVE">A-</option>
                                <option value="B_POSITIVE">B+</option>
                                <option value="B_NEGATIVE">B-</option>
                                <option value="AB_POSITIVE">AB+</option>
                                <option value="AB_NEGATIVE">AB-</option>
                                <option value="O_POSITIVE">O+</option>
                                <option value="O_NEGATIVE">O-</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Date of Birth</label>
                            <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white cursor-pointer" />
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                              <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white" required />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white" required />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Address</label>
                            <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white" />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Drug / Clinical Allergies</label>
                            <div className="flex gap-1">
                              <input 
                                type="text" 
                                placeholder="Add allergy..." 
                                value={newAllergy}
                                onChange={e => setNewAllergy(e.target.value)}
                                className="flex-grow py-1 px-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white" 
                              />
                              <button type="button" onClick={handleAddAllergy} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg cursor-pointer">
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {editAllergies.map((all, i) => (
                                <span key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-red-50 border border-red-150 text-red-700 text-[10px] font-bold">
                                  {all}
                                  <button type="button" onClick={() => handleRemoveAllergy(i)} className="hover:text-red-950 font-bold focus:outline-none ml-0.5">×</button>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Clinical Summary Notes</label>
                            <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-650 bg-white resize-none" placeholder="Allergy details, special conditions, notes..."></textarea>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="flex-grow py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="flex-grow py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors"
                            >
                              {isSaving ? "Saving..." : "Save Record"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-3.5 text-xs text-slate-750">
                          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Gender</p>
                              <p className="font-semibold text-slate-900 mt-0.5">{patientDetail.gender || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Blood Group</p>
                              <p className="font-semibold text-slate-900 mt-0.5">{patientDetail.bloodGroup ? patientDetail.bloodGroup.replace("A_POSITIVE","A+").replace("B_POSITIVE","B+").replace("AB_POSITIVE","AB+").replace("O_POSITIVE","O+").replace("A_NEGATIVE","A-").replace("B_NEGATIVE","B-").replace("AB_NEGATIVE","AB-").replace("O_NEGATIVE","O-") : "Not specified"}</p>
                            </div>
                          </div>

                          <div className="border-b border-slate-100 pb-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Date of Birth (DOB)</p>
                            <p className="font-semibold text-slate-900 mt-0.5">
                              {patientDetail.dateOfBirth 
                                ? `${new Date(patientDetail.dateOfBirth).toLocaleDateString()} (${Math.floor((new Date().getTime() - new Date(patientDetail.dateOfBirth).getTime()) / 31557600000)} yrs old)` 
                                : "Not specified"
                              }
                            </p>
                          </div>

                          <div className="border-b border-slate-100 pb-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Address</p>
                            <p className="font-semibold text-slate-900 mt-0.5">{patientDetail.address || "No address on file"}</p>
                          </div>

                          <div className="border-b border-slate-100 pb-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Known Allergies</p>
                            {patientDetail.allergies && patientDetail.allergies.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {patientDetail.allergies.map((all: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-red-50 border border-red-150 text-red-700 text-[10px] font-bold flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3 text-red-500" /> {all}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic text-xs mt-0.5 font-medium">No recorded allergies</p>
                            )}
                          </div>

                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Clinical Summary Notes</p>
                            <p className="font-medium text-slate-700 mt-1 whitespace-pre-line bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/60 leading-relaxed">
                              {patientDetail.notes || "No patient clinical history summary notes logged."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: EMR Sub-tabs */}
                  <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-100 pb-0.5 shrink-0 bg-slate-50/30 rounded-lg p-1 gap-1">
                      <button 
                        onClick={() => { setActiveSubTab('treatments'); setIsAddingTest(false); setIsAddingInvoice(false); setIsAddingReport(false); }}
                        className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          activeSubTab === 'treatments' ? 'bg-white text-blue-650 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <History className="w-3.5 h-3.5" /> Treatments ({patientDetail.appointments?.length || 0})
                      </button>
                      <button 
                        onClick={() => { setActiveSubTab('tests'); setIsAddingTest(false); setIsAddingInvoice(false); setIsAddingReport(false); }}
                        className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          activeSubTab === 'tests' ? 'bg-white text-blue-650 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Microscope className="w-3.5 h-3.5" /> Clinical Tests ({patientDetail.medicalTests?.length || 0})
                      </button>
                      <button 
                        onClick={() => { setActiveSubTab('billing'); setIsAddingTest(false); setIsAddingInvoice(false); setIsAddingReport(false); }}
                        className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          activeSubTab === 'billing' ? 'bg-white text-blue-650 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Billing / Invoices ({patientDetail.billingInvoices?.length || 0})
                      </button>
                      <button 
                        onClick={() => { setActiveSubTab('reports'); setIsAddingTest(false); setIsAddingInvoice(false); setIsAddingReport(false); }}
                        className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          activeSubTab === 'reports' ? 'bg-white text-blue-650 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" /> Reports & Scans ({patientDetail.patientReports?.length || 0})
                      </button>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-1 space-y-4">
                      
                      {/* SUBTAB 1: TREATMENT HISTORY */}
                      {activeSubTab === 'treatments' && (
                        <div className="space-y-4">
                          {(!patientDetail.appointments || patientDetail.appointments.length === 0) ? (
                            <p className="text-xs text-slate-400 italic text-center py-10">No treatment appointments found on record.</p>
                          ) : (
                            patientDetail.appointments.map((appt: any) => (
                              <div key={appt.id} className="p-4 border border-slate-200/60 rounded-xl bg-white/70 hover:shadow-sm transition-all duration-200 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                                      {appt.bookingRef}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      Booked on {new Date(appt.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${
                                    appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' :
                                    appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-slate-50 text-slate-700 border-slate-200'
                                  }`}>
                                    {appt.status}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-700">
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Service Rendering</p>
                                    <p className="font-bold text-slate-900 mt-0.5">{appt.service?.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Doctor Specialist</p>
                                    <p className="font-semibold text-slate-900 mt-0.5">Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Date & Time</p>
                                    <p className="font-semibold text-slate-900 mt-0.5">
                                      {new Date(appt.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {appt.startTime}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/60 text-xs">
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Chief Complaint</p>
                                    <p className="font-medium text-slate-700 mt-0.5 italic">
                                      "{appt.chiefComplaint || "No complaint specified"}"
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Invoice Payment Info</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                        appt.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'
                                      }`}>
                                        {appt.paymentStatus || 'UNPAID'}
                                      </span>
                                      {appt.paymentStatus === 'PAID' && (
                                        <span className="text-[10px] text-slate-550 font-semibold uppercase tracking-wider">
                                          via {appt.paymentMethod}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* SUBTAB 2: CLINICAL TESTS */}
                      {activeSubTab === 'tests' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-slate-750 uppercase tracking-wider">Prescribed Diagnostics</h5>
                            {!isAddingTest && (
                              <button 
                                onClick={handleOpenAddTest}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Order Diagnostic Test
                              </button>
                            )}
                          </div>

                          {isAddingTest && (
                            <form onSubmit={handleAddTest} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 animate-in slide-in-from-top-2 duration-150">
                              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-xs font-bold text-slate-850">New Test Order details</span>
                                <button type="button" onClick={() => setIsAddingTest(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Test Name *</label>
                                  <input type="text" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. OPG X-Ray, Blood Glucose" className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-600" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Category *</label>
                                  <select value={testCategory} onChange={e => setTestCategory(e.target.value)} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-600 cursor-pointer">
                                    <option value="X-Ray">Dental X-Ray (OPG/IOPA)</option>
                                    <option value="CBCT Scan">CBCT 3D Scan</option>
                                    <option value="Blood Test">Blood Panel Test</option>
                                    <option value="Biopsy">Oral Biopsy</option>
                                    <option value="Other">Other Diagnostic</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Test Date *</label>
                                  <input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-600 cursor-pointer" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Amount Cost (₹) *</label>
                                  <input type="number" value={testCost} onChange={e => setTestCost(e.target.value)} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-600" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Diagnostic Status</label>
                                  <select value={testStatus} onChange={e => setTestStatus(e.target.value)} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white cursor-pointer">
                                    <option value="PENDING">Pending results</option>
                                    <option value="COMPLETED">Completed</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Result Metrics</label>
                                  <input type="text" value={testResult} onChange={e => setTestResult(e.target.value)} placeholder="e.g. Normal, Bone loss" className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none" />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Clinical Observations</label>
                                <textarea value={testNotes} onChange={e => setTestNotes(e.target.value)} rows={2} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white resize-none" placeholder="Notes..."></textarea>
                              </div>
                              <div className="flex justify-end gap-2 pt-1.5">
                                <button type="button" onClick={() => setIsAddingTest(false)} className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer">Save Diagnostic</button>
                              </div>
                            </form>
                          )}

                          {(!patientDetail.medicalTests || patientDetail.medicalTests.length === 0) ? (
                            <p className="text-xs text-slate-400 italic text-center py-10">No diagnostic tests registered for this patient.</p>
                          ) : (
                            <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white/50">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                                    <th className="p-3">Test Detail</th>
                                    <th className="p-3">Cost Amount</th>
                                    <th className="p-3">Result Info</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150">
                                  {patientDetail.medicalTests.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-slate-55/20 transition-colors">
                                      <td className="p-3">
                                        <p className="font-bold text-slate-900">{t.testName}</p>
                                        <p className="text-[10px] text-slate-450 font-semibold">{t.category} • {new Date(t.testDate).toLocaleDateString()}</p>
                                        {t.notes && <p className="text-[10px] text-slate-500 italic mt-0.5">Obs: {t.notes}</p>}
                                      </td>
                                      <td className="p-3 font-extrabold text-slate-800">
                                        ₹{parseFloat(t.cost).toLocaleString()}
                                      </td>
                                      <td className="p-3 font-medium text-slate-700">
                                        {t.result || <span className="text-slate-400 italic">Awaiting lab</span>}
                                      </td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wider ${
                                          t.status === 'COMPLETED' ? 'bg-green-55/80 text-green-800' : 'bg-amber-55/80 text-amber-800'
                                        }`}>
                                          {t.status}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right">
                                        <button onClick={() => handleDeleteTest(t.id)} className="p-1 text-slate-400 hover:text-red-650 cursor-pointer">
                                          <Trash2 className="w-3.5 h-3.5"/>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUBTAB 3: BILLING & INVOICES */}
                      {activeSubTab === 'billing' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-slate-755 uppercase tracking-wider">Hospital Invoice Ledger</h5>
                            {!isAddingInvoice && (
                              <button 
                                onClick={handleOpenAddInvoice}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Generate Billing Receipt
                              </button>
                            )}
                          </div>

                          {isAddingInvoice && (
                            <form onSubmit={handleAddInvoice} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2 duration-150">
                              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-xs font-bold text-slate-850">New Invoice Breakdown</span>
                                <button type="button" onClick={() => setIsAddingInvoice(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Invoice ID *</label>
                                  <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g. INV-2026-0091" className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Status</label>
                                  <select value={invoiceStatus} onChange={e => setInvoiceStatus(e.target.value as any)} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white cursor-pointer">
                                    <option value="UNPAID">Unpaid</option>
                                    <option value="PAID">Paid in Full</option>
                                    <option value="PARTIALLY_PAID">Partially Paid</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Method</label>
                                  <select value={invoicePaymentMethod} onChange={e => setInvoicePaymentMethod(e.target.value)} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white cursor-pointer">
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Debit / Credit Card</option>
                                    <option value="UPI">UPI (GPay/PhonePe)</option>
                                    <option value="INSURANCE">Insurance coverage</option>
                                  </select>
                                </div>
                              </div>

                              {/* Itemized list creator */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block">Billing line items</label>
                                {invoiceItems.map((item, idx) => (
                                  <div key={idx} className="flex gap-2 items-center w-full">
                                    {/* Dropdown to select service */}
                                    <select
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "CUSTOM") {
                                          handleInvoiceItemChange(idx, 'description', "");
                                          handleInvoiceItemChange(idx, 'amount', 0);
                                        } else {
                                          const srv = services.find(s => s.id === val);
                                          if (srv) {
                                            handleInvoiceItemChange(idx, 'description', srv.name);
                                            handleInvoiceItemChange(idx, 'amount', srv.priceMin ? parseFloat(srv.priceMin) : 0);
                                          }
                                        }
                                      }}
                                      className="py-1.5 px-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none cursor-pointer w-40 shrink-0"
                                    >
                                      <option value="CUSTOM">✍ Custom Item</option>
                                      {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                      ))}
                                    </select>

                                    <input 
                                      type="text" 
                                      placeholder="Treatment / test item description" 
                                      value={item.description}
                                      onChange={e => handleInvoiceItemChange(idx, 'description', e.target.value)}
                                      className="flex-grow py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                                      required
                                    />
                                    <div className="relative w-28 shrink-0">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">₹</span>
                                      <input 
                                        type="number" 
                                        placeholder="Price" 
                                        value={item.amount || ""}
                                        onChange={e => handleInvoiceItemChange(idx, 'amount', e.target.value)}
                                        className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                                        required
                                      />
                                    </div>
                                    {invoiceItems.length > 1 && (
                                      <button type="button" onClick={() => handleRemoveInvoiceItem(idx)} className="p-1 text-red-500 hover:text-red-750 transition-colors">
                                        <Trash2 className="w-4 h-4"/>
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button type="button" onClick={handleAddInvoiceItem} className="text-xs font-bold text-blue-650 hover:text-blue-800 flex items-center gap-1 mt-1 shrink-0 cursor-pointer">
                                  <Plus className="w-3.5 h-3.5"/> Add service line
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Discount (₹)</label>
                                    <input type="number" value={invoiceDiscount} onChange={e => setInvoiceDiscount(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tax Amount (₹)</label>
                                    <input type="number" value={invoiceTax} onChange={e => setInvoiceTax(e.target.value)} className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none" />
                                  </div>
                                </div>
                                <div className="flex flex-col items-end justify-center bg-slate-100/60 rounded-xl p-3 border border-slate-200/40">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Grand Total</span>
                                  <span className="text-lg font-black text-slate-900 font-mono">
                                    ₹{Math.max(0, invoiceItems.reduce((acc, item) => acc + (item.amount || 0), 0) - (parseFloat(invoiceDiscount) || 0) + (parseFloat(invoiceTax) || 0)).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsAddingInvoice(false)} className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer">Save Invoice</button>
                              </div>
                            </form>
                          )}

                          {(!patientDetail.billingInvoices || patientDetail.billingInvoices.length === 0) ? (
                            <p className="text-xs text-slate-400 italic text-center py-10">No invoice bills created for this patient.</p>
                          ) : (
                            <div className="space-y-4">
                              {patientDetail.billingInvoices.map((inv: any) => (
                                <div key={inv.id} className="p-4 border border-slate-200 rounded-xl bg-white/70 hover:shadow-sm transition-all duration-200 space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-100/60 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                                        {inv.invoiceNumber}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-semibold">
                                        Issued {new Date(inv.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <button 
                                        onClick={() => handleUpdateInvoiceStatus(inv.id, inv.paymentStatus)}
                                        className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                          inv.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                        }`}
                                      >
                                        {inv.paymentStatus}
                                      </button>
                                      {inv.paymentMethod && (
                                        <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                                          via {inv.paymentMethod}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Item lines details */}
                                  <div className="space-y-1.5 text-xs text-slate-700 font-medium pl-1">
                                    {inv.items && Array.isArray(inv.items) && inv.items.map((it: any, i: number) => (
                                      <div key={i} className="flex justify-between">
                                        <span>• {it.description}</span>
                                        <span className="font-mono">₹{parseFloat(it.amount).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-[10px] text-slate-400 font-bold uppercase">
                                    <div>
                                      Discount: <span className="font-mono text-slate-650">₹{parseFloat(inv.discount).toLocaleString()}</span>
                                    </div>
                                    <div>
                                      Tax: <span className="font-mono text-slate-650">₹{parseFloat(inv.tax).toLocaleString()}</span>
                                    </div>
                                    <div className="text-right text-xs font-black text-slate-900">
                                      Total Paid: <span className="font-mono text-blue-650">₹{parseFloat(inv.total).toLocaleString()}</span>
                                    </div>
                                  </div>

                                  <div className="flex justify-end pt-1">
                                    <button onClick={() => handleDeleteInvoice(inv.id)} className="text-[10px] font-bold text-red-600 hover:text-red-750 flex items-center gap-0.5 cursor-pointer">
                                      <Trash2 className="w-3 h-3"/> Void invoice
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUBTAB 4: REPORTS & SCAN DRAWER */}
                      {activeSubTab === 'reports' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-slate-755 uppercase tracking-wider">Diagnostic Scan Drawer</h5>
                            {!isAddingReport && (
                              <button 
                                onClick={() => setIsAddingReport(true)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Upload Diagnostic Report
                              </button>
                            )}
                          </div>

                          {isAddingReport && (
                            <form onSubmit={handleAddReportSubmit} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3.5 animate-in slide-in-from-top-2 duration-150">
                              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-xs font-bold text-slate-850">Log Medical Report file</span>
                                <button type="button" onClick={() => setIsAddingReport(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                              </div>

                              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-center flex-col gap-2">
                                <UploadCloud className="w-8 h-8 text-slate-400"/>
                                <label className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                                  {uploadingReport ? "Uploading..." : "Select File (PDF or Image)"}
                                  <input 
                                    type="file" 
                                    accept="image/*,application/pdf" 
                                    onChange={handleReportUpload} 
                                    disabled={uploadingReport}
                                    className="hidden" 
                                  />
                                </label>
                                <p className="text-[9px] text-slate-400 font-medium">Supports scanned JPEG/PNG/WebP or PDF files (max 5MB).</p>
                              </div>

                              {reportFileUrl && (
                                <div className="p-2.5 rounded-lg border border-green-150 bg-green-50/30 text-[11px] text-green-800 font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                                  ✓ Uploaded: {reportFileUrl}
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Document Title *</label>
                                  <input type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)} placeholder="e.g. Panoramic X-Ray, Lab Report" className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">Report Category</label>
                                  <select value={reportType} onChange={e => setReportType(e.target.value)} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white cursor-pointer">
                                    <option value="X_RAY">X-Ray (Radiology)</option>
                                    <option value="LAB_REPORT">Lab Blood Report</option>
                                    <option value="PRESCRIPTION">Medical Prescription</option>
                                    <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Observations / Summary</label>
                                <textarea value={reportNotes} onChange={e => setReportNotes(e.target.value)} rows={2} className="py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white resize-none" placeholder="Notes..."></textarea>
                              </div>

                              <div className="flex justify-end gap-2 pt-1.5">
                                <button type="button" onClick={() => setIsAddingReport(false)} className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer">Cancel</button>
                                <button type="submit" disabled={!reportFileUrl} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50">Save report file</button>
                              </div>
                            </form>
                          )}

                          {(!patientDetail.patientReports || patientDetail.patientReports.length === 0) ? (
                            <p className="text-xs text-slate-400 italic text-center py-10">No diagnostic files logged in report drawer.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {patientDetail.patientReports.map((r: any) => (
                                <div key={r.id} className="p-3 border border-slate-200 rounded-xl bg-white/70 flex gap-3 hover:shadow-sm transition-all duration-200">
                                  {/* Preview box */}
                                  <div className="w-16 h-16 bg-slate-100 border border-slate-200/50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                                    {r.fileUrl.endsWith('.pdf') ? (
                                      <FileText className="w-7 h-7 text-red-500" />
                                    ) : (
                                      <img src={r.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                                    )}
                                  </div>

                                  {/* Details */}
                                  <div className="flex-grow flex flex-col justify-between overflow-hidden">
                                    <div>
                                      <p className="font-bold text-slate-900 text-xs truncate" title={r.title}>{r.title}</p>
                                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200/50 text-slate-600 text-[8px] font-bold tracking-wider">
                                        {r.reportType}
                                      </span>
                                      {r.notes && <p className="text-[10px] text-slate-500 truncate mt-0.5 italic">{r.notes}</p>}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100">
                                      <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] font-extrabold text-blue-650 hover:text-blue-850 flex items-center gap-0.5 cursor-pointer">
                                        <Eye className="w-3.5 h-3.5"/> View File
                                      </a>
                                      <button onClick={() => handleDeleteReport(r.id)} className="text-[10px] font-bold text-slate-400 hover:text-red-650 cursor-pointer">
                                        <Trash2 className="w-3.5 h-3.5"/>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedPatientId(null)}
                className="px-6 py-2 bg-slate-950 text-white rounded-xl font-bold text-xs hover:bg-slate-900 cursor-pointer shadow-sm"
              >
                Close Records File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
