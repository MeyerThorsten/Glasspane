"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getVerticalBenchmark } from "@/lib/services/vertical-service";
import { BenchmarkStatus, VerticalBenchmarkResult } from "@/types";

const statusStyles: Record<BenchmarkStatus, { label: string; className: string }> = {
  ahead: { label: "Ahead", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  "on-par": { label: "On par", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  behind: { label: "Behind", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

export default function VerticalBenchmark() {
  const { customer } = useCustomer();
  const [data, setData] = useState<VerticalBenchmarkResult | null>(null);

  useEffect(() => {
    if (!customer) return;
    getVerticalBenchmark(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.profile.label} benchmark
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data.aheadCount} ahead · {data.behindCount} behind industry targets
          </p>
        </div>
        <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
          {data.profile.complianceFrameworks.map((f) => (
            <span
              key={f.id}
              title={f.description}
              className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-[#262633] dark:text-gray-300"
            >
              {f.name}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {data.metrics.map((m) => {
          const style = statusStyles[m.status];
          return (
            <div key={m.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">{m.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                  {m.value.toFixed(m.unit === "%" && m.target > 99 ? 3 : 1)}
                  <span className="text-gray-400 font-normal"> / {m.target}{m.unit === "pts" ? "" : m.unit}</span>
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${style.className}`}>
                  {style.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
