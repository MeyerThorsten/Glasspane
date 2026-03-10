"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getRisk } from "@/lib/services/kpi-service";
import { CategoryBar } from "@tremor/react";
import { RiskScore as RiskScoreType } from "@/types";
import TrendIndicator from "@/components/widgets/shared/TrendIndicator";

export default function RiskScore() {
  const { customer } = useCustomer();
  const [data, setData] = useState<RiskScoreType | null>(null);

  useEffect(() => {
    if (!customer) return;
    getRisk(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  const scoreColor =
    data.overall < 30
      ? "text-emerald-600"
      : data.overall < 60
      ? "text-amber-600"
      : "text-red-600";

  const total = data.high + data.medium + data.low;
  const highPct = total > 0 ? Math.round((data.high / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((data.medium / total) * 100) : 0;
  const lowPct = total > 0 ? 100 - highPct - medPct : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold ${scoreColor}`}>{data.overall}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Risk Score</p>
        </div>
        <TrendIndicator
          direction={data.trend}
          value={data.trend === "up" ? "Increasing" : data.trend === "down" ? "Decreasing" : "Stable"}
          positive={data.trend === "down"}
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Risk Distribution</span>
          <span>{total} total items</span>
        </div>
        <CategoryBar
          values={[highPct, medPct, lowPct]}
          colors={["red", "amber", "emerald"]}
          showLabels={false}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            High: {data.high}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Medium: {data.medium}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Low: {data.low}
          </span>
        </div>
      </div>
    </div>
  );
}
