"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { useCustomer } from "@/lib/customer-context";

const recommendations = [
  {
    id: "rightsize-vms",
    icon: "ri-cpu-line",
    title: "Right-size 3 underutilized VMs",
    description: "Current CPU <20% across 3 instances. Downsize to save without performance impact.",
    savings: 2400,
    impact: "€2,400/mo",
    impactColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    id: "auto-scaling",
    icon: "ri-scales-3-line",
    title: "Enable auto-scaling for web tier",
    description: "Peak 89% detected. Auto-scaling prevents SLA impact during traffic spikes.",
    savings: 0,
    impact: "SLA Risk",
    impactColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    id: "archive-storage",
    icon: "ri-archive-line",
    title: "Archive 42TB cold storage data",
    description: "Not accessed in 90+ days. Migration to archive tier reduces storage costs.",
    savings: 1800,
    impact: "€1,800/mo",
    impactColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    id: "consolidate-monitoring",
    icon: "ri-eye-line",
    title: "Consolidate monitoring tools",
    description: "3 overlapping monitoring services detected. Single-pane consolidation saves costs.",
    savings: 3200,
    impact: "€3,200/mo",
    impactColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    id: "reserved-instances",
    icon: "ri-instance-line",
    title: "Switch to reserved instances",
    description: "5 on-demand instances with stable usage patterns. Reserved pricing saves significantly.",
    savings: 1400,
    impact: "€1,400/mo",
    impactColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
];

type RecState = "default" | "accepted" | "dismissed";

function getStorageKey(customerId: string) {
  return `optimization-state:${customerId}`;
}

export default function OptimizationWidget() {
  const { customer } = useCustomer();
  const [states, setStates] = useState<Record<string, RecState>>({});
  const restoreStates = useEffectEvent((nextStates: Record<string, RecState>) => {
    startTransition(() => {
      setStates(nextStates);
    });
  });

  useEffect(() => {
    if (!customer) return;
    try {
      const saved = localStorage.getItem(getStorageKey(customer.id));
      if (saved) restoreStates(JSON.parse(saved));
      else restoreStates({});
    } catch {
      restoreStates({});
    }
  }, [customer]);

  function updateState(id: string, state: RecState) {
    setStates((prev) => {
      const next = { ...prev, [id]: state };
      if (customer) {
        localStorage.setItem(getStorageKey(customer.id), JSON.stringify(next));
      }
      return next;
    });
  }

  const totalAnnualSavings = recommendations.reduce((sum, r) => sum + r.savings, 0) * 12;

  // Sort: default first, accepted second, dismissed last
  const sortOrder: Record<RecState, number> = { default: 0, accepted: 1, dismissed: 2 };
  const sorted = [...recommendations].sort(
    (a, b) => (sortOrder[states[a.id] || "default"]) - (sortOrder[states[b.id] || "default"])
  );

  return (
    <div className="space-y-3">
      {/* AI badge + savings summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="ri-sparkling-line text-blue-500" />
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            AI-Powered
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            €{totalAnnualSavings.toLocaleString()}/yr
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">potential savings identified</p>
        </div>
      </div>

      {sorted.map((rec) => {
        const state = states[rec.id] || "default";
        const isDismissed = state === "dismissed";
        const isAccepted = state === "accepted";

        return (
          <div
            key={rec.id}
            className={`flex items-start gap-3 rounded-lg border p-3 transition-opacity ${
              isDismissed
                ? "border-gray-100 dark:border-[#2E2E3D] opacity-50"
                : "border-gray-100 dark:border-[#2E2E3D]"
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-magenta-50 dark:bg-[#1e1b4b] text-magenta">
              <i className={`${rec.icon} text-base`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className={`text-sm font-medium ${
                    isDismissed
                      ? "text-gray-400 line-through"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {rec.title}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${rec.impactColor}`}
                >
                  {rec.impact}
                </span>
                {isAccepted && (
                  <span className="shrink-0 flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300">
                    <i className="ri-check-line" /> In Progress
                  </span>
                )}
                {isDismissed && (
                  <span className="shrink-0 rounded-full bg-gray-100 dark:bg-[#262633] px-2 py-0.5 text-[10px] font-medium text-gray-400">
                    Dismissed
                  </span>
                )}
              </div>
              <p className={`mt-0.5 text-xs ${isDismissed ? "text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
                {rec.description}
              </p>
              {state === "default" && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => updateState(rec.id, "accepted")}
                    className="text-[10px] font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateState(rec.id, "dismissed")}
                    className="text-[10px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Analyzed on {new Date().toLocaleDateString()} · Scenario-based example
      </p>
    </div>
  );
}
