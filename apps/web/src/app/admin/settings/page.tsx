"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, Save, Globe, Share2, Calendar, MapPin, 
  Trash2, Plus, Info, Check, X, ShieldAlert
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
}

export default function SettingsAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'seo' | 'holidays'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // General Settings Form Fields
  const [clinicName, setClinicName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [mapLat, setMapLat] = useState(17.3850);
  const [mapLng, setMapLng] = useState(78.4867);
  const [analyticsId, setAnalyticsId] = useState("");

  // Social Links Form Fields
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");

  // SEO Form Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Holidays state
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [holidayType, setHolidayType] = useState("holiday");
  const [holidayLoading, setHolidayLoading] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      // Fetch site settings
      const settingsRes = await fetch(`${API_URL}/admin/settings`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (settingsRes.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.data) {
        const s = settingsData.data;
        setClinicName(s.clinicName || "");
        setTagline(s.tagline || "");
        setPhone(s.phone || "");
        setEmergencyPhone(s.emergencyPhone || "");
        setEmail(s.email || "");
        setAddress(s.address || "");
        setCity(s.city || "");
        setMapLat(s.mapLat || 17.3850);
        setMapLng(s.mapLng || 78.4867);
        setAnalyticsId(s.analyticsId || "");

        // Social
        const sl = s.socialLinks || {};
        setWhatsapp(sl.whatsapp || "");
        setInstagram(sl.instagram || "");
        setFacebook(sl.facebook || "");
        setYoutube(sl.youtube || "");

        // SEO
        setSeoTitle(s.seoTitle || "");
        setSeoDescription(s.seoDescription || "");
      }

      // Fetch holidays list
      const holidaysRes = await fetch(`${API_URL}/admin/settings/holidays`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const holidaysData = await holidaysRes.json();
      setHolidays(holidaysData.data || []);

    } catch (err) {
      console.error("Error fetching settings data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [router]);

  // Submit Site Settings Form (General, Social, SEO)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      
      const payload = {
        clinicName,
        tagline: tagline || null,
        phone,
        emergencyPhone,
        email,
        address,
        city,
        mapLat: parseFloat(mapLat.toString()),
        mapLng: parseFloat(mapLng.toString()),
        socialLinks: {
          whatsapp: whatsapp || null,
          instagram: instagram || null,
          facebook: facebook || null,
          youtube: youtube || null
        },
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        analyticsId: analyticsId || null
      };

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Site settings updated successfully!" });
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to save settings." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error occurred." });
    }
  };

  // Add Holiday closure
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayName) return;

    setHolidayLoading(true);
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/settings/holidays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: holidayDate,
          name: holidayName,
          type: holidayType
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Holiday closure added to calendar!" });
        setHolidayDate("");
        setHolidayName("");
        // Reload list
        const hRes = await fetch(`${API_URL}/admin/settings/holidays`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const hData = await hRes.json();
        setHolidays(hData.data || []);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to register holiday." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to connect to backend." });
    } finally {
      setHolidayLoading(false);
    }
  };

  // Remove Holiday closure
  const handleDeleteHoliday = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" closure?`)) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/settings/holidays/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Closure removed successfully." });
        setHolidays(h => h.filter(x => x.id !== id));
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Deletion failed." });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner alert */}
      {feedbackMsg && (
        <div className={`p-4 rounded-md border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Tabs navigation list */}
      <div className="flex border-b border-slate-200 pb-1">
        <button 
          onClick={() => setActiveTab('general')}
          className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> General Profile
        </button>
        <button 
          onClick={() => setActiveTab('social')}
          className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'social' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" /> Social Accounts
        </button>
        <button 
          onClick={() => setActiveTab('seo')}
          className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'seo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Search & SEO
        </button>
        <button 
          onClick={() => setActiveTab('holidays')}
          className={`pb-2.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'holidays' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Holiday Calendar
        </button>
      </div>

      {/* TABS CONTAINER */}
      <div className="bg-white rounded-md border border-slate-200 p-6 shadow-sm">
        
        {/* TABS 1, 2, 3: Site Settings Form */}
        {(activeTab === 'general' || activeTab === 'social' || activeTab === 'seo') && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Clinic Location & Contact details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Clinic Name <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="text" required value={clinicName} onChange={e => setClinicName(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Tagline / Motto</label>
                    <input 
                      type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Phone number <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="text" required value={phone} onChange={e => setPhone(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Emergency Hot-Line <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="text" required value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Contact Email <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">Physical Address <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="text" required value={address} onChange={e => setAddress(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">City <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="text" required value={city} onChange={e => setCity(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Google Map Latitude <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="number" step="0.000001" required value={mapLat} onChange={e => setMapLat(parseFloat(e.target.value) || 0)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Google Map Longitude <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="number" step="0.000001" required value={mapLng} onChange={e => setMapLng(parseFloat(e.target.value) || 0)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Google Analytics Tracking ID</label>
                    <input 
                      type="text" placeholder="G-XXXXXXXXXX" value={analyticsId} onChange={e => setAnalyticsId(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" /> Social Network Handles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">WhatsApp Link</label>
                    <input 
                      type="text" placeholder="https://wa.me/919999999999" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Instagram URL</label>
                    <input 
                      type="text" placeholder="https://instagram.com/username" value={instagram} onChange={e => setInstagram(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Facebook Page URL</label>
                    <input 
                      type="text" placeholder="https://facebook.com/pagename" value={facebook} onChange={e => setFacebook(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">YouTube Channel URL</label>
                    <input 
                      type="text" placeholder="https://youtube.com/@channel" value={youtube} onChange={e => setYoutube(e.target.value)}
                      className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" /> Search Engine Optimizations (SEO)
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Default HTML Title (SEO Title)</label>
                  <input 
                    type="text" placeholder="e.g. Heshvitha Multi Speciality Dental Clinic | Hyderabad Care" value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Default Meta Description</label>
                  <textarea 
                    rows={4} placeholder="Enter a descriptive summary about the clinic for Google search result listing..." value={seoDescription} onChange={e => setSeoDescription(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
            )}

            {/* Submit changes bar */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>

          </form>
        )}

        {/* TAB 4: Holiday closures schedule */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            
            {/* Split layout: add form and current holidays list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: add closure date */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Add Closure Date
                </h4>
                <form onSubmit={handleAddHoliday} className="space-y-4 p-4 rounded border border-slate-200 bg-slate-50/50">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Closure Date <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="date" required value={holidayDate} onChange={e => setHolidayDate(e.target.value)}
                      className="py-1.5 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Label / Name <span className="text-red-555 font-bold">*</span></label>
                    <input 
                      type="text" required placeholder="e.g. Independence Day" value={holidayName} onChange={e => setHolidayName(e.target.value)}
                      className="py-1.5 px-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Closure Type</label>
                    <select 
                      value={holidayType} onChange={e => setHolidayType(e.target.value)}
                      className="py-1.5 px-3 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="holiday">Official Holiday</option>
                      <option value="maintenance">Clinic Maintenance</option>
                      <option value="emergency">Emergency Closure</option>
                    </select>
                  </div>

                  <button 
                    type="submit" disabled={holidayLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> {holidayLoading ? 'Registering...' : 'Register Closure'}
                  </button>
                </form>
              </div>

              {/* Right Column: holidays listing */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Active closures calendar</h4>
                <p className="text-xs text-slate-500">During registered closures, users cannot select appointment slots on the website booking pages.</p>
                
                <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {holidays.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs italic">
                        No closures registered. Clinic is running on normal schedules.
                      </div>
                    ) : (
                      holidays.map(item => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                              {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              item.type === 'maintenance' 
                                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                                : item.type === 'emergency'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : 'bg-slate-105 border-slate-350 text-slate-700'
                            }`}>
                              {item.type}
                            </span>
                            <button 
                              onClick={() => handleDeleteHoliday(item.id, item.name)}
                              className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded cursor-pointer transition-colors"
                              title="Delete holiday"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
