import type { AiInsightsResponse } from "@/types";
import { createAiCache } from "./cache";
import { buildInsightsMessages } from "./insights-prompts";
import { gatherInsightsContext } from "./gather-insights-context";
import { parseInsightsResponse } from "./parse-insights";
import { executeTextForTask, getPrimaryProviderForTask } from "./router";

const insightsCache = createAiCache<AiInsightsResponse>("insights");
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function generateInsights(customerId: string): Promise<AiInsightsResponse> {
  const cacheKey = `${getPrimaryProviderForTask("insights")}|${customerId}`;
  return insightsCache.remember(cacheKey, CACHE_TTL, async () => {
    const context = await gatherInsightsContext(customerId);
    const messages = buildInsightsMessages(context);
    const result = await executeTextForTask("insights", {
      messages,
      maxTokens: 350,
      temperature: 0.2,
      metadata: { customerId },
    });
    const data = parseInsightsResponse(result.text);
    data.providerLabel = result.providerLabel;
    return data;
  });
}
