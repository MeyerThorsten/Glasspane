import { NextRequest } from "next/server";
import { generateRiskBriefing } from "@/lib/ai/risk-briefing";
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

    const access = await authorizeAiRoute(request, "risk-briefing", requestId, customerId);
    if ("response" in access) {
      return access.response;
    }

    const briefing = await generateRiskBriefing(customerId);
    logAiRoute("risk-briefing", requestId, "success", {
      durationMs: Date.now() - startedAt,
      providerLabel: briefing.providerLabel,
      customerId,
      authSubject: access.context.authSubject,
      quotaRemaining: access.context.quotaRemaining,
    });
    return aiSuccess(requestId, briefing, 200, access.context);
  } catch (error) {
    logAiRoute("risk-briefing", requestId, "error", {
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : String(error),
    });
    return aiErrorResponse(requestId, "Failed to generate risk briefing", error);
  }
}
