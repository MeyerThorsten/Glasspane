"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getZeroOutageScore } from "@/lib/services/zero-outage-service";
import { CategoryBar } from "@tremor/react";
import { ZeroOutageScore as ZeroOutageScoreType } from "@/types";

export default function ZeroOutageScore() {
  const { customer } = useCustomer();
  const [data, setData] = useState<ZeroOutageScoreType | null>(null);

  useEffect(() => {
    if (!customer) return;
    getZeroOutageScore(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  const scoreColor = data.overall >= data.target
    ? "text-emerald-600"
    : data.overall >= data.target - 5
    ? "text-amber-600"
    : "text-red-600";

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <p className={`text-3xl font-bold ${scoreColor}`}>{data.overall}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">/ {data.target} target</p>
      </div>

      <div className="space-y-3">
        {data.pillars.map((pillar) => {
          const pct = Math.min(100, Math.round((pillar.score / pillar.target) * 100));
          const meetsTarget = pillar.score >= pillar.target;
          return (
            <div key={pillar.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pillar.name}</span>
                <span className={`text-sm font-semibold ${meetsTarget ? "text-emerald-600" : "text-amber-600"}`}>
                  {pillar.score} / {pillar.target}
                </span>
              </div>
              <CategoryBar
                values={[pct, 100 - pct]}
                colors={meetsTarget ? ["emerald", "gray"] : ["amber", "gray"]}
                showLabels={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
