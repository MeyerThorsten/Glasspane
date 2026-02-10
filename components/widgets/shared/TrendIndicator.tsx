"use client";

import { RiArrowUpLine, RiArrowDownLine, RiSubtractLine } from "@remixicon/react";

interface TrendIndicatorProps {
  direction: "up" | "down" | "stable";
  value?: string;
  positive?: boolean;
}

export default function TrendIndicator({ direction, value, positive }: TrendIndicatorProps) {
  const Icon = direction === "up" ? RiArrowUpLine : direction === "down" ? RiArrowDownLine : RiSubtractLine;
  const color = positive === undefined
    ? "text-gray-500"
    : positive
    ? "text-success"
    : "text-danger";

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {value}
    </span>
  );
}
