import type { AiRiskBriefingResponse } from "@/types";
import { createAiCache } from "./cache";
import { gatherRiskBriefingContext } from "./gather-risk-briefing-context";
import { parseRiskBriefingResponse } from "./parse-risk-briefing";
import { buildRiskBriefingMessages } from "./risk-briefing-prompts";
import { executeTextForTask, getPrimaryProviderForTask } from "./router";

const riskBriefingCache = createAiCache<AiRiskBriefingResponse>("risk-briefing");
const CACHE_TTL = 10 * 60 * 1000;

export async function generateRiskBriefing(customerId: string): Promise<AiRiskBriefingResponse> {
  const cacheKey = `${getPrimaryProviderForTask("risk-briefing")}|${customerId}`;
  return riskBriefingCache.remember(cacheKey, CACHE_TTL, async () => {
    const context = await gatherRiskBriefingContext(customerId);
    const messages = buildRiskBriefingMessages(context);
    const result = await executeTextForTask("risk-briefing", {
      messages,
      maxTokens: 250,
      temperature: 0.2,
      metadata: { customerId },
    });

    const data = parseRiskBriefingResponse(result.text);
    data.providerLabel = result.providerLabel;
    return data;
  });
}
