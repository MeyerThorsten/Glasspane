import type { AiCostForecastResponse } from "@/types";

export function mockGenerateCostForecast(): AiCostForecastResponse {
  return {
    summary:
      "At the current run rate, monthly cost is likely to move above budget within the next quarter, with cloud growth remaining the main pressure point.",
    history: [
      { month: "Jan 2026", Actual: 132000, Budget: 145000 },
      { month: "Feb 2026", Actual: 136500, Budget: 145000 },
      { month: "Mar 2026", Actual: 140800, Budget: 145000 },
    ],
    forecast: [
      { month: "Apr 2026", Projected: 142000, Optimistic: 138000, Pessimistic: 148000, Budget: 145000 },
      { month: "May 2026", Projected: 149000, Optimistic: 143000, Pessimistic: 157000, Budget: 145000 },
      { month: "Jun 2026", Projected: 155000, Optimistic: 147000, Pessimistic: 165000, Budget: 145000 },
    ],
    generatedAt: new Date().toISOString(),
  };
}
