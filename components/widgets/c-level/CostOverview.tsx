"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getCostBreakdown } from "@/lib/services/cost-service";
import { BarChart } from "@tremor/react";
import { CostBreakdown } from "@/types";
import { RiArrowUpLine, RiArrowDownLine } from "@remixicon/react";

export default function CostOverview() {
  const { customer } = useCustomer();
  const [costs, setCosts] = useState<CostBreakdown[]>([]);

  useEffect(() => {
    if (!customer) return;
    getCostBreakdown(customer.id).then(setCosts);
  }, [customer]);

  if (costs.length === 0) return <div />;

  const totalCurrent = costs.reduce((sum, c) => sum + c.currentMonth, 0);
  const totalPrevious = costs.reduce((sum, c) => sum + c.previousMonth, 0);
  const totalBudget = costs.reduce((sum, c) => sum + c.budget, 0);
  const momChange = totalPrevious > 0
    ? ((totalCurrent - totalPrevious) / totalPrevious) * 100
    : 0;
  const isUp = momChange > 0;

  const chartData = costs.map((c) => ({
    category: c.category,
    "Current Month": c.currentMonth,
    Budget: c.budget,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(totalCurrent)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Budget: {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(totalBudget)}
          </p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? "text-amber-600" : "text-emerald-600"}`}>
          {isUp ? <RiArrowUpLine className="w-4 h-4" /> : <RiArrowDownLine className="w-4 h-4" />}
          {Math.abs(momChange).toFixed(1)}% MoM
        </div>
      </div>

      <BarChart
        data={chartData}
        index="category"
        categories={["Current Month", "Budget"]}
        colors={["fuchsia", "cyan"]}
        valueFormatter={(v: number) => `${(v / 1000).toFixed(0)}k €`}
        yAxisWidth={56}
        showAnimation
        tickGap={2}
        className="h-48"
      />
    </div>
  );
}
