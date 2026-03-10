"use client";

import { useState, useRef, useEffect } from "react";
import { exportVisualSnapshot, exportDataReport } from "@/lib/export-utils";

interface ExportMenuProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  viewName: string;
  customerName: string;
}

export default function ExportMenu({ gridRef, viewName, customerName }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleVisualSnapshot() {
    if (!gridRef.current) return;
    setOpen(false);
    setIsExporting(true);
    try {
      await exportVisualSnapshot(gridRef.current, {
        viewName,
        customerName,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
    } finally {
      setIsExporting(false);
    }
  }

  function handleDataReport() {
    setOpen(false);
    exportDataReport();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isExporting}
        className="relative p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        aria-label="Export dashboard"
        title="Export dashboard"
      >
        {isExporting ? (
          <svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <i className="ri-download-line" style={{ fontSize: "1.25rem", lineHeight: 1 }} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={handleVisualSnapshot}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#262633] transition-colors flex items-center gap-2"
          >
            <i className="ri-file-pdf-line text-base" />
            Visual Snapshot (PDF)
          </button>
          <button
            onClick={handleDataReport}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#262633] transition-colors flex items-center gap-2"
          >
            <i className="ri-printer-line text-base" />
            Data Report (Print)
          </button>
        </div>
      )}
    </div>
  );
}
