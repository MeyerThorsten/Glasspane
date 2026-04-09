import { NextRequest } from "next/server";
import { generateInsights } from "@/lib/ai/insights";
import { aiErrorResponse, aiSuccess, aiValidationError, authorizeAiRoute, getAiRequestId, logAiRoute } from "@/lib/ai/route-utils";

export async function POST(request: NextRequest) {
  const requestId = getAiRequestId(request);
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId || typeof customerId !== "string") {
      return aiValidationError(requestId, "customerId is required");
    }

    const access = await authorizeAiRoute(request, "insights", requestId, customerId);
    if ("response" in access) {
      return access.response;
    }

    const insights = await generateInsights(customerId);
    logAiRoute("insights", requestId, "success", {
      durationMs: Date.now() - startedAt,
      providerLabel: insights.providerLabel,
      customerId,
      authSubject: access.context.authSubject,
      quotaRemaining: access.context.quotaRemaining,
    });
    return aiSuccess(requestId, {
      ...insights,
    }, 200, access.context);
  } catch (error) {
    logAiRoute("insights", requestId, "error", {
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : String(error),
    });
    return aiErrorResponse(requestId, "Failed to generate insights", error);
  }
}
