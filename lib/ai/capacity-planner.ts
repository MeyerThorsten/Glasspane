import type { AiCapacityPlannerResponse } from "@/types";
import { createAiCache } from "./cache";
import { executeTextForTask, getPrimaryProviderForTask } from "./router";
import { buildCapacityPlannerMessages } from "./capacity-planner-prompts";
import { gatherCapacityPlannerContext } from "./gather-capacity-planner-context";
import { parseCapacityPlannerResponse } from "./parse-capacity-planner";

const capacityPlannerCache = createAiCache<AiCapacityPlannerResponse>("capacity-planner");
const CACHE_TTL = 10 * 60 * 1000;

export async function generateCapacityPlanner(customerId: string): Promise<AiCapacityPlannerResponse> {
  const cacheKey = `${getPrimaryProviderForTask("capacity-planner")}|${customerId}`;
  return capacityPlannerCache.remember(cacheKey, CACHE_TTL, async () => {
    const context = await gatherCapacityPlannerContext(customerId);
    const messages = buildCapacityPlannerMessages(context);
    const result = await executeTextForTask("capacity-planner", {
      messages,
      maxTokens: 350,
      temperature: 0.2,
      metadata: { customerId },
    });

    const data = parseCapacityPlannerResponse(result.text);
    data.providerLabel = result.providerLabel;
    return data;
  });
}
