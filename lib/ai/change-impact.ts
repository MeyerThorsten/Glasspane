import type { AiChangeImpactResponse } from "@/types";
import { createAiCache } from "./cache";
import { executeTextForTask, getPrimaryProviderForTask } from "./router";
import { buildChangeImpactMessages } from "./change-impact-prompts";
import { gatherChangeImpactContext } from "./gather-change-impact-context";
import { parseChangeImpactResponse } from "./parse-change-impact";

const changeImpactCache = createAiCache<AiChangeImpactResponse>("change-impact");
const CACHE_TTL = 10 * 60 * 1000;

export async function generateChangeImpact(customerId: string): Promise<AiChangeImpactResponse> {
  const cacheKey = `${getPrimaryProviderForTask("change-impact")}|${customerId}`;
  return changeImpactCache.remember(cacheKey, CACHE_TTL, async () => {
    const context = await gatherChangeImpactContext(customerId);
    const messages = buildChangeImpactMessages(context);
    const result = await executeTextForTask("change-impact", {
      messages,
      maxTokens: 400,
      temperature: 0.2,
      metadata: { customerId },
    });

    const data = parseChangeImpactResponse(result.text);
    data.providerLabel = result.providerLabel;
    return data;
  });
}
