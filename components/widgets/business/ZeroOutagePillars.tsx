"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getZeroOutageScore } from "@/lib/services/zero-outage-service";
import { ZeroOutageScore } from "@/types";

export default function ZeroOutagePillars() {
  const { customer } = useCustomer();
  const [data, setData] = useState<ZeroOutageScore | null>(null);

  useEffect(() => {
    if (!customer) return;
    getZeroOutageScore(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  return (
    <div className="space-y-6">
      {data.pillars.map((pillar) => {
        const meetsTarget = pillar.score >= pillar.target;
        return (
          <div key={pillar.name}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{pillar.name}</h4>
              <span className={`text-sm font-bold ${meetsTarget ? "text-emerald-600" : "text-amber-600"}`}>
                {pillar.score}%
                <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">/ {pillar.target}%</span>
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-100 dark:bg-[#262633] rounded-full h-2.5 relative">
              <div
                className={`h-2.5 rounded-full ${meetsTarget ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${pillar.score}%` }}
              />
              <div
                className="absolute top-0 w-0.5 h-2.5 bg-gray-800 dark:bg-gray-200"
                style={{ left: `${pillar.target}%` }}
                title={`Target: ${pillar.target}%`}
              />
            </div>
            <div className="mt-2 space-y-1">
              {pillar.metrics.map((metric) => (
                <div key={metric.name} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{metric.name}</span>
                  <span className={`font-medium ${metric.value >= metric.target ? "text-emerald-600" : "text-amber-600"}`}>
                    {metric.value}{metric.unit === "%" || metric.unit === "hrs" ? ` ${metric.unit}` : metric.unit}
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">/ {metric.target} {metric.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
