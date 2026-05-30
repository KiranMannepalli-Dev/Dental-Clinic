"use client";
import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Star, Trash2, Check, X, ShieldCheck, 
  MessageSquare, User, Filter, AlertTriangle
} from "lucide-react";


interface Review {
  id: string;
  patientId: string;
  doctorId?: string;
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  isPublished: boolean;
  source: string;
  createdAt: string;
  patient?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  doctor?: {
    firstName: string;
    lastName: string;
  };
}

export default function ReviewsAdmin() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filters State
  const [ratingFilter, setRatingFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/admin/reviews`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [router]);

  // Update Review toggles
  const handleUpdateReview = async (id: string, updates: any, successLabel: string) => {
    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: successLabel });
        fetchReviews();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Failed to update review" });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error occurred." });
    }
  };

  // Delete Review
  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action is permanent.")) return;

    setFeedbackMsg(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: "Review deleted successfully." });
        fetchReviews();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || "Deletion failed." });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Network error during deletion." });
    }
  };

  // Render Stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-3.5 h-3.5 shrink-0 ${
              star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  // Apply filters locally for rapid updates
  const filteredReviews = reviews.filter(rev => {
    const matchesRating = ratingFilter === "all" || rev.rating.toString() === ratingFilter;
    let matchesPublish = true;
    if (publishFilter === "published") matchesPublish = rev.isPublished;
    else if (publishFilter === "pending") matchesPublish = !rev.isPublished;
    else if (publishFilter === "verified") matchesPublish = rev.isVerified;

    return matchesRating && matchesPublish;
  });

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Moderate patient reviews, verify clinic visit checks, approve public display, or remove spam testimonials.</p>
        </div>
      </div>

      {/* Alerts */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          feedbackMsg.type === 'success' ? 'bg-green-50/80 backdrop-blur-sm text-green-800 border-green-200' : 'bg-red-50/80 backdrop-blur-sm text-red-800 border-red-200'
        }`}>
          <span className="font-medium">{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline cursor-pointer hover:text-slate-900">Dismiss</button>
        </div>
      )}

      {/* Filters Board */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider">Filters:</span>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-550">Rating</span>
            <select 
              value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none bg-white cursor-pointer"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-550">Status</span>
            <select 
              value={publishFilter} onChange={e => setPublishFilter(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending">Pending Approval</option>
              <option value="verified">Verified Patients Only</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Showing {filteredReviews.length} testimonials
        </div>
      </div>

      {/* Main Reviews List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs italic">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs italic bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60">
          No matching reviews found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              
              {/* Review Details Area */}
              <div className="space-y-3 flex-grow max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Rating block */}
                  {renderStars(rev.rating)}

                  {/* Verification check */}
                  {rev.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold border border-green-200 rounded-lg uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600"/> Verified Visit
                    </span>
                  )}

                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-xs text-slate-450 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-xs text-slate-450 uppercase font-bold tracking-wider font-mono">Source: {rev.source}</span>
                </div>

                {/* Content */}
                <div>
                  {rev.title && <h4 className="font-bold text-slate-900 text-sm mb-1">{rev.title}</h4>}
                  <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line font-medium">"{rev.content}"</p>
                </div>

                {/* Patient and doctor identifiers */}
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-505 border-t border-slate-150/60 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Patient: <strong className="text-slate-800">{rev.patient?.firstName} {rev.patient?.lastName}</strong> ({rev.patient?.email})
                  </span>
                  {rev.doctor && (
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      Assigned Doctor: <strong className="text-slate-800">Dr. {rev.doctor?.firstName} {rev.doctor?.lastName}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Status Actions Panel */}
              <div className="shrink-0 flex md:flex-col gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/50 items-end self-end md:self-start">
                
                {/* Publish Toggle Button */}
                <button
                  onClick={() => handleUpdateReview(rev.id, { isPublished: !rev.isPublished }, `Review ${!rev.isPublished ? 'published' : 'hidden'}!`)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 w-full justify-center text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                    rev.isPublished 
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm' 
                      : 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-sm shadow-green-500/10'
                  }`}
                >
                  {rev.isPublished ? (
                    <><X className="w-3.5 h-3.5 text-slate-500" /> Hide</>
                  ) : (
                    <><Check className="w-3.5 h-3.5 text-white" /> Approve</>
                  )}
                </button>

                {/* Verify Toggle Button */}
                <button
                  onClick={() => handleUpdateReview(rev.id, { isVerified: !rev.isVerified }, `Review visit verification changed!`)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase rounded border transition-colors cursor-pointer ${
                    rev.isVerified 
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {rev.isVerified ? 'Unverify visit' : 'Verify visit'}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase rounded border bg-red-50 hover:bg-red-100 text-red-650 border-red-200 transition-colors cursor-pointer"
                  title="Remove spam review"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
