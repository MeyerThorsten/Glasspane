"use client";

import { RiArrowUpLine, RiArrowDownLine, RiSubtractLine } from "@remixicon/react";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  trendPositive?: boolean;
}

export default function KpiCard({ label, value, unit, trend, trendValue, trendPositive }: KpiCardProps) {
  const TrendIcon = trend === "up" ? RiArrowUpLine : trend === "down" ? RiArrowDownLine : RiSubtractLine;
  const trendColor = trendPositive === undefined
    ? "text-gray-500"
    : trendPositive
    ? "text-success"
    : "text-danger";

  return (
    <div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {trend && (
        <div className={`mt-1 flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {trendValue && <span>{trendValue}</span>}
        </div>
      )}
    </div>
  );
}
