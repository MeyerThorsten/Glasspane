import { getCostBreakdown } from "@/lib/services/cost-service";

function formatMonthLabel(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function gatherCostForecastContext(customerId: string): Promise<string> {
  const costs = await getCostBreakdown(customerId);
  const totalCurrent = costs.reduce((sum, item) => sum + item.currentMonth, 0);
  const totalPrevious = costs.reduce((sum, item) => sum + item.previousMonth, 0);
  const totalBudget = costs.reduce((sum, item) => sum + item.budget, 0);
  const deltaPct = totalPrevious > 0
    ? (((totalCurrent - totalPrevious) / totalPrevious) * 100).toFixed(1)
    : "0.0";

  const months = Array.from({ length: 3 }, (_, index) => {
    const date = new Date();
    date.setUTCMonth(date.getUTCMonth() + index);
    return formatMonthLabel(date);
  });

  return [
    `Forecast months: ${months.join(", ")}`,
    `Total current month cost: €${totalCurrent.toFixed(0)}`,
    `Total previous month cost: €${totalPrevious.toFixed(0)}`,
    `Total monthly budget: €${totalBudget.toFixed(0)}`,
    `Month-over-month change: ${deltaPct}%`,
    ...costs.map((item) => {
      const categoryDelta = item.previousMonth > 0
        ? (((item.currentMonth - item.previousMonth) / item.previousMonth) * 100).toFixed(1)
        : "0.0";
      return `${item.category}: current €${item.currentMonth.toFixed(0)}, previous €${item.previousMonth.toFixed(0)}, budget €${item.budget.toFixed(0)}, change ${categoryDelta}%`;
    }),
  ].join("\n");
}
