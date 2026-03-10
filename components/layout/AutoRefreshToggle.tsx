"use client";

import { useEffect, useRef, useState } from "react";
import { RiLoopRightLine } from "@remixicon/react";
import { useRefresh } from "@/lib/refresh-context";

const OPTIONS: { label: string; value: number | null }[] = [
  { label: "Off", value: null },
  { label: "30s", value: 30000 },
  { label: "1m", value: 60000 },
  { label: "5m", value: 300000 },
];

export default function AutoRefreshToggle() {
  const { autoInterval, setAutoInterval } = useRefresh();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const activeLabel = OPTIONS.find((o) => o.value === autoInterval)?.label ?? "Off";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-[#262633] hover:bg-gray-200 dark:hover:bg-[#2E2E3D] rounded-lg transition-colors"
        title="Auto-refresh interval"
      >
        <RiLoopRightLine
          className={`w-3.5 h-3.5 ${autoInterval ? "animate-spin" : ""}`}
          style={autoInterval ? { animationDuration: "2s" } : undefined}
        />
        <span>{activeLabel}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-28 bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] rounded-lg shadow-lg z-50 py-1 overflow-hidden">
          {OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => {
                setAutoInterval(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                opt.value === autoInterval
                  ? "text-magenta font-medium bg-magenta/5"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#262633]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
