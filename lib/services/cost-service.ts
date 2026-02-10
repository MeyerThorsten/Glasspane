import { CostBreakdown } from "@/types";
import costsData from "@/data/mock/costs.json";

const data = costsData as Record<string, CostBreakdown[]>;

export async function getCostBreakdown(customerId: string): Promise<CostBreakdown[]> {
  return data[customerId] ?? [];
}
