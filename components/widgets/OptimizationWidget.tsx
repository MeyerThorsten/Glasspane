"use client";

const recommendations = [
  {
    icon: "ri-cpu-line",
    title: "Right-size underutilized VMs",
    description: "3 VMs running at <20% CPU. Estimated savings: EUR 2,400/month",
    impact: "EUR 2,400/mo",
    impactColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    icon: "ri-scales-3-line",
    title: "Enable auto-scaling for web tier",
    description: "Peak utilization 89% detected. Auto-scaling prevents SLA impact.",
    impact: "SLA Risk",
    impactColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    icon: "ri-archive-line",
    title: "Archive cold storage data",
    description: "42TB of data not accessed in 90+ days. Migration to archive saves EUR 1,800/month",
    impact: "EUR 1,800/mo",
    impactColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    icon: "ri-eye-line",
    title: "Consolidate monitoring tools",
    description: "3 overlapping monitoring services detected. Consolidation saves EUR 3,200/month",
    impact: "EUR 3,200/mo",
    impactColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
];

export default function OptimizationWidget() {
  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <div
          key={rec.title}
          className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-[#252533] p-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-magenta-50 dark:bg-[#2D1025] text-magenta">
            <i className={`${rec.icon} text-base`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{rec.title}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${rec.impactColor}`}>
                {rec.impact}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{rec.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
