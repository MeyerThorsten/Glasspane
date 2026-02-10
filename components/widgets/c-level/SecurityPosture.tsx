"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getSecurityPosture } from "@/lib/services/security-service";
import { DonutChart } from "@tremor/react";
import { SecurityPosture as SecurityPostureType } from "@/types";

const severityColors: Record<string, string> = {
  critical: "red",
  high: "orange",
  medium: "amber",
  low: "blue",
};

export default function SecurityPosture() {
  const { customer } = useCustomer();
  const [data, setData] = useState<SecurityPostureType | null>(null);

  useEffect(() => {
    if (!customer) return;
    getSecurityPosture(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  const scoreColor =
    data.overallScore >= 80
      ? "text-emerald-600"
      : data.overallScore >= 60
      ? "text-amber-600"
      : "text-red-600";

  const chartData = data.vulnerabilities.map((v) => ({
    name: v.severity.charAt(0).toUpperCase() + v.severity.slice(1),
    value: v.count,
  }));

  const totalVulns = data.vulnerabilities.reduce((sum, v) => sum + v.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold ${scoreColor}`}>{data.overallScore}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Security Score</p>
        </div>
        <div className="w-32 h-32">
          <DonutChart
            data={chartData}
            category="value"
            index="name"
            colors={["red", "orange", "amber", "blue"]}
            showAnimation
            showTooltip
            showLabel={false}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Vulnerabilities ({totalVulns})
        </p>
        <div className="grid grid-cols-4 gap-2">
          {data.vulnerabilities.map((v) => (
            <div key={v.severity} className="text-center">
              <div
                className={`text-lg font-bold ${
                  v.severity === "critical"
                    ? "text-red-600"
                    : v.severity === "high"
                    ? "text-orange-600"
                    : v.severity === "medium"
                    ? "text-amber-600"
                    : "text-blue-600"
                }`}
              >
                {v.count}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{v.severity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
