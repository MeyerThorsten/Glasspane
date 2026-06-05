"use client";

import { useEffect, useState } from "react";

interface DataFreshnessProps {
  lastRefreshed?: Date;
}

export default function DataFreshness({ lastRefreshed }: DataFreshnessProps) {
  const [now, setNow] = useState(() => Date.now());

  function computeDisplay() {
    if (lastRefreshed) {
      const seconds = Math.floor((now - lastRefreshed.getTime()) / 1000);
      if (seconds < 60) {
        return { text: "Just now", color: "bg-emerald-500" };
      }
      const minutes = Math.floor(seconds / 60);
      const color = minutes <= 5 ? "bg-emerald-500" : minutes <= 10 ? "bg-amber-500" : "bg-red-500";
      return { text: `${minutes}m ago`, color };
    }

    const minutes = (new Date(now).getMinutes() % 15) + 1;
    const color = minutes <= 5 ? "bg-emerald-500" : minutes <= 10 ? "bg-amber-500" : "bg-red-500";
    return { text: `${minutes}m ago`, color };
  }

  useEffect(() => {
    if (lastRefreshed) {
      const id = setInterval(() => setNow(Date.now()), 15000);
      return () => clearInterval(id);
    }
  }, [lastRefreshed]);

  const display = computeDisplay();

  if (!display.text) return null;

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
      <div className={`w-1.5 h-1.5 rounded-full ${display.color}`} />
      {display.text}
    </div>
  );
}
