"use client";

import { useEffect, useState } from "react";

interface DataFreshnessProps {
  lastRefreshed?: Date;
}

export default function DataFreshness({ lastRefreshed }: DataFreshnessProps) {
  const [display, setDisplay] = useState<{ text: string; color: string }>({ text: "", color: "bg-emerald-500" });

  useEffect(() => {
    function compute() {
      if (lastRefreshed) {
        const seconds = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
        if (seconds < 60) {
          return { text: "Just now", color: "bg-emerald-500" };
        }
        const minutes = Math.floor(seconds / 60);
        const color = minutes <= 5 ? "bg-emerald-500" : minutes <= 10 ? "bg-amber-500" : "bg-red-500";
        return { text: `${minutes}m ago`, color };
      } else {
        const now = new Date();
        const minutes = (now.getMinutes() % 15) + 1;
        const color = minutes <= 5 ? "bg-emerald-500" : minutes <= 10 ? "bg-amber-500" : "bg-red-500";
        return { text: `${minutes}m ago`, color };
      }
    }

    setDisplay(compute());

    if (lastRefreshed) {
      const id = setInterval(() => setDisplay(compute()), 15000);
      return () => clearInterval(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastRefreshed]);

  if (!display.text) return null;

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
      <div className={`w-1.5 h-1.5 rounded-full ${display.color}`} />
      {display.text}
    </div>
  );
}
