"use client";

const changes = [
  {
    id: 1,
    title: "SAP kernel upgrade v7.89",
    riskScore: 4,
    affectedServices: ["SAP S/4HANA", "SAP BW"],
    successRate: 72,
    date: "Mar 12",
  },
  {
    id: 2,
    title: "Firewall rule update — DMZ segment",
    riskScore: 3,
    affectedServices: ["Cloud IaaS", "Managed Security"],
    successRate: 88,
    date: "Mar 13",
  },
  {
    id: 3,
    title: "Storage array firmware v4.2.1",
    riskScore: 3,
    affectedServices: ["Cloud IaaS"],
    successRate: 91,
    date: "Mar 14",
  },
  {
    id: 4,
    title: "SSL certificate rotation — web tier",
    riskScore: 2,
    affectedServices: ["Workplace Services"],
    successRate: 97,
    date: "Mar 14",
  },
  {
    id: 5,
    title: "Monitoring agent update v3.1",
    riskScore: 1,
    affectedServices: ["All Services"],
    successRate: 99,
    date: "Mar 15",
  },
];

function getRiskColor(score: number) {
  if (score >= 4) return "bg-red-500";
  if (score >= 3) return "bg-amber-500";
  if (score >= 2) return "bg-yellow-400";
  return "bg-green-500";
}

function getRiskBg(score: number) {
  if (score >= 4) return "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20";
  if (score >= 3) return "border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20";
  return "border-gray-100 dark:border-[#2E2E3D]";
}

export default function AiChangeImpactWidget() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <i className="ri-sparkling-line text-blue-500" />
        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Change Impact Analysis
        </span>
      </div>
      <div className="space-y-2">
        {changes.map((c) => (
          <div
            key={c.id}
            className={`rounded-lg border px-3 py-2.5 ${getRiskBg(c.riskScore)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${getRiskColor(c.riskScore)}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                {c.title}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{c.date}</span>
            </div>
            <div className="flex items-center gap-4 pl-4.5 text-xs text-gray-500 dark:text-gray-400">
              <span>Risk: {c.riskScore}/5</span>
              <span>Success rate: {c.successRate}%</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5 pl-4.5">
              {c.affectedServices.map((s) => (
                <span
                  key={s}
                  className="text-[10px] bg-gray-100 dark:bg-[#262633] text-gray-600 dark:text-gray-400 rounded px-1.5 py-0.5"
                >
                  {s}
                </span>
              ))}
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
