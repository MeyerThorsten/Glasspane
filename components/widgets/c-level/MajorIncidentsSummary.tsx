"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getIncidentSummary } from "@/lib/services/incident-service";
import { BarList } from "@tremor/react";
import { IncidentSummary } from "@/types";

const severityColors: Record<string, string> = {
  P1: "red",
  P2: "orange",
  P3: "amber",
  P4: "blue",
};

export default function MajorIncidentsSummary() {
  const { customer } = useCustomer();
  const [summary, setSummary] = useState<IncidentSummary[]>([]);

  useEffect(() => {
    if (!customer) return;
    getIncidentSummary(customer.id).then(setSummary);
  }, [customer]);

  if (summary.length === 0) return <div />;

  const totalOpen = summary.reduce((sum, s) => sum + s.open, 0);
  const totalIncidents = summary.reduce((sum, s) => sum + s.total, 0);

  const barData = summary.map((s) => ({
    name: s.severity,
    value: s.total,
    color: severityColors[s.severity],
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalIncidents}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Incidents</p>
        </div>
        {totalOpen > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            {totalOpen} open
          </span>
        )}
      </div>

      <BarList
        data={barData}
        showAnimation
        className="mt-2"
      />

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-[#252533]">
        {summary.map((s) => (
          <div key={s.severity} className="text-center">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{s.severity}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.total}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {s.open > 0 ? (
                <span className="text-red-600">{s.open} open</span>
              ) : (
                <span className="text-emerald-600">{s.resolved} resolved</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
