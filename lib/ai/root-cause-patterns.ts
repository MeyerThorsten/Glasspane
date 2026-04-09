import type { AiRootCausePatternsResponse } from "@/types";
import { createAiCache } from "./cache";
import { executeTextForTask, getPrimaryProviderForTask } from "./router";
import { gatherRootCausePatternsContext } from "./gather-root-cause-patterns-context";
import { buildRootCausePatternsMessages } from "./root-cause-patterns-prompts";
import { parseRootCausePatternsResponse } from "./parse-root-cause-patterns";

const rootCausePatternsCache = createAiCache<AiRootCausePatternsResponse>("root-cause-patterns");
const CACHE_TTL = 10 * 60 * 1000;

export async function generateRootCausePatterns(customerId: string): Promise<AiRootCausePatternsResponse> {
  const cacheKey = `${getPrimaryProviderForTask("root-cause-patterns")}|${customerId}`;
  return rootCausePatternsCache.remember(cacheKey, CACHE_TTL, async () => {
    const context = await gatherRootCausePatternsContext(customerId);
    const messages = buildRootCausePatternsMessages(context);
    const result = await executeTextForTask("root-cause-patterns", {
      messages,
      maxTokens: 350,
      temperature: 0.2,
      metadata: { customerId },
    });

    const data = parseRootCausePatternsResponse(result.text);
    data.providerLabel = result.providerLabel;
    return data;
  });
}
