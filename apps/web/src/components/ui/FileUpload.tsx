"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, ShieldAlert } from "lucide-react";
import { API_URL } from "@/lib/api";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  folder?: string;
  maxSizeMB?: number;
  accept?: string; // e.g. "image/*,application/pdf"
}

export function FileUpload({
  onUploadComplete,
  folder = "dental_clinic",
  maxSizeMB = 10,
  accept = "image/*,application/pdf",
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    // Size check
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      setStatus("error");
      return false;
    }
    return true;
  };

  const uploadFile = async (selectedFile: File) => {
    setStatus("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("No authorization token found. Please log in.");

      const res = await fetch(`${API_URL}/admin/upload?folder=${folder}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to upload file");
      }

      const url = data.data.url;
      setUploadedUrl(url);
      setStatus("success");
      onUploadComplete(url);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during upload.");
      setStatus("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        uploadFile(selectedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        uploadFile(selectedFile);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setFile(null);
    setUploadedUrl("");
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="w-full">
      {status === "idle" && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${dragActive 
              ? "border-blue-500 bg-blue-500/5 shadow-inner" 
              : "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-900/10"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 mb-1">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-white">Drag & drop your file here</p>
            <p className="text-xs text-slate-500">
              or <span className="text-blue-400 hover:underline">browse files</span> from your device
            </p>
            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider font-semibold">
              PDF or Images up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {status === "uploading" && (
        <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{file?.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Uploading report to secure cloud storage...</p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="border border-emerald-500/20 rounded-xl p-5 bg-emerald-500/5 flex items-center gap-4 relative group">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{file?.name}</p>
            <a 
              href={uploadedUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              <FileText className="w-3 h-3" /> View Uploaded Document
            </a>
          </div>
          <button
            onClick={clearFile}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="border border-red-500/20 rounded-xl p-5 bg-red-500/5 flex items-center gap-4 relative">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Upload Failed</p>
            <p className="text-[10px] text-red-400 mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={clearFile}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
