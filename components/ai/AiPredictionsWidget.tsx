"use client";

import { useAnomalies } from "./AnomalyContext";
import StatusBadge from "@/components/widgets/shared/StatusBadge";

const categoryIcon: Record<string, string> = {
  sla: "ri-shield-check-line",
  cost: "ri-money-euro-circle-line",
  capacity: "ri-server-line",
};

export default function AiPredictionsWidget() {
  const { predictions, loading } = useAnomalies();

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-3/4" />
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-5/6" />
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-2/3" />
      </div>
    );
  }

  if (predictions.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No predictions at this time.</p>;
  }

  return (
    <div className="space-y-4">
      {predictions.map((p) => (
        <div key={p.id} className="flex items-start gap-3">
          <i className={`${categoryIcon[p.category] ?? "ri-lightbulb-line"} text-lg text-gray-400 dark:text-gray-500 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.title}</p>
              <StatusBadge
                label={p.confidence}
                variant={p.confidence === "high" ? "danger" : p.confidence === "medium" ? "warning" : "neutral"}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{p.description}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{p.timeframe}</p>
          </div>
        </div>
      ))}
      <p className="text-[10px] text-gray-400 dark:text-gray-500">Powered by watsonx.ai</p>
    </div>
  );
}
