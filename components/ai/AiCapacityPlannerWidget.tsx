"use client";

import { BarChart } from "@tremor/react";

const resources = [
  {
    type: "CPU",
    current: 68,
    dailyGrowth: 0.3,
    threshold80: "~40 days",
    threshold90: "~73 days",
    summary: "CPU will reach 80% in ~40 days at current trajectory",
  },
  {
    type: "Memory",
    current: 74,
    dailyGrowth: 0.4,
    threshold80: "~15 days",
    threshold90: "~40 days",
    summary: "Memory will reach 80% in ~15 days — consider scaling soon",
  },
  {
    type: "Disk",
    current: 61,
    dailyGrowth: 0.2,
    threshold80: "~95 days",
    threshold90: "~145 days",
    summary: "Disk capacity healthy — no action needed for ~3 months",
  },
  {
    type: "Network",
    current: 52,
    dailyGrowth: 0.15,
    threshold80: "~187 days",
    threshold90: "~253 days",
    summary: "Network bandwidth well within limits",
  },
];

const chartData = resources.map((r) => ({
  resource: r.type,
  "Current %": r.current,
  "Headroom %": 100 - r.current,
}));

function getBarColor(current: number) {
  if (current >= 80) return "text-red-500";
  if (current >= 70) return "text-amber-500";
  return "text-green-500";
}

export default function AiCapacityPlannerWidget() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <i className="ri-sparkling-line text-blue-500" />
        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          AI Capacity Planning
        </span>
      </div>
      <BarChart
        className="h-40"
        data={chartData}
        index="resource"
        categories={["Current %"]}
        colors={["blue"]}
        valueFormatter={(v) => `${v}%`}
        showLegend={false}
        showGridLines={false}
      />
      <div className="space-y-3">
        {resources.map((r) => (
          <div key={r.type} className="flex items-start gap-2">
            <div className={`mt-1 ${getBarColor(r.current)}`}>
              <i className="ri-database-2-line text-sm" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {r.type}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {r.current}% used · +{r.dailyGrowth}%/day
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                80% in {r.threshold80} · 90% in {r.threshold90}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                {r.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Powered by watsonx.ai
      </p>
    </div>
  );
}
