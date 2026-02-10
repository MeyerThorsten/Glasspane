"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getChangeSuccessRate } from "@/lib/services/kpi-service";
import { DonutChart } from "@tremor/react";
import { RiArrowUpLine, RiArrowDownLine, RiSubtractLine } from "@remixicon/react";

export default function ChangeSuccessRate() {
  const { customer } = useCustomer();
  const [data, setData] = useState<{ rate: number; trend: string } | null>(null);

  useEffect(() => {
    if (!customer) return;
    getChangeSuccessRate(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  const chartData = [
    { name: "Success", value: data.rate },
    { name: "Failure", value: +(100 - data.rate).toFixed(1) },
  ];

  const TrendIcon =
    data.trend === "up" ? RiArrowUpLine : data.trend === "down" ? RiArrowDownLine : RiSubtractLine;
  const trendColor = data.trend === "up" ? "text-emerald-600" : data.trend === "down" ? "text-red-600" : "text-gray-500";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          colors={["emerald", "slate"]}
          className="h-40 w-40"
          showAnimation
          showLabel={false}
          showTooltip={false}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.rate}%</span>
        </div>
      </div>
      <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
        <TrendIcon className="w-4 h-4" />
        <span>{data.trend === "up" ? "Improving" : data.trend === "down" ? "Declining" : "Stable"}</span>
      </div>
    </div>
  );
}
