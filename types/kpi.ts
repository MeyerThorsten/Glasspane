export interface KpiSnapshot {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
  category: string;
}

export interface MonthlySla {
  month: string;
  availability: number;
  target: number;
}

export interface CostBreakdown {
  category: string;
  currentMonth: number;
  previousMonth: number;
  budget: number;
}

export interface RiskScore {
  overall: number;
  high: number;
  medium: number;
  low: number;
  trend: "up" | "down" | "stable";
}
