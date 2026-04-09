"use client";

import { useAnomalies } from "./AnomalyContext";
import type { AnomalySeverity } from "@/types";

const severityDot: Record<AnomalySeverity, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

const severityLabel: Record<AnomalySeverity, string> = {
  critical: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
};

export default function AiAnomaliesWidget() {
  const { anomalies, loading, providerLabel } = useAnomalies();

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-3/4" />
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-5/6" />
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-2/3" />
      </div>
    );
  }

  if (anomalies.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No anomalies detected.</p>;
  }

  const sorted = [...anomalies].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-3">
      {sorted.map((a) => (
        <div key={a.id} className="flex items-start gap-3">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot[a.severity]}`} />
          <div>
            <p className={`text-sm font-medium ${severityLabel[a.severity]}`}>{a.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.description}</p>
          </div>
        </div>
      ))}
      <p className="text-[10px] text-gray-400 dark:text-gray-500">Powered by {providerLabel}</p>
    </div>
  );
}
