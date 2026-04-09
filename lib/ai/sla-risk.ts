import type { AiSlaRiskAdvisorResponse } from "@/types";
import { createAiCache } from "./cache";
import { executeTextForTask, getPrimaryProviderForTask } from "./router";
import { gatherSlaRiskContext } from "./gather-sla-risk-context";
import { parseSlaRiskResponse } from "./parse-sla-risk";
import { buildSlaRiskMessages } from "./sla-risk-prompts";

const slaRiskCache = createAiCache<AiSlaRiskAdvisorResponse>("sla-risk");
const CACHE_TTL = 10 * 60 * 1000;

export async function generateSlaRiskAdvisor(customerId: string): Promise<AiSlaRiskAdvisorResponse> {
  const cacheKey = `${getPrimaryProviderForTask("sla-risk")}|${customerId}`;
  return slaRiskCache.remember(cacheKey, CACHE_TTL, async () => {
    const context = await gatherSlaRiskContext(customerId);
    const messages = buildSlaRiskMessages(context);
    const result = await executeTextForTask("sla-risk", {
      messages,
      maxTokens: 300,
      temperature: 0.2,
      metadata: { customerId },
    });

    const data = parseSlaRiskResponse(result.text);
    data.providerLabel = result.providerLabel;
    return data;
  });
}
