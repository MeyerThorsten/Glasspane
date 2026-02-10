"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getCurrentSla, getSlaHistory } from "@/lib/services/kpi-service";
import { DonutChart } from "@tremor/react";
import { MonthlySla } from "@/types";

export default function SlaComplianceGauge() {
  const { customer } = useCustomer();
  const [currentSla, setCurrentSla] = useState<number | null>(null);
  const [history, setHistory] = useState<MonthlySla[]>([]);

  useEffect(() => {
    if (!customer) return;
    getCurrentSla(customer.id).then(setCurrentSla);
    getSlaHistory(customer.id).then(setHistory);
  }, [customer]);

  if (currentSla === null) return null;

  const target = 99.999;
  const gap = Math.max(0, target - currentSla);
  const compliant = currentSla;

  const chartData = [
    { name: "Compliant", value: compliant },
    { name: "Gap", value: gap > 0 ? gap : 0.001 },
  ];

  const meetsTarget = currentSla >= target;
  const lastThree = history.slice(-3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{currentSla.toFixed(3)}%</p>
          <p className="text-xs text-gray-500 mt-1">
            Target: {target}% {meetsTarget ? (
              <span className="text-emerald-600 font-medium">Met</span>
            ) : (
              <span className="text-red-600 font-medium">Below target</span>
            )}
          </p>
        </div>
        <div className="w-32 h-32">
          <DonutChart
            data={chartData}
            category="value"
            index="name"
            colors={meetsTarget ? ["emerald", "gray"] : ["amber", "gray"]}
            showAnimation
            showTooltip={false}
            showLabel={false}
            variant="pie"
          />
        </div>
      </div>

      {lastThree.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Recent Months</p>
          <div className="grid grid-cols-3 gap-2">
            {lastThree.map((m) => (
              <div key={m.month} className="text-center">
                <p className="text-xs text-gray-400">{m.month}</p>
                <p className={`text-sm font-semibold ${m.availability >= m.target ? "text-emerald-600" : "text-amber-600"}`}>
                  {m.availability.toFixed(3)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
