import type { AiCostForecastResponse } from "@/types";
import { createAiCache } from "./cache";
import { executeTextForTask, getPrimaryProviderForTask } from "./router";
import { gatherCostForecastContext } from "./gather-cost-forecast-context";
import { buildCostForecastMessages } from "./cost-forecast-prompts";
import { parseCostForecastResponse } from "./parse-cost-forecast";

const costForecastCache = createAiCache<AiCostForecastResponse>("cost-forecast");
const CACHE_TTL = 10 * 60 * 1000;

export async function generateCostForecast(customerId: string): Promise<AiCostForecastResponse> {
  const cacheKey = `${getPrimaryProviderForTask("cost-forecast")}|${customerId}`;
  return costForecastCache.remember(cacheKey, CACHE_TTL, async () => {
    const context = await gatherCostForecastContext(customerId);
    const messages = buildCostForecastMessages(context);
    const result = await executeTextForTask("cost-forecast", {
      messages,
      maxTokens: 350,
      temperature: 0.2,
      metadata: { customerId },
    });

    const data = parseCostForecastResponse(result.text);
    data.providerLabel = result.providerLabel;
    return data;
  });
}
