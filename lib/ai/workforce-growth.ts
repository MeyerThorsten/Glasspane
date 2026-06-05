import type { AiWorkforceGrowthResponse } from "@/types";
import { createAiCache } from "./cache";
import { executeTextForTask, getPrimaryProviderForTask } from "./router";
import { gatherWorkforceGrowthContext } from "./gather-workforce-growth-context";
import { buildWorkforceGrowthMessages } from "./workforce-growth-prompts";
import { parseWorkforceGrowthResponse } from "./parse-workforce-growth";

const workforceGrowthCache = createAiCache<AiWorkforceGrowthResponse>("workforce-growth");
const CACHE_TTL = 10 * 60 * 1000;

export async function generateWorkforceGrowthRecommendations(
  employeeId: string,
): Promise<AiWorkforceGrowthResponse> {
  const cacheKey = `${getPrimaryProviderForTask("workforce-growth")}|${employeeId}`;
  return workforceGrowthCache.remember(cacheKey, CACHE_TTL, async () => {
    const context = await gatherWorkforceGrowthContext(employeeId);
    const messages = buildWorkforceGrowthMessages(context);
    const result = await executeTextForTask("workforce-growth", {
      messages,
      maxTokens: 450,
      temperature: 0.2,
      metadata: { employeeId },
    });

    const data = parseWorkforceGrowthResponse(result.text, employeeId);
    data.providerLabel = result.providerLabel;
    data.modelInfo = result.modelInfo;
    return data;
  });
}
