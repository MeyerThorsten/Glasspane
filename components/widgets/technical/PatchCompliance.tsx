"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getPatchCompliance } from "@/lib/services/infrastructure-service";
import { DonutChart } from "@tremor/react";
import { PatchCompliance as PatchComplianceType } from "@/types";

export default function PatchCompliance() {
  const { customer } = useCustomer();
  const [data, setData] = useState<PatchComplianceType[]>([]);

  useEffect(() => {
    if (!customer) return;
    getPatchCompliance(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const totalCompliant = data.reduce((sum, d) => sum + d.compliant, 0);
  const totalNonCompliant = data.reduce((sum, d) => sum + d.nonCompliant, 0);
  const total = totalCompliant + totalNonCompliant;
  const compliancePercent = total > 0 ? ((totalCompliant / total) * 100).toFixed(1) : "0";

  const chartData = [
    { name: "Compliant", value: totalCompliant },
    { name: "Non-Compliant", value: totalNonCompliant },
  ];

  return (
    <div className="flex items-center gap-6">
      <div className="w-40 h-40">
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          colors={["emerald", "rose"]}
          showAnimation
          showTooltip
          showLabel={false}
        />
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">{compliancePercent}%</p>
        <p className="text-xs text-gray-500">Overall Compliance</p>
        <div className="space-y-1 text-xs text-gray-600">
          {data.map((d) => {
            const pct = d.total > 0 ? ((d.compliant / d.total) * 100).toFixed(0) : "0";
            return (
              <div key={d.category} className="flex justify-between gap-4">
                <span>{d.category}</span>
                <span className="font-medium">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
